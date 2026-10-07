import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, AlertCircle, Calendar, Megaphone, BookOpen, Users, LogOut, User } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['student', 'faculty', 'admin'] },
    { to: '/complaints', icon: <AlertCircle size={18} />, label: 'Complaints', roles: ['student', 'faculty', 'admin'] },
    { to: '/events', icon: <Calendar size={18} />, label: 'Events', roles: ['student', 'faculty', 'admin'] },
    { to: '/announcements', icon: <Megaphone size={18} />, label: 'Announcements', roles: ['student', 'faculty', 'admin'] },
    { to: '/resources', icon: <BookOpen size={18} />, label: 'Resources', roles: ['student', 'faculty', 'admin'] },
    { to: '/users', icon: <Users size={18} />, label: 'Manage Users', roles: ['admin'] },
    { to: '/profile', icon: <User size={18} />, label: 'My Profile', roles: ['student', 'faculty', 'admin'] },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h1>🎓 Smart Campus</h1>
        <p>360° Campus Management</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Menu</div>
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p>{user?.name}</p>
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 10 }}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );
}
