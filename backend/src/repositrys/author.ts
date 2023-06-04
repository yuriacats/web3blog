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

export const get_author_list = async (): Promise<AuthorList> => {
  const conn = await connection();
  const result = AuthorListScema.parse(
    await conn.query("SELECT * FROM author")
  );
  conn.end();
  return result;
};

export const get_author = async (id: number): Promise<Author> => {
  const authorList = await get_author_list();
  const result = authorList.find((n) => n.id == id);
  return AuthorSchema.parse(result);
};
