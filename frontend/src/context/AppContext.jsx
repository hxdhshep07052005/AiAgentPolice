import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [cases, setCases] = useState([])
  const [aiStatus, setAiStatus] = useState({ status: 'checking' })

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    const usersRes = await api.get('/users')
    setUsers(usersRes)

    const casesRes = await api.get('/cases')
    setCases(casesRes)

    const aiRes = await api.get('/ai/status')
    setAiStatus(aiRes)
  }

  const login = (user) => {
    setCurrentUser(user)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const refreshCases = async () => {
    const casesRes = await api.get('/cases')
    setCases(casesRes)
  }

  const isAdmin = currentUser?.role === 'quan-tri'
  const isLanhDao = currentUser?.role === 'lanh-dao'
  const isCanBo = currentUser?.role === 'can-bo'

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      cases,
      aiStatus,
      setAiStatus,
      login,
      logout,
      refreshCases,
      loadInitialData,
      isAdmin,
      isLanhDao,
      isCanBo
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
