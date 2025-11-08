import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const VANNA_SERVICE_URL = process.env.VANNA_SERVICE_URL || "http://localhost:8000";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Chat endpoint - forwards to FastAPI service
  app.post("/api/chat-with-data", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const response = await fetch(`${VANNA_SERVICE_URL}/generate-sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error calling Vanna service:", error);
      res.status(500).json({ 
        error: "Failed to process query",
        detail: error.message 
      });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/metrics", async (req, res) => {
    try {
      const metrics = await storage.getAnalyticsMetrics();
      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  app.get("/api/analytics/revenue-trend", async (req, res) => {
    try {
      const data = await storage.getRevenueTrend();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching revenue trend:", error);
      res.status(500).json({ error: "Failed to fetch revenue trend" });
    }
  });

  app.get("/api/analytics/top-vendors", async (req, res) => {
    try {
      const data = await storage.getTopVendors();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching top vendors:", error);
      res.status(500).json({ error: "Failed to fetch top vendors" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
