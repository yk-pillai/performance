import {
  getAllCategories,
  getArticles,
  getArticlesForSearch,
  getArticle,
  likeArticle,
  login,
  sendLikeCountUpdate,
} from "./controller";
import express from "express";
import { authenticateToken } from "./middlewares/jwtAuthMiddleware";

const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/articles/:id", getArticles);
router.get("/articles/s/:id", getArticlesForSearch);
router.get("/article/:id", getArticle);
router.get("/sse/like-count/:id", sendLikeCountUpdate);
router.post("/article/like", authenticateToken, likeArticle);
router.post("/login", login);

export default router;
