import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import AppShell from '@/components/AppShell'
import { SESSION_COOKIE } from '@/lib/session'
import './globals.css'

export const metadata: Metadata = {
  title: 'Demo Fullstack',
  icons: { icon: '/vite.svg' },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const isLoggedIn = !!cookieStore.get(SESSION_COOKIE)?.value

  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AppShell isLoggedIn={isLoggedIn}>{children}</AppShell>
        </AntdRegistry>
      </body>
    </html>
  )
}
