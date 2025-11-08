# Analytics Dashboard with AI Chat

## Overview

This is a full-stack analytics dashboard application that combines data visualization with AI-powered natural language querying. The application allows users to view business metrics, vendor analytics, and revenue trends through traditional dashboards, while also enabling them to query the database using conversational natural language through an AI chat interface powered by Groq's LLM.

The system consists of a React frontend built with TypeScript and shadcn/ui components, an Express.js backend API, a FastAPI Python service for AI-powered SQL generation, and a PostgreSQL database managed through Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool

**UI Component System**: shadcn/ui (New York style) built on top of Radix UI primitives, providing accessible and customizable components with a consistent design language

**Routing**: Wouter for lightweight client-side routing between Dashboard and Chat views

**State Management**: 
- TanStack Query (React Query) for server state management with automatic caching and refetching
- React Context for theme management (light/dark mode)

**Styling**: 
- Tailwind CSS with custom design tokens defined in CSS variables
- Custom spacing primitives (2, 4, 6, 8, 12, 16 units) for consistent layout
- Dark mode support through class-based theme switching

**Data Visualization**: Recharts library for rendering revenue trends and vendor analytics charts

**Design Principles**:
- Data clarity prioritized over aesthetics
- Progressive disclosure pattern for loading states
- Trust and transparency by always showing generated SQL before execution
- Consistency with existing dashboard patterns

### Backend Architecture

**Primary API Server**: Express.js with TypeScript running on Node.js

**API Proxy Pattern**: The Express server acts as a proxy, forwarding AI chat requests to the FastAPI service while handling standard analytics endpoints directly

**Request Logging**: Custom middleware logs all API requests with duration tracking and response capture

**Session Management**: Uses connect-pg-simple for PostgreSQL-backed session storage

**Error Handling**: Centralized error handling with detailed error messages returned to client

### AI Service Architecture

**AI Service**: Separate FastAPI Python service for SQL generation from natural language queries

**LLM Integration**: Groq API with error handling for missing API keys

**SQL Generation Workflow**:
1. Accepts natural language query from user
2. Retrieves database schema dynamically from PostgreSQL
3. Constructs prompt with schema context for LLM
4. Generates SQL query using Groq's language model
5. Executes SQL against PostgreSQL database
6. Returns formatted results with columns and rows

**Database Schema Inspection**: Dynamically fetches table structures, column names, and data types to provide accurate context to the LLM

**SQL Parsing and Validation**: Uses sqlparse library for SQL formatting

### Data Layer

**ORM**: Drizzle ORM for type-safe database operations

**Database Schema**:
- **users**: User authentication (id, username, password)
- **vendors**: Vendor information (id, name, category, contactEmail)
- **transactions**: Financial transactions (id, vendorId, amount, description, date)
- **orders**: Product orders (id, vendorId, productName, quantity, unitPrice, totalAmount, orderDate)

**Schema Validation**: Drizzle-Zod integration for runtime schema validation using Zod

**Database Migrations**: Managed through Drizzle Kit with migrations stored in `/migrations` directory

**Seed Data**: JSON-based test data in `/data/Analytics_Test_Data.json` with seeding script for initial database population

### Build and Development

**Development Mode**: Vite dev server with HMR (Hot Module Replacement), integrated with Express through middleware mode

**Production Build**: 
- Frontend: Vite bundles React app to static assets
- Backend: esbuild bundles Express server to ESM format

**TypeScript Configuration**: Strict mode enabled with path aliases for clean imports (@/, @shared/, @assets/)

**Monorepo Structure**:
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript types and schemas
- `/services/vanna` - FastAPI AI service

## External Dependencies

### Third-Party Services

**Groq AI API**: Cloud-based LLM service for natural language to SQL generation
- Requires GROQ_API_KEY environment variable
- Used for processing natural language queries and generating SQL
- Gracefully degrades when API key not configured

**Neon PostgreSQL**: Serverless PostgreSQL database
- Uses @neondatabase/serverless package for connection pooling
- Requires DATABASE_URL environment variable
- WebSocket support configured for Neon's architecture

### Development Tools

**Replit Integration**: 
- vite-plugin-runtime-error-modal for enhanced error overlay
- vite-plugin-cartographer for development navigation
- vite-plugin-dev-banner for development environment indicator

### Key NPM Packages

**Frontend**:
- @radix-ui/* - Accessible component primitives (accordion, dialog, dropdown, tooltip, etc.)
- @tanstack/react-query - Server state management
- recharts - Data visualization charts
- wouter - Lightweight routing
- date-fns - Date manipulation
- class-variance-authority, clsx, tailwind-merge - Utility styling

**Backend**:
- drizzle-orm - Type-safe ORM
- drizzle-zod - Schema validation
- ws - WebSocket support for Neon
- connect-pg-simple - Session storage
- nanoid - Unique ID generation

**Python Service**:
- fastapi - Python web framework
- groq - Groq AI SDK
- psycopg2 - PostgreSQL adapter
- sqlparse - SQL formatting
- pydantic - Data validation

### Database

**PostgreSQL** (via Neon serverless):
- Connection pooling configured through @neondatabase/serverless
- Schema managed through Drizzle ORM
- Supports standard PostgreSQL features and SQL queries
- Environment variables required: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

## Recent Changes

### November 8, 2025: Groq AI Chat Setup Completed

Successfully completed the full Groq AI chat integration:

**Setup Tasks Completed**:
- PostgreSQL database provisioned and configured
- Database schema applied via Drizzle ORM (`npm run db:push`)
- Analytics test data seeded from `data/Analytics_Test_Data.json` (7 vendors, 10 transactions, 15 orders)
- Node.js and Python dependencies installed
- GROQ_API_KEY environment variable configured

**Running Services**:
- Express dev server on port 5000 (serves frontend + API endpoints)
- FastAPI AI service on port 8000 (handles natural language to SQL conversion)

**Verified Functionality**:
- Chat with Data feature fully operational
- Test query "Top 5 vendors by spend in last 90 days" successfully:
  - Converted to SQL by Groq LLM
  - Executed against PostgreSQL database
  - Returned accurate results (Acme Corp: $15,600, TechSupply: $15,200, etc.)
- End-to-end flow: React UI → Express API → FastAPI service → PostgreSQL → Results display

**Environment Variables Set**:
- `GROQ_API_KEY` - For Groq AI API access
- `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` - For PostgreSQL connection