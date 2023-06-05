import "server-only";
import superjson from "superjson";
const APIURL = process.env["BLOGAPI"] ?? "http://localhost:8000";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "backend/src";
import type { Slug } from "./interface";
import type { Post } from "backend/src/interface";

const clientProxy = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${APIURL}/trpc`,
      async headers() {
        return {};
      },
    }),
  ],
  transformer: superjson,
});

export const fetchPost = async (slug: Slug): Promise<Post> =>
  await clientProxy.fetchPost.query(slug);

// 依存フロントエンドが無くなり次第削除する
interface author {
  name: string;
}
export default async function getData(): Promise<string> {
  const res = await fetch(`${APIURL}/users`, { cache: "no-store" }).catch(
    () => null
  );
  if (res === null) {
    return "hoge";
  }
  const AuthorList: [author] = await res.json();
  console.log(AuthorList);
  const authorname = AuthorList[0].name;
  return authorname;
}
