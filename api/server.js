import { MongoClient } from "mongodb";

let client;
let clientPromise;

// Reuse the connection for speed
if (!global._mongoClientPromise) {
  client = new MongoClient(process.env.MONGO_URI);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
  // CORS setup for Vercel
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("aruhbackend");
    const leads = db.collection("leads");

    await leads.insertOne({
      ...req.body,
      created_at: new Date(),
    });

    return res.status(200).json({ message: "Form saved successfully!" });
  } catch (error) {
    console.error("DB Error:", error);
    return res.status(500).json({ error: "Database error" });
  }
}
