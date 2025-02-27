import express, { Request, Response, NextFunction } from "express";
import router from "./routes";
import cors from "cors";
import path from "path";
// import { setupSessionMiddleware } from "./middlewares/sessionMiddleware";

const app = express();

async function startServer() {
  // the below function is for session based auth
  // await setupSessionMiddleware(app);

  // CORS middleware
  app.use(
    cors({
      origin: ["http://localhost:3000",'http://127.0.0.1:8080'],//"http://localhost:3000","http://127.0.0.1:8080"
      credentials: true,
    })
  );

  // JSON body parsing middleware
  app.use(express.json());

  // Static files middleware
  app.use("/images", express.static(path.join(__dirname, "images")));

  // API routes
  app.use("/api", router);

  // Error handling middleware (example - add your own logic)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
