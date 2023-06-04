import { connection } from "../repository";
import { Post, Slug } from "../interface";
import { z } from "zod";
import { get_author } from "./author";

const sluggedRevisionSchema = z.object({
  title: z.string(),
  author_id: z.number(),
  create_date: z.date(),
  post_data: z.string(),
  slug: z.string().length(20),
});
const sluggedRevisionsSchema = z.array(sluggedRevisionSchema).min(1);

export const getPost = async (slug: Slug): Promise<Post> => {
  const conn = await connection();
  const postsQuery = sluggedRevisionsSchema
    .parse(
      await conn.query(
        ` SELECT title, author_id, post_revision.create_date, post_data,slug 
        FROM post_revision JOIN post ON post_revision.post_id=post.id 
        WHERE slug= ? ;
         `,
        [slug]
      )
    )
    .sort((l, r) => (l.create_date > r.create_date ? 1 : -1));
  const targetPost = sluggedRevisionSchema.parse(postsQuery[0]);
  const authorName = (await get_author(targetPost.author_id)).name;
  console.log(targetPost.create_date);

  const result = {
    title: targetPost.title,
    author: authorName,
    updateDate: new Date().getTime(),
    createDate: new Date().getTime(),
    content: targetPost.post_data,
  };
  return result;
};
