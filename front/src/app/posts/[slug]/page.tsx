import { notFound } from "next/navigation";
import { z } from "zod";
import React, { Suspense } from "react";
import { fetchPost } from "lib/fetch_author";
const slugSchema = z.string().length(20);
const PageContents = async ({
  slug,
}: {
  slug: string;
}): Promise<React.ReactElement> => {
  console.log(`PageContents slug ${slug}`);
  const postdata = await fetchPost(slug);

  return (
    <>
      <h1>{postdata.title}</h1>
      <p>
        {postdata.author}: {postdata.updateDate.toLocaleString()}
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
