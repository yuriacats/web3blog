import { notFound } from "next/navigation";
import { z } from "zod";
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

  return (
    <>
      <h1>{post.title}</h1>
      <p>
        {post.author}: {post.updateDate.toLocaleString()}
      </p>
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
