import * as mysql from "promise-mysql";

const sqlUser = process.env["SQL_USER"];
const sqlPassword = process.env["SQL_PASSWORD"];
const sqlHost = process.env["SQL_HOST"];

export const connection = async (): Promise<mysql.Connection> => {
  const connection = await mysql.createConnection({
    host: sqlHost,
    user: sqlUser,
    password: sqlPassword,
    database: "webblog",
    multipleStatements: true,
  });
  return connection;
};
