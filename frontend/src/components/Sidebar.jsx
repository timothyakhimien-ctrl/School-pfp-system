// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Calendar,
  Award,
  Settings,
  LogOut,
  Building2,
} from 'lucide-react';
import './sidebar.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/classes', label: 'Classes', icon: School },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/terms', label: 'Academic Terms', icon: Calendar },
  { to: '/results', label: 'Results & Grades', icon: Award },
  { to: '/settings', label: 'School Settings', icon: Settings },
];

const Sidebar = () => {
  const { user, currentSchool, logout } = useContext(AuthContext);

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'A';

  return (
    <aside className="sidebar-container">
      <div>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div className="sidebar-brand-text">
            <h1>EduTrack</h1>
            <span>SPMS Platform</span>
          </div>
        </div>

        {/* School Identifier */}
        <div className="sidebar-school-badge">
          <Building2 size={18} className="school-icon" />
          <div className="school-info">
            <span className="school-label">Current School</span>
            <span className="school-name">
              {currentSchool ? currentSchool.name : 'No School Selected'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Academic Management</div>
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="sidebar-menu-item">
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-preview">
          <div className="sidebar-user-avatar">{userInitial}</div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name" title={user?.email || 'Administrator'}>
              {user?.email || 'Administrator'}
            </span>
            <span className="sidebar-user-role">Administrator</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="sidebar-logout-btn"
          title="Sign out of SPMS"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
