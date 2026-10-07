import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { AlertCircle, Calendar, Megaphone, BookOpen, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const studentStats = [
    { label: 'My Complaints', value: stats.myComplaints || 0, icon: <AlertCircle size={22} />, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Pending', value: stats.pendingComplaints || 0, icon: <Clock size={22} />, color: '#f59e0b', bg: '#fef9c3' },
    { label: 'Resolved', value: stats.resolvedComplaints || 0, icon: <CheckCircle size={22} />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Upcoming Events', value: stats.upcomingEvents || 0, icon: <Calendar size={22} />, color: '#06b6d4', bg: '#cffafe' },
    { label: 'Registered Events', value: stats.registeredEvents || 0, icon: <TrendingUp size={22} />, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Resources', value: stats.totalResources || 0, icon: <BookOpen size={22} />, color: '#ec4899', bg: '#fce7f3' },
  ];

  const facultyStats = [
    { label: 'My Events', value: stats.myEvents || 0, icon: <Calendar size={22} />, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'My Announcements', value: stats.myAnnouncements || 0, icon: <Megaphone size={22} />, color: '#06b6d4', bg: '#cffafe' },
    { label: 'My Resources', value: stats.myResources || 0, icon: <BookOpen size={22} />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Total Complaints', value: stats.totalComplaints || 0, icon: <AlertCircle size={22} />, color: '#f59e0b', bg: '#fef9c3' },
    { label: 'Pending Complaints', value: stats.pendingComplaints || 0, icon: <Clock size={22} />, color: '#ef4444', bg: '#fee2e2' },
  ];

  const adminStats = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: <Users size={22} />, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Students', value: stats.totalStudents || 0, icon: <Users size={22} />, color: '#06b6d4', bg: '#cffafe' },
    { label: 'Faculty', value: stats.totalFaculty || 0, icon: <Users size={22} />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Total Complaints', value: stats.totalComplaints || 0, icon: <AlertCircle size={22} />, color: '#f59e0b', bg: '#fef9c3' },
    { label: 'Pending', value: stats.pendingComplaints || 0, icon: <Clock size={22} />, color: '#ef4444', bg: '#fee2e2' },
    { label: 'Resolved', value: stats.resolvedComplaints || 0, icon: <CheckCircle size={22} />, color: '#10b981', bg: '#dcfce7' },
    { label: 'Events', value: stats.totalEvents || 0, icon: <Calendar size={22} />, color: '#8b5cf6', bg: '#ede9fe' },
    { label: 'Resources', value: stats.totalResources || 0, icon: <BookOpen size={22} />, color: '#ec4899', bg: '#fce7f3' },
  ];

  const statCards = user?.role === 'admin' ? adminStats : user?.role === 'faculty' ? facultyStats : studentStats;

  const roleEmoji = { student: '🎒', faculty: '👨‍🏫', admin: '⚙️' };

  return (
    <div>
      <div className="page-header">
        <h1>{roleEmoji[user?.role]} Welcome, {user?.name}!</h1>
        <p style={{ textTransform: 'capitalize' }}>{user?.role} Dashboard — {user?.department || 'Smart Campus 360'}</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text2)' }}>Loading stats...</p>
      ) : (
        <div className="stat-grid">
          {statCards.map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="stat-info">
                <h3 style={{ color: s.color }}>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>🚀 Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user?.role === 'student' && <>
              <a href="/complaints" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>📝 Submit Complaint</a>
              <a href="/events" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>📅 View Events</a>
              <a href="/resources" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>📚 Browse Resources</a>
            </>}
            {user?.role === 'faculty' && <>
              <a href="/events" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>📅 Create Event</a>
              <a href="/announcements" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>📢 Post Announcement</a>
              <a href="/resources" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>📚 Upload Resource</a>
              <a href="/complaints" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>⚠️ Review Complaints</a>
            </>}
            {user?.role === 'admin' && <>
              <a href="/users" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>👥 Manage Users</a>
              <a href="/complaints" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>⚠️ All Complaints</a>
              <a href="/announcements" className="btn btn-secondary btn-sm" style={{ justifyContent: 'center' }}>📢 Announcements</a>
            </>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>ℹ️ Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '.9rem' }}>
            {[
              ['Name', user?.name],
              ['Email', user?.email],
              ['Role', user?.role],
              ['Department', user?.department || '—'],
              ...(user?.role === 'student' ? [['Year', user?.year || '—']] : []),
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>{label}</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
