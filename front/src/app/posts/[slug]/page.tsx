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

  return (
    <>
      <PageHead
        title={post.title}
        author={post.author}
        date={post.updateDate}
      />
      <Suspense fallback={<></>}>
        <MdToHtml md={post.content} />
      </Suspense>
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
      <PageContents slug={slugParseResult.data} />
    </main>
  );
}
