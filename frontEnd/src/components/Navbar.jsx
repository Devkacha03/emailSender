import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLogout } from 'react-icons/md';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <MdEmail />
        <span>Email Sender</span>
      </div>
      <div className="navbar-right">
        <div className="user-info">
          <div className="user-avatar">{getInitials(user?.userName)}</div>
          <div className="user-details">
            <div className="user-name">{user?.userName}</div>
            <div className="user-email">{user?.userEmail}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
