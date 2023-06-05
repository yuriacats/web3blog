import express from "express";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { Author, Post, slug } from "./interface";
import { getAuthor } from "./repositories/author";
import superjson from "superjson";
const port = process.env["PORT"] ?? 8000;

const app: express.Express = express();
const createContext = (
  _: trpcExpress.CreateExpressContextOptions
): object => ({});
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const appRouter = t.router({
  author: t.procedure.query(async (): Promise<Author> => await getAuthor(1)),
  post: t.procedure.input(slug).query(async (req): Promise<Post> => {
    return await fetchPost(slug.parse(req.input));
  }),
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
export type AppRouter = typeof appRouter;

// 旧式のエンドポイントフロントの削除が終わり次第エンドポイントを削除する
import * as mysql from "promise-mysql";
import { fetchPost } from "./repositories/post";
const sqlUser = process.env["SQL_USER"];
const sqlPassword = process.env["SQL_PASSWORD"];
const sqlHost = process.env["SQL_HOST"];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
async function connection(): Promise<mysql.Connection> {
  const connection = await mysql.createConnection({
    host: sqlHost,
    user: sqlUser,
    password: sqlPassword,
    database: "webblog",
    multipleStatements: true,
  });
  return connection;
}

interface postRaw {
  title: string;
  author: number;
  create_date: Date;
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
    const postData: postRaw = await conn.query<postRaw>(`
    SELECT title, author_id, post_revision.create_date, post_data,slug 
    FROM post_revision JOIN post ON post_revision.post_id=post.id 
    WHERE slug='${req.params["id"]}' ORDER BY post_revision.create_date DESC limit 1;
    `);
    conn.end();
    await res.json(postData);
  }
);
