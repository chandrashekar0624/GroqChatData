from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from groq import Groq
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlparse
import re

app = FastAPI()

# Enable CORS for Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    print("WARNING: GROQ_API_KEY not set. AI chat will not work until you provide the API key.")
    client = None
else:
    client = Groq(api_key=groq_api_key)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("PGHOST"),
        port=os.getenv("PGPORT"),
        database=os.getenv("PGDATABASE"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASSWORD"),
    )

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    sql: str
    columns: list[str]
    rows: list[list]

def get_database_schema() -> str:
    """Get database schema for context"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    schema_info = """
    Database Schema:
    
    Table: vendors
    - id (varchar, primary key)
    - name (text)
    - category (text)
    - contact_email (text)
    
    Table: transactions
    - id (varchar, primary key)
    - vendor_id (varchar, foreign key to vendors.id)
    - amount (numeric)
    - description (text)
    - date (timestamp)
    
    Table: orders
    - id (varchar, primary key)
    - vendor_id (varchar, foreign key to vendors.id)
    - product_name (text)
    - quantity (integer)
    - unit_price (numeric)
    - total_amount (numeric)
    - order_date (timestamp)
    - status (text)
    """
    
    cursor.close()
    conn.close()
    
    return schema_info

def validate_sql(sql: str) -> bool:
    """Validate that SQL is a SELECT query only"""
    # Remove comments and normalize
    sql_clean = sqlparse.format(sql, strip_comments=True).strip().upper()
    
    # Check for dangerous keywords
    dangerous_keywords = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 
        'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
    ]
    
    for keyword in dangerous_keywords:
        if re.search(rf'\b{keyword}\b', sql_clean):
            return False
    
    # Must start with SELECT
    if not sql_clean.startswith('SELECT'):
        return False
    
    return True

def generate_sql(user_query: str) -> str:
    """Use Groq to generate SQL from natural language"""
    if not client:
        raise HTTPException(
            status_code=500, 
            detail="Groq API key not configured. Please set GROQ_API_KEY environment variable."
        )
    
    schema = get_database_schema()
    
    system_prompt = f"""You are a SQL expert. Generate PostgreSQL queries based on user questions.

{schema}

Rules:
1. Only generate SELECT queries
2. Use proper PostgreSQL syntax
3. Join tables when needed using vendor_id foreign keys
4. Use aggregate functions (SUM, COUNT, AVG) when appropriate
5. Format currency amounts properly
6. Use date functions for time-based queries
7. Return ONLY the SQL query, no explanations or markdown formatting
8. Use LIMIT for top N queries
9. Use ORDER BY for sorting results

Example questions and queries:
- "Show top 5 vendors by spend in last 90 days" → 
  SELECT v.name, SUM(t.amount) as total_spend, COUNT(t.id) as transaction_count
  FROM vendors v
  JOIN transactions t ON v.id = t.vendor_id
  WHERE t.date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY v.id, v.name
  ORDER BY total_spend DESC
  LIMIT 5;
"""
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            max_tokens=500,
        )
        
        sql = chat_completion.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        sql = re.sub(r'^```sql\s*\n?', '', sql)
        sql = re.sub(r'\n?```$', '', sql)
        sql = sql.strip()
        
        return sql
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating SQL: {str(e)}")

def execute_sql(sql: str) -> dict:
    """Execute SQL and return results"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute(sql)
        rows = cursor.fetchall()
        
        if not rows:
            return {"columns": [], "rows": []}
        
        columns = list(rows[0].keys())
        rows_data = [[str(row[col]) if row[col] is not None else None for col in columns] for row in rows]
        
        return {"columns": columns, "rows": rows_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL execution error: {str(e)}")
    finally:
        cursor.close()
        conn.close()

@app.post("/generate-sql", response_model=QueryResponse)
async def chat_with_data(request: QueryRequest):
    """
    Accept natural language query, generate SQL, validate, execute, and return results
    """
    try:
        # Generate SQL from natural language
        sql = generate_sql(request.query)
        
        # Validate SQL (only SELECT allowed)
        if not validate_sql(sql):
            raise HTTPException(
                status_code=400, 
                detail="Generated query is not a valid SELECT statement. Only SELECT queries are allowed for security."
            )
        
        # Execute SQL
        result = execute_sql(sql)
        
        return QueryResponse(
            sql=sql,
            columns=result["columns"],
            rows=result["rows"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "groq_configured": client is not None,
        "database_connected": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
