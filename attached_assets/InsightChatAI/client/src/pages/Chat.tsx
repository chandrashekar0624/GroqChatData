import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import SqlDisplay from "@/components/SqlDisplay";
import ResultsTable from "@/components/ResultsTable";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    sql: string;
    columns: string[];
    rows: any[][];
  } | null>(null);
  const { toast } = useToast();

  const exampleQueries = [
    "Show top 5 vendors by spend in last 90 days",
    "What is the total revenue for this month?",
    "List all orders from the past week",
    "Which products have the highest margins?",
  ];

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    
    try {
      const response = await fetch("/api/chat-with-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.error || "Failed to process query");
      }

      const data = await response.json();
      
      setResponse({
        sql: data.sql,
        columns: data.columns,
        rows: data.rows,
      });

      toast({
        title: "Query executed successfully",
        description: "Your results are ready to view below.",
      });
    } catch (error: any) {
      console.error("Error submitting query:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1" data-testid="text-page-title">AI Chat</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about your data in natural language
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                placeholder="Ask a question about your data..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px] resize-none pr-12"
                disabled={loading}
                data-testid="input-query"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSubmit();
                  }
                }}
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2"
                onClick={handleSubmit}
                disabled={loading || !query.trim()}
                data-testid="button-submit-query"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {!response && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Try these example queries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {exampleQueries.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example)}
                      disabled={loading}
                      data-testid={`button-example-${index}`}
                      className="text-xs"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Generating SQL query...</p>
          </div>
        </div>
      )}

      {response && !loading && (
        <div className="space-y-6">
          <SqlDisplay sql={response.sql} />
          <ResultsTable columns={response.columns} rows={response.rows} />
        </div>
      )}
    </div>
  );
}
