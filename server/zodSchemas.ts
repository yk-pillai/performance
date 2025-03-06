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

export const userActivityParams = getArticlesParams;

export const likeArticleSchema = z.object({
  artId: z.string().uuid({ message: "Invalid category id." }),
});

export const viewArticleSchema = likeArticleSchema;

export type LikeArticle = z.infer<typeof likeArticleSchema>;

export const SignupSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .refine((value) => /^[a-zA-Z0-9-]+$/.test(value), {
        message: "Username can only contain letters, numbers, and hyphens.",
      }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((value) => /[a-z]/.test(value), {
        message: "Password must contain at least one lowercase letter.",
      })
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain at least one number.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
