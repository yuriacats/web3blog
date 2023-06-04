import { connection } from "../repository";
import { Post, Slug } from "../interface";
import { z } from "zod";
import { get_author } from "./author";

// DB validate diffinision
const postRevision = z.object({
  title: z.string(),
  author: z.number(),
  create_date: z.date(),
  post_data: z.string(),
  slug: z.string().length(20),
});
const postRevisions = z.array(postRevision).min(1);

export const get_post = async (slug: Slug): Promise<Post> => {
  const conn = await connection();
  const postsQuery = postRevisions
    .parse(
      await conn.query(
        ` SELECT title, author_id, create_date, post_data,slug 
        FROM post_revision JOIN post ON post_revision.post_id=post.id 
        WHERE slug= ? ORDER BY create_date DESC limit 1;
         `,
        [slug]
      )
    )
    // これsortとして成り立ってる？
    .sort((l, r) => (l.create_date > r.create_date ? 1 : -1));
  const target_post = postRevision.parse(postsQuery[0]);
  const author_name = (await get_author(target_post.author)).name;

  const result = {
    title: target_post.title,
    author: author_name,
    update_date: new Date().getTime(),
    create_date: new Date().getTime(),
    content: target_post.post_data,
  };
  return result;
};
