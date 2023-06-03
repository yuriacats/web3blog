import { notFound } from 'next/navigation';
import { z } from "zod";
import React, { Suspense } from "react";
import { postData } from "lib/fetch_author";
const slugSchema = z.string().length(20)
const PageContents = async ({ slug }: { slug: string }): Promise<React.ReactElement> => {
    console.log(`PageContents slug ${slug}`)
    const postdata = await postData(slug);

    return (
        <>
            <h1>
                {postdata.title}
            </h1>
            <p>
                {postdata.author}: {postdata.update_date.toString()}
            </p>
        </>
    )

}

export default function Home({ params }: { params: { slug: string } }): React.ReactNode {

    try {
        const page_name = slugSchema.parse(params.slug);

        return (
            <main >
                <Suspense fallback={<></>}>
                    {/* @ts-expect-error Async Server Component */}
                    <PageContents slug={page_name} />
                </Suspense>
            </main >
        )
    } catch {
        return notFound();
    }
}
