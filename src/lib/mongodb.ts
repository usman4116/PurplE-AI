/**
 * MongoDB native client connection for NextAuth adapter & direct queries.
 *
 * In serverless environments every module-level value is re-evaluated on each
 * cold start, so we cache the client promise on `globalThis` to re-use
 * connections across invocations and hot reloads in development.
 */

import { MongoClient, type MongoClientOptions } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

const options: MongoClientOptions = {};

// Extend globalThis so TypeScript is happy with the cache key.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, re-use the same promise across hot reloads.
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, options);
    globalThis._mongoClientPromise = client.connect();
  }
  clientPromise = globalThis._mongoClientPromise;
} else {
  // In production a new client is fine — Lambda instances are long-lived.
  const client = new MongoClient(MONGODB_URI, options);
  clientPromise = client.connect();
}

export default clientPromise;
