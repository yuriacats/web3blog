import { z } from "zod";

export const AuthorSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
});

export type Author = z.infer<typeof AuthorSchema>;

export const PostSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  update_date: z.date(),
  create_date: z.date(),
  content: z.string(),
});
export type Post = z.infer<typeof PostSchema>;
