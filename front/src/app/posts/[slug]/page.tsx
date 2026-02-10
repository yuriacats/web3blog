import { notFound } from "next/navigation";
import { z } from "zod";
import React, { Suspense } from "react";
import { fetchPost } from "lib/fetchPost";
import { MdToHtml } from "component/mdToHtml";
import { PageHead } from "component/pageHead";
const slugSchema = z.string().length(20);
const PageContents = async ({
  slug,
}: {
  slug: string;
}): Promise<React.ReactElement> => {
  const post = await fetchPost(slug);
  console.log(`[PostContents]Page title:${post.title}`);
  return (
    <>
      <PageHead
        title={post.title}
        author={post.author}
        date={post.updateDate}
      />
      <MdToHtml md={post.content} />
    </>
  );
};

export default async function Home({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactNode> {
  const resolvedParams = await params;
  console.log(`[Home]slug:${resolvedParams.slug}`);
  const slugParseResult = slugSchema.safeParse(resolvedParams.slug);
  if (!slugParseResult.success) {
    return notFound();
  }

  return (
    <main>
      <Suspense fallback={<></>}>
        <PageContents slug={slugParseResult.data} />
      </Suspense>
    </main>
  );
}
