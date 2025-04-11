import * as dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import router from "./routes";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { initializeRedisClient } from "./redisClient";
import compression from "compression";
// import { setupSessionMiddleware } from "./middlewares/sessionMiddleware";

const app = express();

app.use(compression({
  br: { quality: 11 }, // Enable Brotli compression with maximum quality
  gzip: false // Disable gzip, if you want to use brotli only.
}));

async function startServer() {
  await initializeRedisClient()
  // the below function is for session based auth
  // await setupSessionMiddleware(app);

  // CORS middleware
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "https://yedhukrishnan.com",
      ],
      credentials: true,
    })
  );

  // JSON body parsing middleware
  app.use(express.json());

  // Static files middleware
  if (process.env.NODE_ENV === "development") {
    app.use("/images", express.static(path.join(__dirname, "images"), {
      maxAge: '365d', // Cache for 1 year (in milliseconds: 31536000000)
      immutable: true
    }));
  } else {
    app.use("/images", express.static(path.join(__dirname, "..", "images"), {
      maxAge: '365d', // Cache for 1 year (in milliseconds: 31536000000)
      immutable: true
    }));
  }
  app.use(cookieParser());

  // set client_id to track an anonymous user
  app.use((req: Request, res: Response, next: NextFunction) => {
    let client_id = req.cookies.client_id;
    if (!client_id) {
      res.cookie("client_id", crypto.randomUUID(), {
        httpOnly: true,
        // sameSite: "strict",
        // secure: true,
      });
    }
    next();
  });

  // API routes
  app.use("/api", router);

  app.use("/", (req, res) => {
    res.status(200).json({ message: "Performance Backend." });
  });

  // Error handling middleware (example - add your own logic)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  // Start server
  const PORT = process.env.BACKEND_PORT;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
