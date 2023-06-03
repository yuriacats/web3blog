import express from "express";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { Author } from "./interface";
import { get_author } from "./repository";
const port = process.env["PORT"] ?? 8000;

const app: express.Express = express();
const createContext = (
  _: trpcExpress.CreateExpressContextOptions
): object => ({});
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  // ここで関数呼び出しして実行結果のRerutnをそのまま渡す。
  getAuthor: t.procedure.query(async (): Promise<Author> => await get_author()),
});

app.use(
  (_: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  }
);

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
app.listen(port, () => {
  console.log(`start on port ${port}`);
});

// 旧式のエンドポイントフロントの削除が終わり次第エンドポイントを削除する
import * as mysql from "promise-mysql";
const sql_user = process.env["SQL_USER"];
const sql_password = process.env["SQL_PASSWORD"];
const sql_host = process.env["SQL_HOST"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

interface post_raw {
  title: string;
  author: number;
  create_date: number;
  post_data: string;
}
interface author {
  id: number;
  name: string;
}
app.get("/users", async (_: express.Request, res: express.Response) => {
  const conn = await connection();
  const result = await conn.query<author>("SELECT * FROM author");
  conn.end();
  await res.json(result);
});
app.get(
  "/posts/:id",
  async (req: express.Request, res: express.Response): Promise<void> => {
    const conn = await connection();
    const postData: post_raw = await conn.query<post_raw>(`
    SELECT title, author_id, create_date, post_data,slug 
    FROM post_revision JOIN post ON post_revision.post_id=post.id 
    WHERE slug='${req.params["id"]}' ORDER BY create_date DESC limit 1;
    `);
    conn.end();
    await res.json(postData);
  }
);
