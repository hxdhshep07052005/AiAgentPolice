import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function CaseList() {
  const { cases, isAdmin, isLanhDao } = useApp()

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
        <h1 className="page-title">Hồ sơ vụ án</h1>
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
        <div className="card">
          <div className="table-container">
            {cases.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <h3>Chưa có vụ án nào</h3>
                <p>Tạo vụ án đầu tiên để bắt đầu</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Mã vụ án</th>
                    <th>Tiêu đề</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Độ ưu tiên</th>
                    <th>Ngày tạo</th>
                    <th>Phân công</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map(caseItem => (
                    <tr key={caseItem.id}>
                      <td><strong>{caseItem.caseNumber}</strong></td>
                      <td style={{ maxWidth: '200px' }}>{caseItem.title}</td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {caseItem.description}
                      </td>
                      <td>
                        <span className={`badge badge-${caseItem.status === 'moi' ? 'warning' : caseItem.status === 'dang-xu-ly' ? 'primary' : 'success'}`}>
                          {statusLabels[caseItem.status]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${caseItem.priority === 'high' ? 'danger' : caseItem.priority === 'medium' ? 'warning' : 'success'}`}>
                          {priorityLabels[caseItem.priority]}
                        </span>
                      </td>
                      <td>{new Date(caseItem.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>{caseItem.assignments?.length || 0} người</td>
                      <td>
                        <Link to={`/cases/${caseItem.id}`} className="btn btn-sm btn-secondary">
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
