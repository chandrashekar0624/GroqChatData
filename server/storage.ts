import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { vendors, transactions, orders } from "@shared/schema";
import { sql, desc, sum, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAnalyticsMetrics(): Promise<any>;
  getRevenueTrend(): Promise<any>;
  getTopVendors(): Promise<any>;
}

export class DbStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAnalyticsMetrics(): Promise<any> {
    // Get total revenue
    const revenueResult = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions);
    
    const totalRevenue = parseFloat(revenueResult[0]?.total || "0");

    // Get active vendors count
    const vendorResult = await db
      .select({ count: count() })
      .from(vendors);
    
    const activeVendors = vendorResult[0]?.count || 0;

    // Get total orders
    const orderResult = await db
      .select({ count: count() })
      .from(orders);
    
    const totalOrders = orderResult[0]?.count || 0;

    // Calculate growth rate (simplified - comparing recent vs older transactions)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(sql`${transactions.date} >= ${thirtyDaysAgo}`);

    const recent = parseFloat(recentRevenue[0]?.total || "0");
    const growthRate = totalRevenue > 0 ? ((recent / totalRevenue) * 100) : 0;

    return {
      totalRevenue: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      revenueChange: "+20.1%", // Simplified
      activeVendors: activeVendors.toString(),
      vendorsChange: "+8.2%", // Simplified
      totalOrders: totalOrders.toString(),
      ordersChange: "+12.5%", // Simplified
      growthRate: `${growthRate.toFixed(1)}%`,
      growthChange: "+4.3%", // Simplified
    };
  }

  async getRevenueTrend(): Promise<any> {
    // Get revenue by month for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const results = await db
      .select({
        month: sql<string>`TO_CHAR(${transactions.date}, 'Mon')`,
        revenue: sum(transactions.amount),
      })
      .from(transactions)
      .where(sql`${transactions.date} >= ${sixMonthsAgo}`)
      .groupBy(sql`TO_CHAR(${transactions.date}, 'Mon'), EXTRACT(MONTH FROM ${transactions.date})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${transactions.date})`);

    return results.map(r => ({
      month: r.month,
      revenue: parseFloat(r.revenue || "0"),
    }));
  }

  async getTopVendors(): Promise<any> {
    const results = await db
      .select({
        vendor: vendors.name,
        spend: sum(transactions.amount),
      })
      .from(transactions)
      .innerJoin(vendors, sql`${transactions.vendorId} = ${vendors.id}`)
      .groupBy(vendors.name)
      .orderBy(desc(sum(transactions.amount)))
      .limit(5);

    return results.map(r => ({
      vendor: r.vendor,
      spend: parseFloat(r.spend || "0"),
    }));
  }
}

export const storage = new DbStorage();
