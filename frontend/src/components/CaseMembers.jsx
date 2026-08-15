import React, { useState } from 'react';
import api from '../services/api';

export default function CaseMembers({ 
  caseId, 
  members = [], 
  users = [],
  currentUser = null,
  onRefresh 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('thanh-vien');
  const [loading, setLoading] = useState(false);

  const isAdminOrLead = currentUser?.role === 'quan-tri' || currentUser?.role === 'lanh-dao';
  
  // Get available users (not yet in case)
  const availableUsers = users.filter(user => 
    !members.some(m => m.userId === user.id) && user.isActive !== false
  );

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      await api.post(`/cases/${caseId}/members`, {
        userId: selectedUserId,
        role: selectedRole
      });
      // Also add to chat channel
      const channelRes = await api.get(`/chat/channels/case/${caseId}`);
      if (channelRes?.id) {
        await api.post(`/chat/channels/${channelRes.id}/members`, {
          userId: selectedUserId
        });
      }
      setShowAddModal(false);
      setSelectedUserId('');
      setSelectedRole('thanh-vien');
      onRefresh?.();
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa thành viên này?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/cases/${caseId}/members/${userId}`);
      onRefresh?.();
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/cases/${caseId}/members/${userId}/role`, newRole);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const getRoleBadgeClass = (role) => {
    return role === 'truong-nhom' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getRoleLabel = (role) => {
    return role === 'truong-nhom' ? 'Trưởng nhóm' : 'Thành viên';
  };

  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          👥 Thành viên vụ án ({members.length})
        </h3>
        {isAdminOrLead && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            + Thêm thành viên
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">👤</p>
          <p>Chưa có thành viên nào</p>
          {isAdminOrLead && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-blue-600 hover:underline"
            >
              Thêm thành viên đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => {
            const userInfo = getUserInfo(member.userId);
            return (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userInfo?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {userInfo?.name || member.userId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userInfo?.title || userInfo?.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </span>
                  {isAdminOrLead && member.userId !== currentUser?.id && (
                    <div className="flex gap-1">
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.userId, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5"
                      >
                        <option value="truong-nhom">Trưởng nhóm</option>
                        <option value="thanh-vien">Thành viên</option>
                      </select>
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-red-500 hover:text-red-700 px-2"
                        title="Xóa thành viên"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Thêm thành viên vào vụ án</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn thành viên
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn thành viên --</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role === 'lanh-dao' ? 'Trưởng nhóm' : user.role === 'can-bo' ? 'Cán bộ' : 'Admin'})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò trong vụ án
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="thanh-vien">Thành viên</option>
                <option value="truong-nhom">Trưởng nhóm</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUserId('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
