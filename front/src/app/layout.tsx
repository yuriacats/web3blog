import './globals.css'
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ゆりあのブログ',
  description: 'Web三層アーキテクチャーを用いたブログです',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <html lang="ja">
      <body >{children}</body>
    </html>
  )
}
