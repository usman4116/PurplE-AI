/**
 * Mongoose connection helper.
 *
 * Caches the connection on `globalThis` so Next.js hot-reloads (dev) and
 * serverless cold-starts (prod) don't open redundant connections.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend globalThis with our cache key.
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis._mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalThis._mongooseCache) {
  globalThis._mongooseCache = cached;
}

/**
 * Connect (or return the cached connection) to MongoDB via Mongoose.
 * Safe to call from any server context — API routes, middleware, server actions.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset so the next call retries instead of returning a rejected promise.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
