import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import api from '../services/api'

// SVG Icons
const Icons = {
  Bot: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8"/>
      <rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/>
      <path d="M20 14h2"/>
      <path d="M15 13v2"/>
      <path d="M9 13v2"/>
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/>
      <path d="M22 2 11 13"/>
    </svg>
  ),
  Loader: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  ),
  MessageSquare: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  FileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" x2="8" y1="13" y2="13"/>
      <line x1="16" x2="8" y1="17" y2="17"/>
    </svg>
  ),
  FolderOpen: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/>
      <path d="M10 13v-1h4v1"/>
      <path d="M12 18v-5"/>
      <path d="M8 18v-3"/>
      <path d="M16 18v-5"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
}

// Suggested prompts for general AI chat
const SUGGESTED_PROMPTS = [
  // Nhân sự
  { id: 'staff', label: 'Danh sach can bo', prompt: 'Hien co nhung can bo nao trong he thong? Cho biet chuc vu va ky nang cua tung nguoi.' },
  { id: 'who', label: 'Ai dang lam gi', prompt: 'Cho biet can bo nao dang duoc phan cong nhiem vu gi? Ai dang lam viec tren vu an nao?' },
  { id: 'progress', label: 'Tien do cong viec', prompt: 'Tinh trang tien do cua cac vu an hien tai nhu the nao? Nhung ai da hoan thanh, ai con dang lam?' },
  { id: 'available', label: 'Can bo ranh', prompt: 'Can bo nao hien dang ranh, chua co viec phan cong?' },
  
  // Quy trình
  { id: 'explain', label: 'Giai thich quy trinh', prompt: 'Giai thich quy trinh Kham nghiem hien truong duoc thuc hien nhu the nao?' },
  { id: 'report', label: 'Huong dan viet bao cao', prompt: 'Huong dan viet mot bao cao kham nghiem hien truong tot?' },
  { id: 'evidence', label: 'Thu thap vat chung', prompt: 'Nhung phuong phap nao de thu thap va bao quan vat chung hieu qua?' },
  { id: 'analysis', label: 'Phan tich chung cu', prompt: 'Lam the nao de phan tich chung cu tai hien truong?' },
  
  // Vụ án
  { id: 'case-status', label: 'Tinh trang vu an', prompt: 'Tong hop tinh trang tat ca cac vu an hien tai: bao nhieu vu moi, dang xu ly, hoan thanh?' },
  { id: 'overdue', label: 'Vu an qua han', prompt: 'Co vu an nao bi tre han hoac qua han khong? Ai la nguoi phu trach chinh?' },
]

// System prompt for investigation assistant
const SYSTEM_PROMPT = `Ban la tro ly AI chuyen nghiep trong linh vuc Ho so An ninh, Dieu tra, Kham nghiem hien truong.

Kha nang cua ban:
- Tu van ve quy trinh dieu tra, kham nghiem hien truong
- Huong dan viet bao cao, lap ho so
- Giai dap thac mac ve ky thuat thu thap chung cu
- Chi ra cac buoc can thuc hien trong dieu tra
- Tom tat va phan tich thong tin lien quan den vu viec

Nguyen tac hoat dong:
- AI CHI HO TRO, khong thay the quyet dinh cua con nguoi
- Dua ra goi y, khuyen cao nhung quyet dinh cuoi cung la cua can bo co tham quyen
- Tra loi bang tieng Viet, chuyen nghiep, chinh xac
- Neu khong chac chan, hay noi ro rang ban dang kho xac dinh`

export default function AiChat() {
  const { currentUser, cases, users, aiStatus } = useApp()
  
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)
  const [showCaseSelector, setShowCaseSelector] = useState(false)
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSelectCase = (caseItem) => {
    setSelectedCase(caseItem)
    setShowCaseSelector(false)
    // Add system message about selected case
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'system',
      content: `Da chon vu an: ${caseItem.caseNumber} - ${caseItem.title}`
    }])
  }

  const sendMessage = async (text = inputValue) => {
    if (!text.trim()) return
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Send message with ALL data for comprehensive AI context
      const result = await api.post('/ai/chat', {
        message: text,
        history: messages
          .filter(m => m.role !== 'system')
          .slice(-10)
          .map(m => ({ role: m.role, content: m.content })),
        cases: cases, // All cases
        users: users,  // All users (can bo, lanh dao)
        selectedCaseId: selectedCase?.id // Selected case for detailed context
      })
      
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: result.message || 'Xin loi, khong the tra loi luc nay.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Xin loi, da xay ra loi ket noi. Vui long thu lai sau.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleSuggestedPrompt = (prompt) => {
    sendMessage(prompt)
  }

  const clearChat = () => {
    setMessages([])
    setSelectedCase(null)
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="ai-chat-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="page-icon">
            <Icons.Bot />
          </div>
          <div>
            <h1 className="page-title">AI Assistant</h1>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '4px' }}>
              Quan ly kham nghiem hien truong thong minh
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedCase && (
            <div className="selected-case-badge">
              <Icons.FolderOpen />
              <span>{selectedCase.caseNumber}</span>
              <button onClick={() => setSelectedCase(null)} className="remove-case">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          )}
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCaseSelector(!showCaseSelector)}
          >
            <Icons.FolderOpen />
            Chon vu an
          </button>
          {messages.length > 0 && (
            <button className="btn btn-secondary" onClick={clearChat}>
              <Icons.Trash />
              Xoa chat
            </button>
          )}
        </div>
      </div>

      {/* Case Selector Dropdown */}
      {showCaseSelector && (
        <div className="case-selector-overlay" onClick={() => setShowCaseSelector(false)}>
          <div className="case-selector" onClick={e => e.stopPropagation()}>
            <div className="case-selector-header">
              <h3>Chon vu an de hoi AI</h3>
              <button onClick={() => setShowCaseSelector(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="case-selector-list">
              {cases.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  Chua co vu an nao
                </p>
              ) : (
                cases.map(c => (
                  <div 
                    key={c.id}
                    className={`case-selector-item ${selectedCase?.id === c.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCase(c)}
                  >
                    <div className="case-selector-item-info">
                      <strong>{c.caseNumber}</strong>
                      <span>{c.title}</span>
                    </div>
                    <span className={`badge badge-${c.status === 'hoan-thanh' ? 'success' : c.status === 'dang-xu-ly' ? 'primary' : 'warning'}`}>
                      {c.status === 'moi' ? 'Moi' : c.status === 'dang-xu-ly' ? 'Dang xu ly' : c.status === 'hoan-thanh' ? 'Hoan thanh' : c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="ai-chat-content">
        {/* Sidebar with suggestions */}
        <div className="ai-chat-sidebar">
          <div className="sidebar-section">
            <h4>Cac cau hoi goi y</h4>
            <div className="suggested-prompts">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt.id}
                  className="suggested-prompt-btn"
                  onClick={() => handleSuggestedPrompt(prompt.prompt)}
                >
                  <Icons.MessageSquare />
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4>Huong dan</h4>
            <div className="help-info">
              <p>Ban co the:</p>
              <ul>
                <li>Hoi truc tiep ve quy trinh dieu tra</li>
                <li>Chon vu an de AI hieu ngu can cu</li>
                <li>Sao chep noi dung tra loi</li>
              </ul>
            </div>
          </div>

          <div className="sidebar-section ai-model-info">
            <div className="model-badge">
              <Icons.Sparkles />
              <div>
                <strong>Police Supporter</strong>
                <span>Quản lý khám nghiệm thông minh</span>
              </div>
            </div>
            <div className={`status-indicator ${aiStatus.status}`}>
              <span className="status-dot"></span>
              {aiStatus.status === 'online' ? 'Dang hoat dong' : 'Dang offline'}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="ai-chat-main">
          <div className="chat-messages-container">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-empty-icon">
                  <Icons.Sparkles />
                </div>
                <h3>Bat dau cuoc tro chuyen</h3>
                <p>Nhan tin cho AI Assistant de duoc ho tro ve cac van de dieu tra, kham nghiem hien truong.</p>
                
                <div className="quick-prompts">
                  <p>Cac cau hoi nhanh:</p>
                  <div className="quick-prompt-chips">
                    {SUGGESTED_PROMPTS.slice(0, 3).map(prompt => (
                      <button
                        key={prompt.id}
                        className="quick-prompt-chip"
                        onClick={() => handleSuggestedPrompt(prompt.prompt)}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.filter(m => m.role !== 'system').map(msg => (
                  <div 
                    key={msg.id} 
                    className={`chat-message ${msg.role === 'ai' ? 'ai-message' : 'user-message'}`}
                  >
                    <div className="message-avatar">
                      {msg.role === 'ai' ? <Icons.Bot /> : <Icons.User />}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {msg.role === 'ai' ? 'AI Assistant' : currentUser?.name}
                        </span>
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                        {msg.role === 'ai' && (
                          <button 
                            className="copy-btn"
                            onClick={() => copyMessage(msg.content)}
                            title="Sao chep"
                          >
                            <Icons.Copy />
                          </button>
                        )}
                      </div>
                      <div className="message-bubble">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="chat-message ai-message">
                    <div className="message-avatar">
                      <Icons.Bot />
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">AI Assistant</span>
                      </div>
                      <div className="message-bubble typing">
                        <Icons.Loader /> Dang tra loi...
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Nhap cau hoi cho AI..."
              disabled={isTyping}
            />
            <button 
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={isTyping || !inputValue.trim()}
            >
              <Icons.Send />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
