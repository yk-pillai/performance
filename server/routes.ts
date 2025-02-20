import { getAllCategories, getArticles, getArticlesForSearch, getArticle } from './controller'
import express from "express";

const router = express.Router();

router.get('/categories', getAllCategories)
router.get('/articles/:id', getArticles);
router.get('/articles/s/:id', getArticlesForSearch);
router.get('/article/:id', getArticle);

export default router