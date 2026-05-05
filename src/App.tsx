import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/context/AuthContext'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { Layout } from '@/components/shared/Layout'

import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import DashboardPage      from '@/pages/DashboardPage'
import TodosPage          from '@/pages/TodosPage'
import RecipesPage        from '@/pages/RecipesPage'
import RecipeDetailPage   from '@/pages/RecipeDetailPage'
import RecipeFormPage     from '@/pages/RecipeFormPage'
import ShoppingPage       from '@/pages/ShoppingPage'
import BoardsPage         from '@/pages/BoardsPage'
import SettingsPage       from '@/pages/SettingsPage'
import NewWorkspacePage   from '@/pages/workspace/NewWorkspacePage'
import InvitePage         from '@/pages/workspace/InvitePage'
import InviteAcceptPage   from '@/pages/InviteAcceptPage'

const router = createBrowserRouter([
  { path: '/login',    element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/invite/:code', element: <InviteAcceptPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/',                    element: <DashboardPage /> },
          { path: '/todos',               element: <TodosPage /> },
          { path: '/recipes',             element: <RecipesPage /> },
          { path: '/recipes/new',         element: <RecipeFormPage /> },
          { path: '/recipes/:id',         element: <RecipeDetailPage /> },
          { path: '/recipes/:id/edit',    element: <RecipeFormPage /> },
          { path: '/shopping',            element: <ShoppingPage /> },
          { path: '/boards',              element: <BoardsPage /> },
          { path: '/settings',            element: <SettingsPage /> },
          { path: '/workspace/new',       element: <NewWorkspacePage /> },
          { path: '/workspace/invite',    element: <InvitePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </WorkspaceProvider>
    </AuthProvider>
  )
}
