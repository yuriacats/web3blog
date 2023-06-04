import { connection } from "repository";
import { Post, Slug } from "interface";
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
    .sort((l, r) => (l.create_date > r.create_date ? 1 : -1));
  const SluggedRevision = nonEmptySluggedRevisions[0];
  const authorName = (await getAuthor(SluggedRevision.author_id)).name;
  const firstPostRevision = nonEmptySluggedRevisions.slice(-1)[0];
  if (firstPostRevision === undefined) {
    throw new Error();
  }
  const createPostDate = firstPostRevision.create_date;
  const result = {
    title: SluggedRevision.title,
    author: authorName,
    updateDate: SluggedRevision.create_date,
    createDate: createPostDate,
    content: SluggedRevision.post_data,
  };
  return result;
};
