import React, { useState } from 'react';
import api from '../services/api';
import ProgressBar from './ProgressBar';

export default function CaseTemplates({ 
  caseId, 
  caseTemplates = [],
  assignments = [],
  availableTemplates = [],
  users = [],
  members = [],
  currentUser = null,
  onRefresh 
}) {
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [expandedAssignments, setExpandedAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  
  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimatedTime: '30 phút',
    required: true
  });

  const isAdminOrLead = currentUser?.role === 'quan-tri' || currentUser?.role === 'lanh-dao';

  const memberUsers = members
    .map(m => users.find(u => u.id === m.userId))
    .filter(Boolean);

  // Tạo task mới cho một người cụ thể (custom task)
  const handleCreateTask = async () => {
    if (!selectedUserId || !newTask.title.trim()) {
      alert('Vui lòng chọn người và nhập tên task!');
      return;
    }
    
    const user = users.find(u => u.id === selectedUserId);
    const member = members.find(m => m.userId === selectedUserId);
    const role = member?.role || 'thanh-vien'; // Lấy vai trò từ thành viên
    
    setLoading(true);
    try {
      await api.post(`/cases/${caseId}/assign-task`, {
        templateId: 'custom', // Mark as custom task
        userId: selectedUserId,
        userName: user?.name || selectedUserId,
        assignedBy: currentUser.id,
        role: role, // Lấy vai trò từ member, không cần chọn lại
        customTask: {
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          estimatedTime: newTask.estimatedTime,
          required: newTask.required
        }
      });
      
      setShowAddTaskModal(false);
      setSelectedUserId('');
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        estimatedTime: '30 phút',
        required: true
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Có lỗi khi tạo nhiệm vụ: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (key) => {
    setExpandedAssignments(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getAssignedUserName = (assignment) => {
    const user = users.find(u => u.id === assignment.userId);
    return user?.name || assignment.userName || assignment.userId;
  };

  // Group assignments by user
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const userName = getAssignedUserName(assignment);
    if (!acc[userName]) {
      acc[userName] = [];
    }
    acc[userName].push(assignment);
    return acc;
  }, {});

  return (
    <div>
      {/* Header with Add Task Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📋 Nhiệm vụ của vụ án
        </h3>
        {isAdminOrLead && (
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            + Tạo nhiệm vụ mới
          </button>
        )}
      </div>

      {/* Assigned Tasks - Detailed Checklist View */}
      <div>
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg font-medium">Chưa có nhiệm vụ nào</p>
            <p className="text-sm mt-2">Tạo nhiệm vụ mới để bắt đầu</p>
            {isAdminOrLead && (
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                + Tạo nhiệm vụ đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAssignments).map(([userName, userAssignments]) => {
              const isMe = userAssignments[0]?.userId === currentUser?.id;
              
              // Calculate overall progress for this user
              const totalTasks = userAssignments.reduce((sum, a) => sum + (a.tasks?.length || 0), 0);
              const completedTasks = userAssignments.reduce((sum, a) => sum + (a.tasks?.filter(t => t.completed).length || 0), 0);
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              
              return (
                <div key={userName} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* User Header */}
                  <div 
                    className={`px-4 py-3 cursor-pointer ${isMe ? 'bg-blue-50' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                    onClick={() => toggleExpand(userName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          isMe ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {userName}
                            {isMe && <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">(Bạn)</span>}
                          </p>
                          <p className="text-xs text-gray-500">
                            {userAssignments.length} nhiệm vụ
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-600">
                            {completedTasks}/{totalTasks}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">hoàn thành</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${progress}%`,
                                backgroundColor: progress === 100 ? '#22c55e' : progress > 50 ? '#f59e0b' : '#3b82f6'
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold" style={{ 
                            color: progress === 100 ? '#22c55e' : progress > 50 ? '#f59e0b' : '#3b82f6'
                          }}>
                            {progress}%
                          </span>
                        </div>
                        <button className="text-gray-500 hover:text-gray-700">
                          {expandedAssignments[userName] ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Task Details */}
                  {expandedAssignments[userName] && (
                    <div className="p-4 border-t border-gray-200">
                      {userAssignments.map((assignment, idx) => (
                        <div key={`${assignment.userId}-${idx}`} className="mb-4 last:mb-0">
                          {/* Assignment Header */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {assignment.taskTemplateName || 'Nhiệm vụ'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              assignment.role === 'truong-nhom' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {assignment.role === 'truong-nhom' ? '🎖️ Trưởng nhóm' : '👤 Thành viên'}
                            </span>
                          </div>

                          {/* Checklist Items */}
                          <div className="space-y-1">
                            {assignment.tasks?.map(task => (
                              <div 
                                key={task.id} 
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                  task.completed 
                                    ? 'bg-green-50' 
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <span className={`text-lg ${task.completed ? 'text-green-500' : 'text-gray-300'}`}>
                                  {task.completed ? '☑' : '☐'}
                                </span>
                                <div className="flex-1">
                                  <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-xs text-gray-400">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                                    {' '}{task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    ⏱️ {task.estimatedTime}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Tạo nhiệm vụ mới</h3>
            
            {/* Select User First */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giao cho *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn thành viên --</option>
                {memberUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.title || user.role})
                  </option>
                ))}
              </select>
              {memberUsers.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  ⚠️ Cần thêm thành viên vào vụ án trước!
                </p>
              )}
            </div>

            {/* Task Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhiệm vụ *
              </label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="VD: Khám nghiệm hiện trường, thu thập chứng cứ..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Mô tả chi tiết nhiệm vụ cần thực hiện..."
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Priority and Time */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="high">🔴 Cao</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="low">🟢 Thấp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian ước tính
                </label>
                <input
                  type="text"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({...newTask, estimatedTime: e.target.value})}
                  placeholder="VD: 30 phút, 2 giờ..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Required checkbox */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTask.required}
                  onChange={(e) => setNewTask({...newTask, required: e.target.checked})}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Nhiệm vụ bắt buộc</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setSelectedUserId('');
                  setNewTask({
                    title: '',
                    description: '',
                    priority: 'medium',
                    estimatedTime: '30 phút',
                    required: true
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!selectedUserId || !newTask.title.trim() || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo nhiệm vụ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
