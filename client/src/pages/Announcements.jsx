import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', content: '', category: 'general', targetAudience: 'all' });

  const fetch = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const { data } = await API.get('/announcements', { params });
      setAnnouncements(data.announcements);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/announcements', form);
      toast.success('Announcement posted!');
      setShowModal(false);
      setForm({ title: '', content: '', category: 'general', targetAudience: 'all' });
      fetch();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await API.delete(`/announcements/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const catEmoji = { academic: '📚', exam: '📝', holiday: '🎉', general: '📢', urgent: '🚨' };

  return (
    <div>
      <div className="page-header">
        <h1>📢 Announcements</h1>
        <p>Campus notices and updates</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <div className="filters" style={{ marginBottom: 0 }}>
          {['all', 'academic', 'exam', 'holiday', 'general', 'urgent'].map(c => (
            <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(c)} style={{ textTransform: 'capitalize' }}>{c}</button>
          ))}
        </div>
        {(user?.role === 'faculty' || user?.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Post Announcement</button>
        )}
      </div>

      {loading ? <p>Loading...</p> : announcements.length === 0 ? (
        <div className="empty-state"><h3>No announcements</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {announcements.map(a => (
            <div className={`ann-card ${a.category}`} key={a._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{catEmoji[a.category]}</span>
                    <h3 className="ann-title">{a.title}</h3>
                    <span className={`badge badge-${a.category}`} style={{ textTransform: 'capitalize' }}>{a.category}</span>
                    {a.targetAudience !== 'all' && <span className={`badge badge-${a.targetAudience}`} style={{ textTransform: 'capitalize' }}>{a.targetAudience} only</span>}
                  </div>
                  <p className="ann-content">{a.content}</p>
                  <div className="ann-meta">
                    <span>By: {a.createdBy?.name} ({a.createdBy?.role})</span>
                    <span>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                {(user?.role === 'faculty' || user?.role === 'admin') && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)} style={{ marginLeft: 12 }}><Trash2 size={13} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>📢 Post Announcement</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="exam">Exam</option>
                    <option value="holiday">Holiday</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select className="form-control" value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}>
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea className="form-control" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
