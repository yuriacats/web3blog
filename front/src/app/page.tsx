import Link from "next/link";
import React from "react";
export const dynamic = "force-dynamic";

export default function Home(): React.ReactNode {
  return (
    <main>
      <h1> yuria Top Page</h1>
      <p>blog記事（見本）</p>
      <Link href="posts/8557AF75A904DEEF4E00">
        <a>Rustで一日でDiscordBotを作る(一部転載)</a>
      </Link>
    </main>
  );
}
