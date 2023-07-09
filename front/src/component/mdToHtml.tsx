import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import React, { createElement } from "react";

export const MdToHtml = async ({
  md,
}: {
  md: string;
}): Promise<React.ReactElement> => {
  const HTMLcontent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeReact, { createElement })
    .process(md);
  return <>{HTMLcontent.result}</>;
};
