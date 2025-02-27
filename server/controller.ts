import pool from "./db";
import { Request, Response } from "express";
import { z } from "zod";
import { ANY, JWT_SECRET_KEY } from "./constants";
import {
  getArticlesParams,
  paginationSchema,
  searchSchema,
  likeArticleSchema,
  LikeArticle,
} from "./zodSchemas";
import { DatabaseError } from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("select * from types;");
    const categories = result.rows;
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    console.log(req.params);
    const params = getArticlesParams.parse(req.params);
    const { id } = params;
    const result = await pool.query(
      `select art.*,TO_CHAR(art.timestamp, 'DD/MM/YYYY, HH12:MI:SS AM') AS timestamp,i.image_url, count(distinct l.user_id) as likes, COUNT(DISTINCT CASE WHEN v.user_id IS NOT NULL THEN v.user_id::TEXT ELSE v.client_uuid::TEXT END) AS views
      from articles art 
      inner join article_types type on art.id = type.article_id 
      left join likes l on art.id = l.article_id 
      left join views v on art.id = v.article_id 
      left join images i on art.id = i.article_id
      where art.id=$1 AND i.image_type = 'hero'
      group by art.id, i.image_url;
        `,
      [id]
    );
    const article = result.rows;
    res.status(200).json({ article });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: e.errors[0].message });
    } else {
      console.error("Database Error:", e); // Log the actual error on the server
      res.status(500).json({ error: "Failed to fetch article" }); // Generic message for the client
    }
  }
};

export const getArticles = async (req: Request, res: Response) => {
  try {
    console.log(req.query);
    const pagination = paginationSchema.parse(req.query);
    const params = getArticlesParams.parse(req.params);
    const paraQuery = [];
    const { cursor = null, limit = 12 } = pagination;
    paraQuery.push(cursor, limit);
    const { id } = params;
    const any = id === ANY ? true : paraQuery.push(id) && false;

    // Fetch articles with pagination using the cursor
    const result = await pool.query(
      `select art.id, art.title, art.summary,art.timestamp, i.image_url, count(distinct l.user_id) as likes, COUNT(DISTINCT CASE WHEN v.user_id IS NOT NULL THEN v.user_id::TEXT ELSE v.client_uuid::TEXT END) AS views
        from articles art 
        inner join article_types type on art.id = type.article_id 
        left join likes l on art.id = l.article_id 
        left join views v on art.id = v.article_id 
        left join images i on art.id = i.article_id
        where ${
          any ? true : "type_id = $3"
        } and art.timestamp < COALESCE($1::timestamp,NOW()) and i.image_type='listing'
        group by art.id, i.image_url
        order by art.timestamp desc
        LIMIT $2
        `,
      paraQuery
    );

    const articles = result.rows;
    // Set the next cursor as the timestamp of the last article in the result
    const nextCursor =
      articles.length > 0 ? articles[articles.length - 1].timestamp : null;

    res.json({ articles, nextCursor });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error("Database Error:", error); // Log the actual error on the server
      res.status(500).json({ error: "Failed to fetch articles" }); // Generic message for the client
    }
  }
};

export const getArticlesForSearch = async (req: Request, res: Response) => {
  try {
    const pagination = searchSchema.parse(req.query);
    const params = getArticlesParams.parse(req.params);
    const paraQuery = [];
    const { term = "", limit = 5 } = pagination;
    if (term === "") {
      res.json({ articles: [] });
      return;
    }
    paraQuery.push(`%${term}%`, limit);
    const { id } = params;
    const any = id === ANY ? true : paraQuery.push(id) && false;

    const result = await pool.query(
      `select art.id, art.title
        from articles art
        inner join article_types type on art.id = type.article_id
        where ${any ? true : "type_id = $3"} AND art.title LIKE $1
        GROUP BY art.id
        order by art.timestamp desc
        LIMIT $2
        `,
      paraQuery
    );

    const articles = result.rows;
    res.json({ articles });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else {
      console.error("Database Error:", error); // Log the actual error on the server
      res.status(500).json({ error: "Failed to fetch articles" }); // Generic message for the client
    }
  }
};

export const likeArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if ((req as any).user) {
      const likeData: LikeArticle = likeArticleSchema.parse(req.body);
      const { artId, sessionId } = likeData;
      await pool.query(
        `
      INSERT INTO likes (article_id, session_id) VALUES ($1,$2)
    `,
        [artId, sessionId]
      );
      res.status(201).json({ message: "Liked the article." });
    } else {
      res.status(401).json({ error: "Authentication required." });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
    } else if (error instanceof DatabaseError && error.code === "23505") {
      res.status(409).json({ error: "Like already exists" });
    } else {
      res.status(500).json({ error: "Failed to add like." });
    }
  }
};

export const login = async (req: Request, res: Response):Promise<any> => {
  const { email, password } = req.body;
  try {
    // const user = await db.query("SELECT * FROM users WHERE email = $1", [
    //   email,
    // ]);

    if (email !== "yedhu.pillai3@gmail.com") {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      "$2b$10$pWXQjFuZ0FpGdqsKGrIl1.5Tn5JnbYyFPNBs9uj0CiEpsEbd8nlUy"
    );

    await new Promise((res) => setTimeout(res,2000))

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = { email: email };
    const token = jwt.sign(user, JWT_SECRET_KEY, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    return res.json({ message: "Login successful.", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
