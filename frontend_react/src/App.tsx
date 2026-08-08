import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ConfigProvider, Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import { DesktopOutlined, HomeFilled, UserOutlined } from '@ant-design/icons'
import enUS from 'antd/locale/en_US'

const { Header, Content } = Layout

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Function to check local storage auth status
  function checkAuthStatus() {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }

  // Check status when app initializes, and again whenever the route changes
  // to automatically recalculate the login state (mirrors the Vue `watch(route.path)`).
  useEffect(() => {
    checkAuthStatus()
  }, [location.pathname])

  // Global logout method
  function logout() {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/login')
  }

  const items: MenuProps['items'] = [
    { key: '/', icon: <HomeFilled />, label: <Link to="/">Home</Link> },
    !isLoggedIn && { key: '/login', icon: <HomeFilled />, label: <Link to="/login">Login</Link> },
    isLoggedIn && { key: '/dashboard', icon: <UserOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
    isLoggedIn && { key: '/users', icon: <UserOutlined />, label: <Link to="/users">Users</Link> },
    isLoggedIn && { key: '/logout', icon: <UserOutlined />, label: 'Log Out' },
  ].filter(Boolean) as MenuProps['items']

  return (
    <ConfigProvider locale={enUS}
      theme={{
        token: {  // Default background color: #f5f5f5
          colorBgLayout: '#fff',
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
      <div id="layout">
        <Layout>
          <Header className="app-header">
            <div className="header-left">
              <DesktopOutlined style={{ fontSize: 24 }} />
              <span className="app-title">Spring Boot</span>
            </div>
            <div className="header-right">
              <Menu
                mode="horizontal"
                selectedKeys={[location.pathname]}
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

          <Content>
            <Outlet />
          </Content>
        </Layout>
      </div>
    </ConfigProvider>
  )
}

export default App
