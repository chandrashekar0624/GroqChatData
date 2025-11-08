import { db } from "./db";
import { vendors, transactions, orders } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Read the analytics test data
    const dataPath = path.join(process.cwd(), "data", "Analytics_Test_Data.json");
    const rawData = await fs.readFile(dataPath, "utf-8");
    const testData = JSON.parse(rawData);

    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(orders);
    await db.delete(transactions);
    await db.delete(vendors);

    // Insert vendors
    console.log("Inserting vendors...");
    const vendorRecords = await db.insert(vendors).values(
      testData.vendors.map((v: any) => ({
        name: v.name,
        category: v.category,
        contactEmail: v.contactEmail,
      }))
    ).returning();

    console.log(`Inserted ${vendorRecords.length} vendors`);

    // Create a mapping of vendor names to IDs
    const vendorMap = new Map(vendorRecords.map(v => [v.name, v.id]));

    // Insert transactions
    console.log("Inserting transactions...");
    const transactionRecords = await db.insert(transactions).values(
      testData.transactions.map((t: any) => {
        const date = new Date();
        date.setDate(date.getDate() - t.daysAgo);
        
        return {
          vendorId: vendorMap.get(t.vendorName)!,
          amount: t.amount,
          description: t.description,
          date: date,
        };
      })
    ).returning();

    console.log(`Inserted ${transactionRecords.length} transactions`);

    // Insert orders
    console.log("Inserting orders...");
    const orderRecords = await db.insert(orders).values(
      testData.orders.map((o: any) => {
        const date = new Date();
        date.setDate(date.getDate() - o.daysAgo);
        
        const unitPrice = parseFloat(o.unitPrice);
        const quantity = o.quantity;
        const totalAmount = (unitPrice * quantity).toFixed(2);

        return {
          vendorId: vendorMap.get(o.vendorName)!,
          productName: o.productName,
          quantity: quantity,
          unitPrice: o.unitPrice,
          totalAmount: totalAmount,
          orderDate: date,
          status: o.status,
        };
      })
    ).returning();

    console.log(`Inserted ${orderRecords.length} orders`);
    console.log("Database seed completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
