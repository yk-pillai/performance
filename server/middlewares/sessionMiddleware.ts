/**
 * 1. Connects to redis client
 * 2. On the first API request to backend, creates a session cookie and sends a Set-Cookie header back to client.
 * 3. The browser sends the cookie back on each request.
 * 4. The session is persisted by redis.
 */

import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import { Express } from "express"; // Import Express type

declare module "express-session" {
  interface SessionData {
    isInitialized?: boolean;
  }
}

export async function setupSessionMiddleware(app: Express) {
  // Initialize Redis client.
  const redisClient = createClient({
    url: "redis://redis:6379", // Use 'redis' as the service name
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  redisClient.on("connect", () => console.log("Redis Client Connected"));
  await redisClient.connect().catch(console.error);

  // Session middleware.
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      resave: false,
      saveUninitialized: false,
      secret: "your-secret-key",
      cookie: {
        httpOnly: true,
        sameSite: "strict",
        secure: false,
        path: "/",
        maxAge: 60000,
      },
    })
  );

  // Need to add some data to the session for it to be saved in redis.
  app.use((req, res, next) => {
    if (!req.session.isInitialized) {
      req.session.isInitialized = true;
      console.log("New session initialized:", req.session.id);
    } else {
      console.log("Existing session:", req.session.id);
    }
    next();
  });
}
