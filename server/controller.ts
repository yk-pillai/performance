import pool from "./db";
import { Request, Response } from "express";
import { z } from "zod";

const ANY = "00000000-0000-0000-0000-000000000000";

const paginationSchema = z.object({
  cursor: z.preprocess(
    (arg) => (arg === "" ? null : arg),
    z
      .string()
      .nullable()
      .refine(
        (val) => {
          if (val === null) return true;
          const timestamp = new Date(val);
          return !isNaN(timestamp.getTime());
        },
        {
          message: "Invalid cursor format. Must be a valid ISO 8601 timestamp.",
        }
      )
      .optional()
  ),
  limit: z.coerce.number({ message: "The limit is invalid." }).optional(),
});

const searchSchema = z.object({
  term: z.string(),
  limit: z.coerce.number({ message: "The limit is invalid." }).optional(),
});

const getArticlesParams = z.object({
  catId: z.string().uuid({ message: "Invalid category id." }),
});

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("select * from types;");
    const categories = result.rows;
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getArticles = async (req: Request, res: Response) => {
  console.log(req.query);
  try {
    const pagination = paginationSchema.parse(req.query);
    const params = getArticlesParams.parse(req.params);
    const paraQuery = [];
    const { cursor = null, limit = 12 } = pagination;
    paraQuery.push(cursor, limit);
    const { catId } = params;
    const any = catId === ANY ? true : paraQuery.push(catId) && false;

    // Fetch articles with pagination using the cursor
    const result = await pool.query(
      `select art.id, art.title, art.summary,art.timestamp, i.image_url, count(distinct l.session_id) as likes, count(distinct v.session_id) as views
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
      return
    }
    paraQuery.push(`%${term}%`, limit);
    const { catId } = params;
    const any = catId === ANY ? true : paraQuery.push(catId) && false;

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
