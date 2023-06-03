import * as mysql from "promise-mysql";
import { AuthorSchema, Author } from "./interface";

const sql_user = process.env["SQL_USER"];
const sql_password = process.env["SQL_PASSWORD"];
const sql_host = process.env["SQL_HOST"];

async function connection(): Promise<mysql.Connection> {
  const connection = await mysql.createConnection({
    host: sql_host,
    user: sql_user,
    password: sql_password,
    database: "webblog",
    multipleStatements: true,
  });
  return connection;
}

export const get_author = async (): Promise<Author> => {
  const conn = await connection();
  const result = await conn.query("SELECT * FROM author");
  conn.end();
  return AuthorSchema.parse(result[0]);
};
