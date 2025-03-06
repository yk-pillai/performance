import {
  getAllCategories,
  getArticles,
  getArticlesForSearch,
  getArticle,
  likeArticle,
  login,
  viewArticle,
  sendLikeCountUpdate,
  getUserActivity,
  signup,
} from "./controller";
import express from "express";
import { authenticateToken } from "./middlewares/jwtAuthMiddleware";

const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/articles/:id", authenticateToken, getArticles);
router.get("/articles/s/:id", getArticlesForSearch);
router.get("/article/:id", authenticateToken, getArticle);
router.get("/sse/like-count/:id", sendLikeCountUpdate);
router.post("/article/like", authenticateToken, likeArticle);
router.post("/article/view", authenticateToken, viewArticle);
router.get("/user/activity/:id", authenticateToken, getUserActivity);
router.post("/login", login);
router.post("/signup", signup);

export default router;
