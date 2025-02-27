import { z } from "zod";

export const paginationSchema = z.object({
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

export const searchSchema = z.object({
  term: z.string(),
  limit: z.coerce.number({ message: "The limit is invalid." }).optional(),
});

export const getArticlesParams = z.object({
  id: z.string().uuid({ message: "Invalid category id." }),
});

export const likeArticleSchema = z.object({
  artId: z.string().uuid(),
  sessionId: z.string().uuid(),
});

export type LikeArticle = z.infer<typeof likeArticleSchema>;
