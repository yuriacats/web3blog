import { connection } from "repository";
import { Author, AuthorSchema } from "interface";
import { z } from "zod";

const AuthorListSchema = z.array(AuthorSchema).length(1);
const AuthorSingletonSchema = z.tuple([AuthorSchema]);

type AuthorList = z.infer<typeof AuthorListSchema>;

export const getAuthorList = async (): Promise<AuthorList> => {
  const conn = await connection();
  const result = AuthorListSchema.parse(
    await conn.query("SELECT * FROM author")
  );
  conn.end();
  return result;
};

export const getAuthor = async (id: number): Promise<Author> => {
  const conn = await connection();
  const queryResult = await conn.query(
    "SELECT id , name FROM author WHERE id = ?;",
    [id]
  );
  conn.end();
  const author = AuthorSingletonSchema.parse(queryResult)[0];
  return author;
};
