import { notFound } from "next/navigation";
import { z } from "zod";
import React, { Suspense } from "react";
import { postData } from "lib/fetch_author";
const slugSchema = z.string().length(20);
const PageContents = async ({
  slug,
}: {
  slug: string;
}): Promise<React.ReactElement> => {
  console.log(`PageContents slug ${slug}`);
  const postdata = await postData(slug);

  return (
    <>
      <h1>{postdata.title}</h1>
      <p>
        {postdata.author}: {postdata.update_date.toString()}
      </p>
    </>
  );
};

export default function Home({
  params,
}: {
  params: { slug: string };
}): React.ReactNode {
  const slug_parse_result = slugSchema.safeParse(params.slug);
  if (!slug_parse_result.success) {
    return notFound();
  }

  return (
    <main>
      <Suspense fallback={<></>}>
        {/* @ts-expect-error Async Server Component */}
        <PageContents slug={slug_parse_result.data} />
      </Suspense>
    </main>
  );
}
