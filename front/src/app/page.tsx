import React, { Suspense } from 'react';
import { headers } from 'next/headers';
import getData from '../lib/featch_author';
import styles from './page.module.css';
export const dynamic = 'force-dynamic';


const Authors = (async ({ }) => {
  const headerList = headers();
  const name = headerList.get(await getData()) ?? "";



  return (
    <>
      <ul>
        <Auther name={name} />
      </ul>
    </>
  )
}) as unknown as React.FC

const Auther = ({ name }: { name: string }) => {
  return <><li>{name}</li></>
}

export default async function Home() {
  return (
    <main className={styles.main}>
      <Suspense fallback={false}>
        <Authors />
      </Suspense>
    </main >
  )
}
