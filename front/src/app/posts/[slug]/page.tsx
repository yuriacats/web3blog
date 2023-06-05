import { notFound } from "next/navigation";
import { z } from "zod";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import { createElement } from "react";
import React, { Suspense } from "react";
import { fetchPost } from "lib/fetchPost";
const slugSchema = z.string().length(20);
const PageContents = async ({
  slug,
}: {
  slug: string;
}): Promise<React.ReactElement> => {
  console.log(`PageContents slug ${slug}`);
  const post = await fetchPost(slug);
  const HTMLcontent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeReact, { createElement })
    .process(post.content);

  return (
    <>
      <h1>{post.title}</h1>
      <p>
        {post.author}: {post.updateDate.toLocaleString()}
      </p>
      <div>{HTMLcontent.result}</div>
    </>
  );
};

export default function Home({
  params,
}: {
  params: { slug: string };
}): React.ReactNode {
  const slugParseResult = slugSchema.safeParse(params.slug);
  if (!slugParseResult.success) {
    return notFound();
  }

  return (
    <main>
      <Suspense fallback={<></>}>
        {/* @ts-expect-error Async Server Component */}
        <PageContents slug={slugParseResult.data} />
      </Suspense>
    </main>
  );
}
