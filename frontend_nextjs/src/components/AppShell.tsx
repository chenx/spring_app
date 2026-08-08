'use client'

// Side-effect import: patches antd v5 (built/tested against React 16-18) to
// work with React 19's new APIs. Must load before any antd component renders.
import '@ant-design/v5-patch-for-react-19'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ConfigProvider, Layout, Menu, App as AntdApp } from 'antd'
import type { MenuProps } from 'antd'
import { DesktopOutlined, HomeFilled, UserOutlined } from '@ant-design/icons'
import enUS from 'antd/locale/en_US'

const { Header, Content } = Layout

export default function AppShell({ isLoggedIn, children }: { isLoggedIn: boolean; children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Clears the httpOnly session cookie server-side, then refreshes so the
  // root layout (a Server Component) re-reads cookies() and updates isLoggedIn.
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const items: MenuProps['items'] = [
    { key: '/', icon: <HomeFilled />, label: <Link href="/">Home</Link> },
    !isLoggedIn && { key: '/login', icon: <HomeFilled />, label: <Link href="/login">Login</Link> },
    isLoggedIn && { key: '/dashboard', icon: <UserOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
    isLoggedIn && { key: '/users', icon: <UserOutlined />, label: <Link href="/users">Users</Link> },
    isLoggedIn && { key: '/logout', icon: <UserOutlined />, label: 'Log Out' },
  ].filter(Boolean) as MenuProps['items']

  return (
    <ConfigProvider locale={enUS}
      theme={{
        token: {
          colorBgLayout: '#fff',  // Default background color: #f5f5f5
        },
        components: {
          Menu: {
            // horizontalItemHoverColor: 'inherit', // Stops text color change (optional)
            // horizontalLineHeight: 'normal',      // Optional adjustment

            // FIX: Overrides the bottom indicator line height/color to hide it completely
            horizontalLineHeight: '64px', // Matches default header height to prevent layout shifts
            activeBarHeight: 0,           // Removes the underline height on hover/active completely
            activeBarBorderWidth: 0,      // Removes the border fallback line
            
            // Optional: Keeps text color consistent on hover/selection if you want to eliminate all blue hints
            horizontalItemSelectedColor: 'rgba(0, 0, 0, 0.88)', 
            horizontalItemHoverColor: 'rgba(0, 0, 0, 0.88)',
          },
        },
      }}
    >
      <AntdApp> 
        <div id="layout">
          <Layout>
            <Header className="app-header">
              <div className="header-left">
                <DesktopOutlined style={{ fontSize: 24 }} />
                <span className="app-title">Spring</span>
              </div>
              <div className="header-right">
                <Menu
                  mode="horizontal"
                  selectedKeys={[pathname]}
                  items={items}
                  onClick={({ key }) => {
                    if (key === '/logout') logout()
                  }}

                  // prevent the horizontal items from collapsing into a dropdown
                  disabledOverflow={true} // Prevents items from compressing or hiding
                  overflowedIndicator={null} // Removes the three-dots dropdown icon entirely
                  
                  // Inline styles to clean up any remaining default outer borders
                  style={{ borderBottom: 'none', background: 'transparent' }} 
                />
              </div>
            </Header>

            <Content>{children}</Content>
          </Layout>
        </div>
      </AntdApp>
    </ConfigProvider>
  )
}
