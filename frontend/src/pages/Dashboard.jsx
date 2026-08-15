import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { currentUser, cases, users, aiStatus, isAdmin, isLanhDao, isCanBo } = useApp()

  const myCases = cases.filter(c => 
    c.createdBy === currentUser?.id || 
    c.assignments?.some(a => a.userId === currentUser?.id)
  )

  // Calculate progress for my cases
  const myCasesWithProgress = myCases.map(c => {
    const totalTasks = c.assignments?.reduce((sum, a) => sum + (a.tasks?.length || 0), 0) || 0
    const completedTasks = c.assignments?.reduce((sum, a) => sum + (a.tasks?.filter(t => t.completed).length || 0), 0) || 0
    return {
      ...c,
      progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalTasks,
      completedTasks
    }
  })

  const stats = {
    total: cases.length,
    moi: cases.filter(c => c.status === 'moi').length,
    dangXuLy: cases.filter(c => c.status === 'dang-xu-ly').length,
    hoanThanh: cases.filter(c => c.status === 'hoan-thanh').length,
  }

  const statusLabels = {
    'moi': 'Mới',
    'dang-xu-ly': 'Đang xử lý',
    'hoan-thanh': 'Hoàn thành',
    'qua-han': 'Quá hạn'
  }

  const priorityLabels = {
    'high': 'Cao',
    'medium': 'Trung bình',
    'low': 'Thấp'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Tổng quan</h1>
        {(isAdmin || isLanhDao) && (
          <div className="page-actions">
            <Link to="/cases/new" className="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tạo vụ án mới
            </Link>
          </div>
        )}
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng vụ án</div>
          </div>
          <div className="stat-card primary">
            <div className="stat-value">{stats.moi}</div>
            <div className="stat-label">Vụ mới</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{stats.dangXuLy}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.hoanThanh}</div>
            <div className="stat-label">Hoàn thành</div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
                  👋 Chào mừng, {currentUser?.name}!
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '12px' }}>
                  {currentUser?.title} - {currentUser?.department}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className={`badge ${currentUser?.role === 'lanh-dao' ? 'badge-danger' : currentUser?.role === 'quan-tri' ? 'badge-warning' : 'badge-primary'}`}>
                    {currentUser?.role === 'lanh-dao' ? '👑 Lãnh đạo' : currentUser?.role === 'quan-tri' ? '⚙️ Quản trị' : '👤 Cán bộ'}
                  </span>
                  <span className="badge badge-gray">Level {currentUser?.level || 3}</span>
                  <span className={`badge ${aiStatus.status === 'online' ? 'badge-success' : 'badge-gray'}`}>
                    {aiStatus.status === 'online' ? '🤖 AI Online' : '🤖 AI Offline'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Vụ án của tôi</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a56db' }}>{myCases.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific guidance */}
        {(isLanhDao || isAdmin) && (
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '1px solid #f59e0b' }}>
            <div className="card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#78350f' }}>
                💡 Hướng dẫn cho Lãnh đạo
              </h3>
              <ol style={{ color: '#92400e', fontSize: '0.9rem', paddingLeft: '20px', lineHeight: 1.8 }}>
                <li>Tạo vụ án mới với mô tả chi tiết</li>
                <li>Sử dụng AI để gợi ý phân công nhiệm vụ</li>
                <li>Giám sát tiến độ các nhiệm vụ</li>
                <li>Xem và duyệt báo cáo từ cán bộ</li>
              </ol>
            </div>
          </div>
        )}

        {isCanBo && (
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '1px solid #3b82f6' }}>
            <div className="card-body">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: '#1e40af' }}>
                💡 Hướng dẫn cho Cán bộ
              </h3>
              <ol style={{ color: '#1e40af', fontSize: '0.9rem', paddingLeft: '20px', lineHeight: 1.8 }}>
                <li>Xem nhiệm vụ được phân công trong chi tiết vụ án</li>
                <li>Hoàn thành checklist công việc</li>
                <li>Sử dụng AI để hỏi về tiến trình vụ án</li>
                <li>Viết báo cáo và gửi để AI kiểm tra</li>
              </ol>
            </div>
          </div>
        )}

        {/* My Cases with Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📁 Vụ án của tôi</h3>
            <Link to="/cases" className="btn btn-sm btn-secondary">Xem tất cả</Link>
          </div>
          <div className="card-body">
            {myCasesWithProgress.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <h3>Chưa có vụ án</h3>
                <p>{(isAdmin || isLanhDao) ? 'Tạo vụ án mới để bắt đầu' : 'Chưa có vụ án nào được phân công cho bạn'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {myCasesWithProgress.slice(0, 5).map(caseItem => (
                  <Link 
                    key={caseItem.id} 
                    to={`/cases/${caseItem.id}`}
                    style={{ 
                      textDecoration: 'none',
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      display: 'block',
                      transition: 'all 0.2s'
                    }}
                    className="case-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                          {caseItem.caseNumber} - {caseItem.title}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${caseItem.status === 'moi' ? 'warning' : caseItem.status === 'dang-xu-ly' ? 'primary' : 'success'}`}>
                            {statusLabels[caseItem.status]}
                          </span>
                          <span className={`badge badge-${caseItem.priority === 'high' ? 'danger' : caseItem.priority === 'medium' ? 'warning' : 'success'}`}>
                            {priorityLabels[caseItem.priority]}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {caseItem.completedTasks}/{caseItem.totalTasks} công việc
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: caseItem.progress === 100 ? '#059669' : '#1a56db' }}>
                          {caseItem.progress}%
                        </div>
                      </div>
                    </div>
                    <div className="progress-bar" style={{ height: '6px' }}>
                      <div 
                        className="fill" 
                        style={{ 
                          width: `${caseItem.progress}%`,
                          background: caseItem.progress === 100 ? '#059669' : '#1a56db'
                        }}
                      ></div>
                    </div>
                    {caseItem.assignments?.length > 0 && (
                      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#6b7280' }}>
                        👥 {caseItem.assignments.length} người được phân công
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
