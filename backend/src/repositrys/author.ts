import { connection } from "../repository";
import { Author, AuthorSchema } from "../interface";
import { z } from "zod";

const AuthorListScema = z.array(
  z.object({
    name: z.string(),
    id: z.number(),
  })
);
type AuthorList = z.infer<typeof AuthorListScema>;

export const getAuthorList = async (): Promise<AuthorList> => {
  const conn = await connection();
  const result = AuthorListScema.parse(
    await conn.query("SELECT * FROM author")
  );
  conn.end();
  return result;
};

export const getAuthor = async (id: number): Promise<Author> => {
  const conn = await connection();
  const result = AuthorListScema.parse(
    await conn.query("SELECT * FROM author WHERE id = ?", [id])
  );
  conn.end();
  return AuthorSchema.parse(result);
};
