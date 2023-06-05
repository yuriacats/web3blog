import React, { Suspense } from "react";
export const dynamic = "force-dynamic";

const Authors = (async () => {
  const name = "yuria";

  return (
    <>
      <ul>
        <Auther name={name} />
      </ul>
    </>
  );
}) as unknown as React.FC;

const Auther = ({ name }: { name: string }): React.ReactElement => {
  return (
    <>
      <li>{name}</li>
    </>
  );
};

export default function Home(): React.ReactNode {
  return (
    <main>
      <Suspense fallback={false}>
        <Authors />
      </Suspense>
    </main>
  );
}
