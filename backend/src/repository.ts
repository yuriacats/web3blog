import * as mysql from "promise-mysql";

const sql_user = process.env["SQL_USER"];
const sql_password = process.env["SQL_PASSWORD"];
const sql_host = process.env["SQL_HOST"];

export async function connection(): Promise<mysql.Connection> {
  const connection = await mysql.createConnection({
    host: sql_host,
    user: sql_user,
    password: sql_password,
    database: "webblog",
    multipleStatements: true,
  });
  return connection;
}
