import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../constants";

interface CustomRequest extends Request {
  user?: JwtPayload;
}

export function authenticateToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
      if (err) {
        req.user = undefined;
      } else {
        req.user = user as JwtPayload;
      }
    });
  }
  next();
}
