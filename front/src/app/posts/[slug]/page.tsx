import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { notFound } from 'next/navigation';
import { z } from "zod";
import { postData } from "../../../lib/featch_author";
import React, { Suspense } from "react";
const slugName = z.object({
    slug: z.string().length(20)
});
const PageContents = async ({ slug }: { slug: string }): Promise<React.ReactElement> => {
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

export default function Home({ params }: Params): React.ReactNode {

    try {
        const page_name = (slugName.parse(params)).slug;

        return (
            <main >
                <Suspense fallback={<></>}>
                    <PageContents slug={page_name} />
                </Suspense>


            </main >
        )
    } catch {
        return notFound();
    }
}
