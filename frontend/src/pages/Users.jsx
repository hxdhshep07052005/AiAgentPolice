import { useState } from 'react'
import { useApp } from '../context/AppContext'
import api from '../services/api'

export default function Users() {
  const { users, loadInitialData, isAdmin } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'can-bo',
    title: '',
    department: '',
    skills: '',
    level: 3
  })
  const [loading, setLoading] = useState(false)

  const handleAddUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/users', {
        ...newUser,
        skills: newUser.skills.split(',').map(s => s.trim()).filter(s => s)
      })
      await loadInitialData()
      setShowAddModal(false)
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'can-bo',
        title: '',
        department: '',
        skills: '',
        level: 3
      })
    } catch (error) {
      alert('Lỗi khi thêm thành viên!')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này?')) return
    try {
      await api.delete(`/users/${userId}`)
      await loadInitialData()
    } catch (error) {
      alert('Lỗi khi xóa thành viên!')
    }
  }

  const roleLabels = {
    'quan-tri': 'Quản trị',
    'lanh-dao': 'Lãnh đạo',
    'can-bo': 'Cán bộ'
  }

  if (!isAdmin) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Thông tin cá nhân</h1>
        </div>
        <div className="page-content">
          <div className="card">
            <div className="card-body">
              <p>Bạn không có quyền truy cập trang này.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quản lý thành viên</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm thành viên
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Tài khoản</th>
                  <th>Chức vụ</th>
                  <th>Phòng ban</th>
                  <th>Cấp bậc</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{user.title}</div>
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`badge badge-${user.role === 'quan-tri' ? 'danger' : user.role === 'lanh-dao' ? 'warning' : 'gray'}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td>{user.department}</td>
                    <td>Cấp {user.level}</td>
                    <td>
                      <span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>
                        {user.isActive ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-secondary"
                        style={{ marginRight: '8px' }}
                      >
                        Sửa
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm thành viên mới</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ tên *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="VD: Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tên đăng nhập *</label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="VD: nguyenvana"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mật khẩu đăng nhập"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Chức vụ</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="can-bo">Cán bộ</option>
                      <option value="lanh-dao">Lãnh đạo</option>
                      <option value="quan-tri">Quản trị</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Chức danh</label>
                    <input
                      type="text"
                      value={newUser.title}
                      onChange={(e) => setNewUser({ ...newUser, title: e.target.value })}
                      placeholder="VD: Cán sự, Trưởng phòng..."
                    />
                  </div>

                  <div className="form-group">
                    <label>Phòng ban</label>
                    <input
                      type="text"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      placeholder="VD: Phòng Điều tra"
                    />
                  </div>

                  <div className="form-group">
                    <label>Cấp bậc</label>
                    <select
                      value={newUser.level}
                      onChange={(e) => setNewUser({ ...newUser, level: parseInt(e.target.value) })}
                    >
                      <option value="1">Cấp 1 - Cao cấp</option>
                      <option value="2">Cấp 2 - Trung cấp</option>
                      <option value="3">Cấp 3 - Cơ bản</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Kỹ năng (phân cách bởi dấu phẩy)</label>
                    <input
                      type="text"
                      value={newUser.skills}
                      onChange={(e) => setNewUser({ ...newUser, skills: e.target.value })}
                      placeholder="VD: kham-nghiem, tra-camera, phan-tich"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang thêm...' : 'Thêm thành viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
