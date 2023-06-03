import React, { Suspense } from 'react';
import getData from '../lib/fetch_author';
import styles from './page.module.css';
export const dynamic = 'force-dynamic';


const Authors = (async () => {
  const name = await getData();

  return (
    <>
      <ul>
        <Auther name={name} />
      </ul>
    </>
  )
}) as unknown as React.FC

const Auther = ({ name }: { name: string }): React.ReactElement => {
  return <><li>{name}</li></>
}

export default function Home(): React.ReactNode {
  return (
    <main className={styles['main']}>
      <Suspense fallback={false}>
        <Authors />
      </Suspense>
    </main >
  )
}
