
import React from 'react';

interface AdminPanelHeaderProps {
  userRole: string;
  userName: string;
}

const AdminPanelHeader = ({ userRole, userName }: AdminPanelHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Admin Panel</h1>
      <p className="text-gray-600 text-sm md:text-base">Manage users, roles, and permissions across your organization</p>
    </div>
  );
};

export default AdminPanelHeader;
