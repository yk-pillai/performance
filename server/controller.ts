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
import { getRedisClient } from "./redisClient";

interface ConnectedClient {
  res: Response;
  articleId: string;
}

// Define the type of connectedClients
const connectedClients: { [key: string]: ConnectedClient } = {};

export const sendLikeCountUpdate = async (
  req: Request,
  res: Response
): Promise<any> => {
  const redisClient = getRedisClient();
  const articleId = String(req.params.id); //Ensure articleId is a string.

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const clientId = req.cookies.client_id;

  if (!clientId) {
    console.error("clientId is undefined in sendLikeCountUpdate");
    res.status(400).json({ error: "clientId is missing" });
    return;
  }

  try {
    // Store client in Redis
    await redisClient.sAdd(`article:${articleId}:clients`, clientId);
    await redisClient.hSet(`client:${clientId}`, { articleId, clientId });

    // Store the response object
    connectedClients[clientId] = { res, articleId };

    req.on("close", async () => {
      try {
        // Remove client from Redis
        await redisClient.sRem(`article:${articleId}:clients`, clientId);
        await redisClient.del(`client:${clientId}`);
        // Remove the response object
        if (connectedClients[clientId]) {
          delete connectedClients[clientId];
        }
      } catch (redisCloseError) {
        console.error("Redis error on connection close:", redisCloseError);
      }
    });
  } catch (redisError) {
    console.error(
      `Redis error in sendLikeCountUpdate (articleId: ${articleId}, clientId: ${clientId}):`,
      redisError
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function sendLikeUpdate(articleId: string, likeCount: number) {
  const redisClient = getRedisClient();
  try {
    const clientIds = await redisClient.sMembers(
      `article:${articleId}:clients`
    );
    console.log(clientIds, "clientIds");
    for (const clientId of clientIds) {
      const clientData = await redisClient.hGetAll(`client:${clientId}`);
      if (clientData && clientData.articleId === articleId) {
        const response =
          connectedClients[clientId] && connectedClients[clientId].res;
        if (response) {
          response.write(`data: ${JSON.stringify({ likeCount })}\n\n`);
        }
      }
    }
  } catch (redisError) {
    console.error("Redis error in sendLikeUpdate:", redisError);
  }
}

export const likeArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    console.log(user,'user')
    if (user) {
      const likeData = likeArticleSchema.parse(req.body);
      const { artId } = likeData;

      await pool.query(
        `INSERT INTO likes (article_id, user_id) VALUES ($1,$2)`,
        [artId, user.user_id]
      );

      // Get updated like count
      const likeCountResult = await pool.query(
        `SELECT COUNT(*) FROM likes WHERE article_id = $1`,
        [artId]
      );
      const likeCount = likeCountResult.rows[0].count;

      // Send SSE update
      await sendLikeUpdate(artId, likeCount);

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

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * from users WHERE LOWER(email) = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      result.rows[0].password_hash
    );

    await new Promise((res) => setTimeout(res, 2000));

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = {
      email,
      username: result.rows[0].username,
      user_id: result.rows[0].id,
    };
    const token = jwt.sign(user, JWT_SECRET_KEY, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    return res.json({
      message: "Login successful.",
      token,
      uname: result.rows[0].username,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
