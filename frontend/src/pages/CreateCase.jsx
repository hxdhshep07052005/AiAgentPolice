import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../services/api'

export default function CreateCase() {
  const navigate = useNavigate()
  const { currentUser, users, refreshCases, isAdmin, isLanhDao } = useApp()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      return
    }

    setLoading(true)
    try {
      const newCase = await api.post('/cases', {
        title: form.title,
        description: form.description,
        priority: form.priority,
        createdBy: currentUser.id
      })

      await api.post('/chat/channels', {
        caseId: newCase.id,
        name: newCase.caseNumber,
        creatorId: currentUser.id
      })

      await refreshCases()
      navigate(`/cases/${newCase.id}`)
    } catch (error) {
      alert('Lỗi khi tạo vụ án!')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin && !isLanhDao) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Không có quyền</h1>
        </div>
        <div className="page-content">
          <div className="card">
            <div className="card-body">
              <p>Bạn không có quyền tạo vụ án mới.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tạo vụ án mới</h1>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thông tin vụ án</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tiêu đề vụ án *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="VD: Vụ trộm tài sản tại Ngõ 5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mô tả chi tiết *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả chi tiết vụ việc..."
                    rows="8"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Độ ưu tiên</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="high">Cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Đang tạo...' : 'Tạo vụ án'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => navigate('/cases')}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Cán bộ có sẵn</h3>
            </div>
            <div className="card-body">
              <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '0.9rem' }}>
                Danh sách cán bộ có thể phân công sau khi tạo vụ án.
              </p>
              {users.filter(u => u.role === 'can-bo').map(user => (
                <div key={user.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '0.8rem' }}>
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{user.department}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
