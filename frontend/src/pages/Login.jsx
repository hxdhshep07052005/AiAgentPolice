import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// Demo users list
const DEMO_USERS = [
  { username: 'admin', name: 'Nguyễn Văn Admin', role: 'quan-tri', level: 1 },
  { username: 'truongnhom1', name: 'Trần Văn A', role: 'lanh-dao', level: 2 },
  { username: 'truongnhom2', name: 'Lê Thị B', role: 'lanh-dao', level: 2 },
  { username: 'thanhvien1', name: 'Phạm Văn C', role: 'can-bo', level: 3 },
  { username: 'thanhvien2', name: 'Hoàng Thị D', role: 'can-bo', level: 3 },
  { username: 'thanhvien3', name: 'Ngô Văn E', role: 'can-bo', level: 3 },
  { username: 'thanhvien4', name: 'Đặng Thị F', role: 'can-bo', level: 3 },
  { username: 'thanhvien5', name: 'Bùi Văn G', role: 'can-bo', level: 3 },
  { username: 'thanhvien6', name: 'Trịnh Thị H', role: 'can-bo', level: 3 },
  { username: 'thanhvien7', name: 'Vũ Văn I', role: 'can-bo', level: 3 },
]

const getRoleColor = (role) => {
  switch (role) {
    case 'quan-tri': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', label: 'Quản trị' }
    case 'lanh-dao': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Trưởng nhóm' }
    default: return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Cán bộ' }
  }
}

const getRoleIcon = (role) => {
  switch (role) {
    case 'quan-tri': return '👑'
    case 'lanh-dao': return '🎖️'
    default: return '👤'
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuickLogin, setShowQuickLogin] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await api.post('/auth/login', form)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', result.token)
        navigate('/')
        window.location.reload()
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (user) => {
    setError('')
    setLoading(true)

    try {
      const result = await api.post('/auth/login', { 
        username: user.username, 
        password: '123456' 
      })
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('token', result.token)
        navigate('/')
        window.location.reload()
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>AI Điều Tra</h1>
          <p>Hệ thống hỗ trợ điều tra có tích hợp trí tuệ nhân tạo</p>
        </div>

        {/* Quick Login - Demo Users */}
        <div style={{ marginBottom: '20px' }}>
          <div className="flex justify-between items-center mb-3">
            <span style={{ fontWeight: '600', color: '#374151' }}>🔑 Đăng nhập nhanh (Demo)</span>
            <button 
              onClick={() => setShowQuickLogin(!showQuickLogin)}
              style={{ fontSize: '0.85rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showQuickLogin ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
          
          {showQuickLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {DEMO_USERS.map(user => {
                const roleStyle = getRoleColor(user.role)
                return (
                  <button
                    key={user.username}
                    onClick={() => handleQuickLogin(user)}
                    disabled={loading}
                    className="quick-login-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      background: '#fff',
                      border: `1px solid ${roleStyle.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = roleStyle.bg
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#fff'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{getRoleIcon(user.role)}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: '500', fontSize: '0.85rem', color: '#1f2937' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: roleStyle.text }}>
                        {roleStyle.label} (Level {user.level})
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '16px', 
          marginBottom: '16px',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.8rem'
        }}>
          hoặc đăng nhập thủ công
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#6b7280'
        }}>
          <strong>📋 Tài khoản demo:</strong>
          <div style={{ marginTop: '8px', fontSize: '0.8rem' }}>
            <div><strong>Mật khẩu chung:</strong> 123456</div>
            <div style={{ marginTop: '4px' }}>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs mr-1">Admin</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs mr-1">Trưởng nhóm</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Cán bộ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
