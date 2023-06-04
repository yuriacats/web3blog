import { connection } from "../repositories";
import { Author, AuthorSchema } from "../interface";
import { z } from "zod";

const AuthorListSchema = z.array(AuthorSchema).length(1);

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
  const getAuthorResult = await conn.query(
    "SELECT id , name FROM author WHERE id = ?;",
    [id]
  );
  conn.end();
  const result = AuthorListSchema.parse(getAuthorResult);
  if (result[0] === undefined) {
    throw Error;
  }
  return result[0];
};
