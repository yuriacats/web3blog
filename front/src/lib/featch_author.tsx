import 'server-only';
const APIURL = process.env.BLOGAPI || 'http://backend:8000';
type author = { name: string }
export default async function getData(): Promise<string> {
    const res = await fetch(`${APIURL}/users`, { cache: 'no-store' }).catch(() => null);
    if (res === null) {
        return "hoge";
    }

    const AuthorList: [author] = await res.json()
    console.log("pi!yo!")
    const authorname = AuthorList.toString()
    console.log("ppppp!")
    return authorname;
}
