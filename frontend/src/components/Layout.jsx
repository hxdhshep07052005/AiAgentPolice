import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// SVG Icons
const Icons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/>
      <rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/>
      <path d="M20 14h2"/>
      <path d="M15 13v2"/>
      <path d="M9 13v2"/>
    </svg>
  ),
  LogOut: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
}

export default function Layout() {
  const navigate = useNavigate()
  const { currentUser, users, aiStatus, isAdmin, isLanhDao, isCanBo, logout, login } = useApp()
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRoleSwitch = (user) => {
    login(user)
    setShowRoleSwitcher(false)
    navigate('/')
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || ''
  }

  const getRoleLabel = (role) => {
    const labels = {
      'lanh-dao': 'Lanh dao',
      'can-bo': 'Can bo',
      'quan-tri': 'Quan tri'
    }
    return labels[role] || role
  }

  const getRoleBadgeClass = (role) => {
    const classes = {
      'lanh-dao': 'badge-danger',
      'can-bo': 'badge-primary',
      'quan-tri': 'badge-warning'
    }
    return classes[role] || 'badge-gray'
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Icons.Shield />
            </div>
            <div className="sidebar-logo-text">
              <h2>Quản Lý KNHT</h2>
              <span>Quan ly kham nghiem thong minh</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Dieu huong</div>
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icons.Home />
              Tong quan
            </NavLink>
            <NavLink to="/cases" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icons.FileText />
              Ho so vu an
            </NavLink>
            {(isAdmin || isLanhDao) && (
              <NavLink to="/cases/new" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Icons.Plus />
                Tao vu an moi
              </NavLink>
            )}
          </div>

          {(isAdmin) && (
            <div className="nav-section">
              <div className="nav-section-title">AI Assistant</div>
              <NavLink to="/ai-chat" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Icons.Bot />
                Chat voi AI
              </NavLink>
            </div>
          )}

          {(isAdmin) && (
            <div className="nav-section">
              <div className="nav-section-title">Quan ly</div>
              <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <Icons.Users />
                Quan ly thanh vien
              </NavLink>
            </div>
          )}

          {/* Role-based info */}
          <div className="nav-section">
            <div className="nav-section-title">Huong dan</div>
            <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '0.8rem', color: '#6b7280' }}>
              {(isLanhDao || isAdmin) && (
                <p style={{ marginBottom: '8px' }}>
                  <strong>Lanh dao:</strong> Tao vu an, phan cong nhiem vu
                </p>
              )}
              {isCanBo && (
                <p style={{ marginBottom: '8px' }}>
                  <strong>Can bo:</strong> Lam checklist, viet bao cao
                </p>
              )}
              <p>
                <strong>AI ho tro:</strong> Goi y phan cong, kiem tra bao cao
              </p>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          {currentUser && (
            <div style={{ marginBottom: '12px' }}>
              <div className="user-info" onClick={() => setShowRoleSwitcher(!showRoleSwitcher)} style={{ cursor: 'pointer' }}>
                <div className="user-avatar">{getInitials(currentUser.name)}</div>
                <div className="user-details">
                  <h4>{currentUser.name}</h4>
                  <span>{currentUser.title}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <span className={`badge ${getRoleBadgeClass(currentUser.role)}`}>
                  {getRoleLabel(currentUser.role)}
                </span>
                <span className="badge badge-gray">
                  Level {currentUser.level || 3}
                </span>
              </div>
              
              {/* Role Switcher (Demo) */}
              {showRoleSwitcher && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px', 
                  background: 'white', 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>
                    Chuyen doi vai tro (Demo)
                  </p>
                  {users.filter(u => u.isActive).map(user => (
                    <div 
                      key={user.id}
                      onClick={() => handleRoleSwitch(user)}
                      style={{ 
                        padding: '8px', 
                        cursor: 'pointer', 
                        borderRadius: '4px',
                        background: user.id === currentUser.id ? '#f3f4f6' : 'transparent',
                        marginBottom: '4px',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong>{user.name}</strong>
                      <br />
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {getRoleLabel(user.role)} - Level {user.level}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            <Icons.LogOut />
            Dang xuat
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className={`ai-status ${aiStatus.status === 'online' ? 'online' : 'offline'}`}>
          <Icons.Bot />
          {aiStatus.status === 'online' ? 'AI Online' : 'AI Offline'}
        </div>
        <Outlet />
      </main>
    </div>
  )
}
