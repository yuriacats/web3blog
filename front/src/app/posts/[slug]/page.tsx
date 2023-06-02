import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { notFound } from 'next/navigation';
import { z } from "zod";
import { postData } from "../../../lib/featch_author";
const slugName = z.object({
    slug: z.string().length(20)
});
export default function Home({ params }: Params): React.ReactNode {

    try {
        const page_name = (slugName.parse(params)).slug;
        postData(page_name);

        return (
            <main >

            </main >
        )
    } catch {
        return notFound();
    }
}
