/**
 * Better Auth server configuration.
 *
 * Required env vars (client/.env.local):
 *   MONGODB_URI          — MongoDB connection string
 *   MONGODB_DB_NAME      — database name (default: restaurant)
 *   BETTER_AUTH_SECRET   — random 32+ character secret
 *   BETTER_AUTH_URL      — app URL (default: http://localhost:3000)
 */
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "restaurant";

if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is not set");
}

const client = new MongoClient(uri);
const db = client.db(dbName);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(db, { client }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  ],
  plugins: [nextCookies()],
});
