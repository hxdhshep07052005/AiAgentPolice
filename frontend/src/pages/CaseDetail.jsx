import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import api from '../services/api'
import CaseMembers from '../components/CaseMembers'
import CaseTemplates from '../components/CaseTemplates'
import ProgressBar from '../components/ProgressBar'

// SVG Icons
const Icons = {
  Bot: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
  ),
  Send: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  X: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  Sparkles: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  MessageSquare: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  User: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  CheckCircle: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Check: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  ),
  Lightbulb: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
    </svg>
  ),
  FileText: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  ArrowRight: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  Loader: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  ChevronRight: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  ListTodo: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
    </svg>
  ),
  Users: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  ClipboardList: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  ),
  Calendar: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Target: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  ArrowUp: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6"/>
    </svg>
  ),
  ArrowDown: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  Plus: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  ),
  Refresh: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/>
    </svg>
  ),
  Back: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  Crown: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4 3 15h18l-1-11z"/><path d="M2 19h20"/>
    </svg>
  ),
}

// Quick questions for AI
const QUICK_QUESTIONS = [
  { id: 'progress', label: 'Tiến trình', question: 'Tổng tiến trình và tình trạng các nhiệm vụ hiện tại như thế nào?' },
  { id: 'whos-doing', label: 'Ai đang làm gì', question: 'Những ai đang thực hiện nhiệm vụ gì?' },
  { id: 'missing', label: 'Còn thiếu gì', question: 'Những gì chưa hoàn thành hoặc còn thiếu sót?' },
  { id: 'next-step', label: 'Bước tiếp theo', question: 'Theo quy trình, bước tiếp theo nên làm gì?' },
]

// Report templates
const REPORT_TEMPLATES = {
  1: { title: 'BÁO CÁO TỔNG HỢP', sections: [{ id: 'tong-quan', title: 'I. TỔNG QUAN VỤ VIỆC', fields: ['tom-tat', 'danh-gia-chung', 'de-xuat-xu-ly'] }, { id: 'ket-luan', title: 'II. KẾT LUẬN VÀ KIẾN NGHỊ', fields: ['ket-luan', 'kien-nghi'] }] },
  2: { title: 'BÁO CÁO ĐIỀU TRA', sections: [{ id: 'thong-tin', title: 'I. THÔNG TIN CHUNG', fields: ['thoi-gian', 'dia-diem', 'nguoi-lien-quan'] }, { id: 'noi-dung', title: 'II. NỘI DUNG ĐIỀU TRA', fields: ['mota-hinh-anh', 'chung-cu-thu-thap', 'phan-tich'] }, { id: 'ket-luan', title: 'III. KẾT LUẬN', fields: ['ket-luan', 'de-xuat'] }] },
  3: { title: 'BÁO CÁO CÔNG TÁC', sections: [{ id: 'thong-tin', title: 'I. THÔNG TIN', fields: ['thoi-gian', 'dia-diem', 'nguoi-thuc-hien'] }, { id: 'cong-viec', title: 'II. CÔNG VIỆC ĐÃ THỰC HIỆN', fields: ['cac-buoc', 'ket-qua'] }, { id: 'vat-chung', title: 'III. VẬT CHỨNG/DẤU VẾT', fields: ['vat-chung', 'dau-vet'] }] }
}

export default function CaseDetail() {
  const { caseId } = useParams()
  const { currentUser, users, refreshCases, isLanhDao, isAdmin } = useApp()
  
  const [caseData, setCaseData] = useState(null)
  const [templates, setTemplates] = useState([])
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [reportContent, setReportContent] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [aiReview, setAiReview] = useState(null)
  const [activeTab, setActiveTab] = useState('members')
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [aiChatMessages, setAiChatMessages] = useState([])
  const [aiChatInput, setAiChatInput] = useState('')
  const [aiTyping, setAiTyping] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null)
  const [channel, setChannel] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const aiChatEndRef = useRef(null)
  const chatEndRef = useRef(null)
  const userLevel = currentUser?.level || 3
  const reportTemplate = REPORT_TEMPLATES[userLevel]

  const loadCase = async () => {
    const data = await api.get(`/cases/${caseId}`)
    setCaseData(data)
    const available = await api.get(`/cases/${caseId}/available-templates`)
    setAvailableTemplates(available)
  }

  const loadTemplates = async () => {
    const data = await api.get('/cases/templates/task')
    setTemplates(data)
  }

  const loadChat = async () => {
    const msgs = await api.get(`/chat/channels/case/${caseId}/messages`)
    setMessages(msgs)
    if (msgs.length > 0) setLastMessageTimestamp(msgs[msgs.length - 1].timestamp)
  }

  const loadTeamMembers = async () => {
    const members = await api.get(`/cases/${caseId}/members`)
    setTeamMembers(members)
  }

  const loadChannel = async () => {
    const ch = await api.get(`/chat/channels/case/${caseId}`)
    setChannel(ch)
  }

  useEffect(() => {
    loadCase()
    loadTemplates()
    loadChat()
    loadTeamMembers()
    loadChannel()
  }, [caseId, refreshKey])

  useEffect(() => {
    if (!channel?.id) return
    const pollInterval = setInterval(async () => {
      try {
        const result = await api.get(`/chat/channels/${channel.id}/messages/since?since=${lastMessageTimestamp || ''}`)
        if (result.messages?.length > 0) {
          setMessages(prev => [...prev, ...result.messages])
          if (result.latestTimestamp) setLastMessageTimestamp(result.latestTimestamp)
        }
      } catch (error) { console.error('Polling error:', error) }
    }, 3000)
    return () => clearInterval(pollInterval)
  }, [channel?.id, lastMessageTimestamp])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [aiChatMessages])

  const handleRefresh = () => setRefreshKey(k => k + 1)

  const handleAIsuggestion = async () => {
    if (!caseData) return
    setLoadingAI(true)
    try {
      const agents = users.filter(u => u.role === 'can-bo' || u.role === 'lanh-dao').map(u => ({
        id: u.id, name: u.name, title: u.title, role: u.role, skills: u.skills || [], level: u.level || 3
      }))
      const result = await api.post('/ai/suggest-assignment', {
        description: `${caseData.title}\n${caseData.description}\nĐộ ưu tiên: ${caseData.priority === 'high' ? 'Cao' : caseData.priority === 'medium' ? 'Trung bình' : 'Thấp'}`,
        agents
      })
      setAiSuggestion(result)
    } catch (error) { console.error('AI Error:', error) }
    finally { setLoadingAI(false) }
  }

  const handleApproveAssignment = async () => {
    if (!aiSuggestion?.assignments) return
    try {
      for (const assignment of aiSuggestion.assignments) {
        const taskId = Array.isArray(assignment.tasks) ? assignment.tasks[0]?.id || assignment.tasks[0] : assignment.tasks
        await api.post(`/cases/${caseId}/assign`, {
          userId: assignment.agentId, taskTemplateId: taskId, assignedBy: currentUser?.id || 'system', role: 'thanh-vien'
        })
        const ch = await api.get(`/chat/channels/case/${caseId}`)
        if (ch?.id) await api.post(`/chat/channels/${ch.id}/members`, { userId: assignment.agentId })
        const assignedUser = users.find(u => u.id === assignment.agentId)
        await api.post(`/chat/channels/case/${caseId}/messages`, {
          senderId: 'system', senderName: 'System', senderAvatar: '', senderRole: 'system',
          content: `${assignedUser?.name} được phân công: ${templates.find(t => t.id === taskId)?.name || taskId}`, type: 'system'
        })
      }
      await handleRefresh()
      await loadChat()
      setAiSuggestion(null)
      await refreshCases()
    } catch (error) { console.error('Error:', error) }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    try {
      const result = await api.post(`/chat/channels/case/${caseId}/messages`, {
        senderId: currentUser.id, senderName: currentUser.name, senderAvatar: '', senderRole: currentUser.role, content: chatInput, type: 'message'
      })
      setChatInput('')
      if (result.timestamp) setLastMessageTimestamp(result.timestamp)
      await loadChat()
    } catch (error) { console.error('Error sending message:', error) }
  }

  const handleToggleTask = async (userId, taskId, currentStatus) => {
    try {
      await api.put(`/cases/${caseId}/tasks/${taskId}?userId=${userId}`, { completed: !currentStatus })
      await loadCase()
      await refreshCases() // Refresh context to update Dashboard
    } catch (error) { console.error('Error toggling task:', error) }
  }

  const sendToAI = async (question) => {
    if (!question.trim()) return
    const userMessage = { role: 'user', content: question, sender: currentUser.name, timestamp: new Date() }
    setAiChatMessages(prev => [...prev, userMessage])
    setAiChatInput('')
    setAiTyping(true)
    try {
      const result = await api.post('/ai/chat', {
        message: question,
        history: aiChatMessages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
      })
      const aiMessage = { role: 'ai', content: result.message || 'Xin lỗi, không thể trả lời lúc này.', timestamp: new Date() }
      setAiChatMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI Chat Error:', error)
      setAiChatMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, AI đang gặp sự cố.', timestamp: new Date() }])
    } finally { setAiTyping(false) }
  }

  const handleSubmitReport = async () => {
    if (!reportContent.trim()) { alert('Vui lòng nhập nội dung báo cáo!'); return }
    try {
      await api.put(`/cases/${caseId}/report`, { report: reportContent, userLevel })
      await loadCase()
      setShowReportModal(false)
      const allTasks = caseData?.assignments?.flatMap(a => a.tasks) || []
      const review = await api.post('/ai/check-report', { report: reportContent, checklist: allTasks, userLevel })
      setAiReview(review)
    } catch (error) { console.error('Error submitting report:', error) }
  }

  if (!caseData) return <div className="page-content"><div className="loading">Đang tải...</div></div>

  const statusLabels = { 'moi': 'Mới', 'dang-xu-ly': 'Đang xử lý', 'hoan-thanh': 'Hoàn thành', 'qua-han': 'Quá hạn' }
  const totalTasks = caseData.assignments?.reduce((sum, a) => sum + (a.tasks?.length || 0), 0) || 0
  const completedTasks = caseData.assignments?.reduce((sum, a) => sum + (a.tasks?.filter(t => t.completed).length || 0), 0) || 0
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const myAssignments = caseData.assignments?.filter(a => a.userId === currentUser?.id) || []

  const tabs = [
    { id: 'members', label: 'Thành viên', icon: Icons.Users },
    { id: 'templates', label: 'Nhiệm vụ', icon: Icons.ClipboardList },
    { id: 'checklist', label: 'Việc của tôi', icon: Icons.ListTodo },
    { id: 'report', label: 'Báo cáo', icon: Icons.FileText },
  ]

  return (
    <div className="case-detail-page">
      {/* Header */}
      <div className="case-header">
        <div className="case-header-left">
          <Link to="/cases" className="back-btn">
            <Icons.Back />
          </Link>
          <div className="case-info">
            <div className="case-title-row">
              <h1 className="case-title">{caseData.caseNumber}</h1>
              <div className="case-badges">
                <span className={`status-badge status-${caseData.status}`}>{statusLabels[caseData.status]}</span>
                <span className={`priority-badge priority-${caseData.priority}`}>
                  {caseData.priority === 'high' ? '🔴 Cao' : caseData.priority === 'medium' ? '🟡 TB' : '🟢 Thấp'}
                </span>
              </div>
            </div>
            <h2 className="case-subtitle">{caseData.title}</h2>
            <div className="case-meta">
              <span><Icons.Calendar size={14} /> {new Date(caseData.createdAt).toLocaleDateString('vi-VN')}</span>
              <span><Icons.User size={14} /> {caseData.createdBy === currentUser?.id ? 'Bạn' : 'Lãnh đạo'}</span>
            </div>
            {caseData.description && (
              <div className="case-description">
                <p>{caseData.description}</p>
              </div>
            )}
          </div>
        </div>
        <div className="case-header-right">
          {(isAdmin || isLanhDao) && caseData.status === 'moi' && !aiSuggestion && (
            <button className="btn btn-primary btn-ai" onClick={handleAIsuggestion} disabled={loadingAI}>
              {loadingAI ? <><Icons.Loader /> Đang phân tích...</> : <><Icons.Sparkles /> AI gợi ý phân công</>}
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleRefresh}>
            <Icons.Refresh size={16} />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <div className="progress-circle" style={{ '--progress': overallProgress }}>
          <span className="progress-value">{overallProgress}%</span>
          <span className="progress-label">Hoàn thành</span>
        </div>
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-value">{totalTasks}</span>
            <span className="stat-label">Tổng công việc</span>
          </div>
          <div className="stat-item completed">
            <span className="stat-value">{completedTasks}</span>
            <span className="stat-label">Đã hoàn thành</span>
          </div>
          <div className="stat-item remaining">
            <span className="stat-value">{totalTasks - completedTasks}</span>
            <span className="stat-label">Còn lại</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${overallProgress}%` }}></div>
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="ai-suggestion-panel">
          <div className="ai-suggestion-header">
            <Icons.Sparkles size={20} />
            <h3>AI gợi ý phân công</h3>
            <button className="btn-icon" onClick={() => setAiSuggestion(null)}><Icons.X /></button>
          </div>
          <p className="ai-summary">{aiSuggestion.summary}</p>
          <div className="assignment-list">
            {aiSuggestion.assignments?.map((assignment, idx) => {
              const agent = users.find(u => u.id === assignment.agentId)
              const tasks = Array.isArray(assignment.tasks) ? assignment.tasks : [assignment.tasks]
              return (
                <div key={idx} className="assignment-card">
                  <div className="assignment-user">
                    <div className="user-avatar-sm">{agent?.name?.charAt(0) || '?'}</div>
                    <div>
                      <strong>{agent?.name}</strong>
                      <span>{agent?.title}</span>
                    </div>
                  </div>
                  <p className="assignment-reason">{assignment.reasoning}</p>
                  <div className="assignment-tasks">
                    {tasks.map((task, i) => (
                      <span key={i} className="task-tag">
                        {typeof task === 'object' ? task.name : templates.find(t => t.id === task)?.name || task}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="ai-actions">
            <button className="btn btn-success" onClick={handleApproveAssignment}><Icons.CheckCircle size={16} /> Chấp nhận</button>
            <button className="btn btn-secondary" onClick={() => setAiSuggestion(null)}>Từ chối</button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="case-content">
        <div className="case-main">
          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => {
                const IconComp = tab.icon
                const count = tab.id === 'templates' ? (caseData.caseTemplates?.length || 0) : tab.id === 'checklist' ? myAssignments.length : null
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab ${activeTab === tab.id ? 'active' : ''}`}>
                    <IconComp size={18} />
                    <span>{tab.label}</span>
                    {count !== null && count > 0 && <span className="tab-count">{count}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'members' && (
              <CaseMembers caseId={caseId} members={teamMembers} users={users} currentUser={currentUser} onRefresh={handleRefresh} />
            )}
            {activeTab === 'templates' && (
              <CaseTemplates caseId={caseId} caseTemplates={caseData.caseTemplates || []} assignments={caseData.assignments || []} availableTemplates={availableTemplates} users={users} members={teamMembers} currentUser={currentUser} onRefresh={handleRefresh} />
            )}
            {activeTab === 'checklist' && (
              <div className="my-checklist">
                {myAssignments.length === 0 ? (
                  <div className="empty-state">
                    <Icons.ListTodo size={48} />
                    <h3>Chưa có nhiệm vụ</h3>
                    <p>Bạn chưa được gán công việc nào trong vụ án này.</p>
                  </div>
                ) : (
                  myAssignments.map(assignment => {
                    const completedCount = assignment.tasks?.filter(t => t.completed).length || 0
                    const totalCount = assignment.tasks?.length || 0
                    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
                    return (
                      <div key={assignment.taskTemplateId} className="checklist-card">
                        <div className="checklist-header">
                          <div className="checklist-title">
                            <h4>{assignment.taskTemplateName}</h4>
                            <span className={`role-badge ${assignment.role}`}>
                              {assignment.role === 'truong-nhom' ? <><Icons.Crown /> Trưởng nhóm</> : 'Thành viên'}
                            </span>
                          </div>
                          <div className="checklist-progress">
                            <span className="progress-text">{completedCount}/{totalCount}</span>
                            <div className="mini-progress">
                              <div className="mini-progress-bar" style={{ width: `${progress}%`, background: progress === 100 ? '#22c55e' : progress > 50 ? '#f59e0b' : '#3b82f6' }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="checklist-items">
                          {assignment.tasks?.map(task => (
                            <div key={task.id} className={`checklist-item ${task.completed ? 'completed' : ''}`} onClick={() => handleToggleTask(assignment.userId, task.id, task.completed)}>
                              <div className={`checkbox ${task.completed ? 'checked' : ''}`}>
                                {task.completed && <Icons.Check size={12} />}
                              </div>
                              <div className="item-content">
                                <span className="item-title">{task.title}</span>
                                <div className="item-meta">
                                  <span className={`priority ${task.priority}`}>{task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}</span>
                                  <span className="time">{task.estimatedTime}</span>
                                  {task.required && <span className="required">Bắt buộc</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
                {myAssignments.length > 0 && myAssignments.every(a => a.tasks?.every(t => t.completed)) && !caseData.report && (
                  <button className="btn btn-primary btn-report" onClick={() => setShowReportModal(true)}>
                    <Icons.FileText size={18} /> Viết báo cáo
                  </button>
                )}
              </div>
            )}
            {activeTab === 'report' && (
              <div className="report-section">
                {caseData.report ? (
                  <div className="report-submitted">
                    <div className="report-header">
                      <Icons.CheckCircle size={24} />
                      <h3>Đã nộp báo cáo</h3>
                    </div>
                    <p className="report-date">Ngày nộp: {new Date(caseData.reportSubmittedAt).toLocaleString('vi-VN')}</p>
                    <div className="report-content-box">
                      <pre>{(() => { try { return JSON.parse(caseData.report).content } catch { return caseData.report } })()}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <Icons.FileText size={48} />
                    <h3>Chưa có báo cáo</h3>
                    <p>Hoàn thành công việc để có thể nộp báo cáo.</p>
                  </div>
                )}
                {aiReview && (
                  <div className="ai-review">
                    <h4><Icons.Sparkles /> Đánh giá từ AI</h4>
                    <div className="ai-score">Điểm: {aiReview.score}/100</div>
                    {aiReview.levelNotes && <p className="level-notes">{aiReview.levelNotes}</p>}
                    {aiReview.missingItems?.length > 0 && (
                      <div className="review-section missing">
                        <strong>Cần bổ sung:</strong>
                        <ul>{aiReview.missingItems.map((item, i) => <li key={i}>{item}</li>)}</ul>
                      </div>
                    )}
                    {aiReview.suggestions?.length > 0 && (
                      <div className="review-section suggestions">
                        <strong>Gợi ý:</strong>
                        <ul>{aiReview.suggestions.map((item, i) => <li key={i}>{item}</li>)}</ul>
                      </div>
                    )}
                    <p className="ai-comments">{aiReview.comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="case-sidebar">
          {/* Team */}
          <div className="sidebar-card">
            <h3 className="sidebar-title"><Icons.Users size={18} /> Tổ công tác</h3>
            <div className="team-list">
              {teamMembers.slice(0, 6).map(member => {
                const user = users.find(u => u.id === member.userId)
                return (
                  <div key={member.userId} className="team-member">
                    <div className="member-avatar">{user?.name?.charAt(0) || '?'}</div>
                    <div className="member-info">
                      <span className="member-name">{user?.name}</span>
                      <span className="member-role">{member.role === 'truong-nhom' ? 'Trưởng nhóm' : 'Thành viên'}</span>
                    </div>
                  </div>
                )
              })}
              {teamMembers.length > 6 && <p className="more-members">+{teamMembers.length - 6} thành viên khác</p>}
            </div>
          </div>

          {/* Chat */}
          <div className="sidebar-card chat-card">
            <div className="chat-header">
              <h3><Icons.MessageSquare size={18} /> Nhóm chat</h3>
            </div>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <p className="no-messages">Chưa có tin nhắn</p>
              ) : (
                messages.slice(-10).map(msg => (
                  <div key={msg.id} className={`message ${msg.type === 'system' ? 'system' : msg.senderId === currentUser?.id ? 'own' : 'other'}`}>
                    {msg.type !== 'system' && <span className="sender">{msg.senderName}</span>}
                    <p>{msg.content}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input">
              <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Nhắn tin..." />
              <button className="btn-icon" onClick={handleSendMessage}><Icons.Send size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Button */}
      {!aiChatOpen && (
        <button className="ai-fab" onClick={() => { setAiChatOpen(true); if (aiChatMessages.length === 0) setAiChatMessages([{ role: 'ai', content: 'Xin chào! Tôi có thể giúp gì cho bạn về vụ án này?' }]) }}>
          <Icons.Bot size={24} />
        </button>
      )}

      {/* AI Chat Panel */}
      {aiChatOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <div className="ai-avatar-sm"><Icons.Bot size={20} /></div>
              <div>
                <h4>Police AI</h4>
                <span>Trợ lý điều tra</span>
              </div>
            </div>
            <button className="btn-icon" onClick={() => setAiChatOpen(false)}><Icons.X /></button>
          </div>
          <div className="ai-chat-messages">
            {aiChatMessages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                {msg.role === 'ai' && <div className="msg-avatar"><Icons.Bot size={16} /></div>}
                <div className="msg-bubble">{msg.content}</div>
                {msg.role === 'user' && <div className="msg-avatar user"><Icons.User size={16} /></div>}
              </div>
            ))}
            {aiTyping && <div className="ai-message ai typing"><div className="msg-avatar"><Icons.Bot size={16} /></div><div className="msg-bubble typing"><Icons.Loader size={14} /> Đang trả lời...</div></div>}
            <div ref={aiChatEndRef} />
          </div>
          <div className="ai-quick-actions">
            {QUICK_QUESTIONS.map(q => (
              <button key={q.id} onClick={() => sendToAI(q.question)} className="quick-btn">{q.label}</button>
            ))}
          </div>
          <div className="ai-chat-input">
            <input type="text" value={aiChatInput} onChange={e => setAiChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendToAI(aiChatInput)} placeholder="Hỏi AI..." disabled={aiTyping} />
            <button className="btn-icon" onClick={() => sendToAI(aiChatInput)} disabled={aiTyping || !aiChatInput.trim()}><Icons.Send size={16} /></button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal report-modal">
            <div className="modal-header">
              <h3><Icons.FileText size={20} /> {reportTemplate?.title || 'BÁO CÁO'}</h3>
              <button className="btn-icon" onClick={() => setShowReportModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Mô tả công việc đã thực hiện</label>
                <textarea rows="8" placeholder="Mô tả chi tiết các bước đã thực hiện..." onChange={e => setReportContent(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSubmitReport}><Icons.CheckCircle size={16} /> Nộp báo cáo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
