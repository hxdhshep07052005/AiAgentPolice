import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import api from '../services/api'

// Icons
const Icons = {
  UserPlus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <line x1="19" y1="8" x2="19" y2="14"/>
      <line x1="22" y1="11" x2="16" y2="11"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Crown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 20h20v2H2v-2zm2-8l4 4 4-8 4 8 4-4v8H4v-8z"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

// Translate helpers
const translateRole = (role) => {
  const map = {
    'truong-nhom': 'Trưởng nhóm',
    'thanh-vien': 'Thành viên'
  }
  return map[role] || role
}

export default function CaseTeam({ caseId, members = [], currentUser, onRefresh, onMemberJoined }) {
  const { users, isLanhDao, isAdmin } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRole, setSelectedRole] = useState('thanh-vien')
  const [loading, setLoading] = useState(false)
  const [teamMembers, setTeamMembers] = useState(members)

  useEffect(() => {
    setTeamMembers(members)
  }, [members])

  const canManage = isLanhDao || isAdmin

  // Get user details by ID
  const getUserDetails = (userId) => {
    return users.find(u => u.id === userId) || { 
      name: userId, 
      title: 'Không rõ', 
      department: 'N/A',
      level: 0
    }
  }

  // Get available users (not in the team yet)
  const getAvailableUsers = () => {
    const memberIds = teamMembers.map(m => m.userId)
    return users.filter(u => !memberIds.includes(u.id) && u.isActive !== false)
  }

  // Check if user is current user
  const isCurrentUser = (userId) => currentUser?.id === userId

  // Handle adding member
  const handleAddMember = async () => {
    if (!selectedUser) return
    
    setLoading(true)
    try {
      await api.post(`/cases/${caseId}/members`, {
        userId: selectedUser,
        role: selectedRole
      })
      
      // Also add to chat channel
      const channel = await api.get(`/chat/channels/case/${caseId}`)
      if (channel?.id) {
        await api.post(`/chat/channels/${channel.id}/members`, { userId: selectedUser })
      }
      
      setShowModal(false)
      setSelectedUser('')
      setSelectedRole('thanh-vien')
      onRefresh?.()
      onMemberJoined?.()
    } catch (error) {
      console.error('Error adding member:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle removing member
  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này?')) return
    
    try {
      await api.delete(`/cases/${caseId}/members/${userId}`)
      onRefresh?.()
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  // Handle join case
  const handleJoinCase = async () => {
    if (!currentUser) return
    
    setLoading(true)
    try {
      await api.post(`/cases/${caseId}/join`, { userId: currentUser.id })
      
      // Add to chat channel
      const channel = await api.get(`/chat/channels/case/${caseId}`)
      if (channel?.id) {
        await api.post(`/chat/channels/${channel.id}/members`, { userId: currentUser.id })
      }
      
      onRefresh?.()
      onMemberJoined?.()
    } catch (error) {
      console.error('Error joining case:', error)
    } finally {
      setLoading(false)
    }
  }

  // Check if current user is a member
  const isMember = teamMembers.some(m => m.userId === currentUser?.id)

  return (
    <div className="case-team">
      <div className="team-header">
        <h4>
          <Icons.User />
          Tổ công tác
        </h4>
        <div className="team-actions">
          {!isMember && currentUser && (
            <button 
              className="btn btn-sm btn-primary"
              onClick={handleJoinCase}
              disabled={loading}
            >
              Tham gia
            </button>
          )}
          {canManage && (
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => setShowModal(true)}
            >
              <Icons.UserPlus />
              Mời thêm
            </button>
          )}
        </div>
      </div>

      <div className="team-members">
        {teamMembers.length === 0 ? (
          <div className="team-empty">
            <p>Chưa có thành viên</p>
          </div>
        ) : (
          teamMembers.map(member => {
            const user = getUserDetails(member.userId)
            return (
              <div 
                key={member.userId} 
                className={`team-member ${isCurrentUser(member.userId) ? 'is-current-user' : ''}`}
              >
                <div className="member-avatar">
                  {user.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="member-info">
                  <div className="member-name">
                    {user.name}
                    {isCurrentUser(member.userId) && <span className="you-badge">(Bạn)</span>}
                  </div>
                  <div className="member-meta">
                    <span className="member-title">{user.title}</span>
                    <span className="member-dept">{user.department}</span>
                  </div>
                  <div className="member-role">
                    {member.role === 'truong-nhom' ? (
                      <span className="role-badge truong-nhom">
                        <Icons.Crown /> Trưởng nhóm
                      </span>
                    ) : (
                      <span className="role-badge thanh-vien">Thành viên</span>
                    )}
                  </div>
                </div>
                {canManage && !isCurrentUser(member.userId) && (
                  <button 
                    className="btn-remove-member"
                    onClick={() => handleRemoveMember(member.userId)}
                    title="Xóa khỏi vụ"
                  >
                    <Icons.Trash />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal thêm thành viên */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mời thành viên</h3>
              <button onClick={() => setShowModal(false)}>
                <Icons.X />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Chọn cán bộ</label>
                <select 
                  value={selectedUser} 
                  onChange={e => setSelectedUser(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Chọn cán bộ --</option>
                  {getAvailableUsers().map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.title} ({user.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select 
                  value={selectedRole} 
                  onChange={e => setSelectedRole(e.target.value)}
                  className="form-select"
                >
                  <option value="thanh-vien">Thành viên</option>
                  <option value="truong-nhom">Trưởng nhóm</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddMember}
                disabled={!selectedUser || loading}
              >
                {loading ? 'Đang thêm...' : 'Thêm vào vụ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
