import { connection } from "../repositories";
import { Post, Slug } from "../interface";
import { z } from "zod";
import { getAuthor } from "./author";

const sluggedRevisionSchema = z.object({
  title: z.string(),
  author_id: z.number(),
  create_date: z.date(),
  post_data: z.string(),
  slug: z.string().length(20),
});
const nonEmptySluggedRevisionsSchema = z
  .tuple([sluggedRevisionSchema])
  .rest(sluggedRevisionSchema);

export const fetchPost = async (slug: Slug): Promise<Post> => {
  const conn = await connection();
  const postsQuery = await conn.query(
    ` SELECT title, author_id, post_revision.create_date, post_data,slug 
        FROM post_revision JOIN post ON post_revision.post_id=post.id 
        WHERE slug= ? ;
         `,
    [slug]
  );
  const nonEmptySluggedRevisions = nonEmptySluggedRevisionsSchema
    .parse(postsQuery)
    // これsortとして成り立ってる？
    .sort((l, r) => (l.create_date > r.create_date ? 1 : -1));
  const targetPost = nonEmptySluggedRevisions[0];
  const authorName = (await getAuthor(targetPost.author_id)).name;
  console.log(targetPost.create_date);
  const firstPost = nonEmptySluggedRevisions.slice(-1)[0];
  if (firstPost === undefined) {
    throw new Error();
  }
  const createPostDate = firstPost.create_date;
  const result = {
    title: targetPost.title,
    author: authorName,
    updateDate: targetPost.create_date,
    createDate: createPostDate,
    content: targetPost.post_data,
  };
  return result;
};
