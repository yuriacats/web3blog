import 'server-only';
import { z } from "zod";
const APIURL = process.env['BLOGAPI'] ?? 'localhost:8000';

interface author { name: string }
export default async function getData(): Promise<string> {
    const res = await fetch(`${APIURL}/users`, { cache: 'no-store' }).catch(() => null);
    if (res === null) {
        return "hoge";
    }

    const AuthorList: [author] = await res.json()
    console.log(AuthorList)
    const authorname = AuthorList[0].name
    return authorname;
}
const PostRawData = z.object({
    title: z.string(),
    author_id: z.number(),
    create_date: z.date(),
    post_data: z.string(),
    slug: z.string().length(20)
});
type PostRawData = z.infer<typeof PostRawData>;
const PostData = z.object({
    title: z.string(),
    slug: z.string().length(20),
    author: z.string(),
    update_date: z.date()

})
type PostData = z.infer<typeof PostData>;

export async function postData(slug: string): Promise<PostData> {

    const res = await fetch(`${APIURL}/posts/${slug}`, { cache: 'no-store' }).catch(() => null);
    const post_data = PostRawData.parse(res);
    // zodのバリデートを行う
    // author_idから読み出す処理を作る。今回はyuriaで決め打ち
    return {
        title: post_data.title,
        slug: post_data.slug,
        author: "yuria",
        update_date: post_data.create_date
    }
}
