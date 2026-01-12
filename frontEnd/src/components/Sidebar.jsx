import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdSettings, 
  MdEmail, 
  MdSend, 
  MdHistory,
  MdPerson,
  MdPeople,
  MdDescription,
  MdTrendingUp,
  MdAdminPanelSettings,
  MdMonitor,
  MdQueuePlayNext,
  MdFactCheck
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const userNavItems = [
    { path: '/app/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/app/email-config', icon: <MdSettings />, label: 'Email Config' },
    { path: '/app/send-single', icon: <MdEmail />, label: 'Send Single' },
    { path: '/app/send-bulk', icon: <MdSend />, label: 'Send Bulk' },
    { path: '/app/email-logs', icon: <MdHistory />, label: 'Email Logs' },
    { path: '/app/profile', icon: <MdPerson />, label: 'Profile' },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
    { path: '/admin/monitor', icon: <MdMonitor />, label: 'System Monitor' },
    { path: '/admin/queue', icon: <MdQueuePlayNext />, label: 'Queue Management' },
    { path: '/admin/audit-logs', icon: <MdFactCheck />, label: 'Audit Logs' },
    { path: '/admin/emails', icon: <MdEmail />, label: 'Email Management' },
    { path: '/admin/users', icon: <MdPeople />, label: 'User Management' },
    { path: '/admin/templates', icon: <MdDescription />, label: 'Templates' },
    { path: '/admin/analytics', icon: <MdTrendingUp />, label: 'Analytics' },
    { path: '/admin/settings', icon: <MdSettings />, label: 'Settings' },
  ];

  const navItems = isAdminRoute ? adminNavItems : userNavItems;

  return (
    <aside className="sidebar">
      {isAdmin && (
        <div style={{ padding: '15px', borderBottom: '1px solid #e0e0e0' }}>
          <NavLink
            to={isAdminRoute ? '/app/dashboard' : '/admin/dashboard'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 15px',
              background: '#667eea',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}
          >
            <MdAdminPanelSettings />
            {isAdminRoute ? 'User Panel' : 'Admin Panel'}
          </NavLink>
        </div>
      )}
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
