import { getAllCategories, getArticles, getArticlesForSearch } from './controller'
import express from "express";

const router = express.Router();

router.get('/categories', getAllCategories)
router.get('/articles/:catId', getArticles);
router.get('/articles/s/:catId/', getArticlesForSearch);
// router.get('/categories/search/:s', getCategoriesForSearch);

export default router