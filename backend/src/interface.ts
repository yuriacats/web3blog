import { z } from "zod";

export const slug = z.string().length(20);
export type Slug = z.infer<typeof slug>;

export const AuthorSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
});
export type Author = z.infer<typeof AuthorSchema>;

export const PostSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  updateDate: z.coerce.date(),
  createDate: z.coerce.date(),
  content: z.string(),
});
export type Post = z.infer<typeof PostSchema>;

export const WhitePostSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  content: z.string(),
});
export type WhitePost = z.infer<typeof WhitePostSchema>;
