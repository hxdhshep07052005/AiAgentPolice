import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CaseList from './pages/CaseList'
import CaseDetail from './pages/CaseDetail'
import CreateCase from './pages/CreateCase'
import Users from './pages/Users'
import AiChat from './pages/AiChat'

function ProtectedRoute({ children }) {
  const { currentUser } = useApp()
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return children
}

function AppRoutes() {
  const { currentUser } = useApp()
  
  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="cases" element={<CaseList />} />
        <Route path="cases/new" element={<CreateCase />} />
        <Route path="cases/:caseId" element={<CaseDetail />} />
        <Route path="users" element={<Users />} />
        <Route path="ai-chat" element={<AiChat />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
