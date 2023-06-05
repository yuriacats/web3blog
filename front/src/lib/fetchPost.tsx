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
  await clientProxy.post.query(slug);
