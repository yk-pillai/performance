import * as dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import router from "./routes";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { initializeRedisClient } from "./redisClient";
// import { setupSessionMiddleware } from "./middlewares/sessionMiddleware";

const app = express();

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
        "https://yedhukrishnan.com",
      ],
      credentials: true,
    })
  );

  // JSON body parsing middleware
  app.use(express.json());

  // Static files middleware
  app.use("/images", express.static(path.join(__dirname, "images")));

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
