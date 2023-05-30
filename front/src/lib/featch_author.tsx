import 'server-only';
const APIURL = process.env['BLOGAPI'] ?? 'http://host.docker.internal:8000';
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
