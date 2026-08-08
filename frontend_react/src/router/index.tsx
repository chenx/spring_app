import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import HomeView from '../views/HomeView'
import LoginView from '../views/LoginView'
import DashboardView from '../views/DashboardView'
import UserView from '../views/UserView'
import ProtectedRoute from './ProtectedRoute'
import RedirectIfAuthenticated from './RedirectIfAuthenticated'

// Router config mirrors the original vue-router setup: '/' is public,
// '/users' and '/dashboard' require auth, and '/login' redirects away if already authenticated.
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomeView /> },
      {
        path: 'login',
        element: (
          <RedirectIfAuthenticated>
            <LoginView />
          </RedirectIfAuthenticated>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute>
            <UserView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardView />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export default router
