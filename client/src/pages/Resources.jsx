import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Download, FileText } from 'lucide-react';

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', subject: '', type: 'notes', fileUrl: '', department: '', semester: '' });

  const fetch = async () => {
    try {
      const params = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (search) params.search = search;
      const { data } = await API.get('/resources', { params });
      setResources(data.resources);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [typeFilter, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/resources', form);
      toast.success('Resource uploaded!');
      setShowModal(false);
      setForm({ title: '', description: '', subject: '', type: 'notes', fileUrl: '', department: '', semester: '' });
      fetch();
    } catch { toast.error('Failed'); }
  };

  const handleDownload = async (id, url) => {
    await API.put(`/resources/${id}/download`);
    if (url) window.open(url, '_blank');
    else toast.success('Download counted!');
    fetch();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await API.delete(`/resources/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const typeEmoji = { notes: '📝', assignment: '📋', paper: '📄', syllabus: '📚', other: '📁' };

  return (
    <div>
      <div className="page-header">
        <h1>📚 Resources</h1>
        <p>Study materials and documents</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="filters" style={{ marginBottom: 0 }}>
          <input placeholder="Search subject or title..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 14px', border: '2px solid var(--border)', borderRadius: 8, minWidth: 200 }} />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '8px 14px', border: '2px solid var(--border)', borderRadius: 8 }}>
            <option value="all">All Types</option>
            <option value="notes">Notes</option>
            <option value="assignment">Assignment</option>
            <option value="paper">Paper</option>
            <option value="syllabus">Syllabus</option>
            <option value="other">Other</option>
          </select>
        </div>
        {(user?.role === 'faculty' || user?.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Upload Resource</button>
        )}
      </div>

      {loading ? <p>Loading...</p> : resources.length === 0 ? (
        <div className="empty-state"><h3>No resources found</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {resources.map(r => (
            <div className="resource-card" key={r._id}>
              <div className="resource-icon">{typeEmoji[r.type]}</div>
              <div className="resource-info">
                <h3>{r.title}</h3>
                <p>{r.subject} {r.department ? `• ${r.department}` : ''} {r.semester ? `• Sem ${r.semester}` : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <span className={`badge badge-${r.type}`} style={{ textTransform: 'capitalize' }}>{r.type}</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text2)' }}><Download size={12} style={{ display: 'inline' }} /> {r.downloads}</span>
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload(r._id, r.fileUrl)}>
                  <Download size={13} /> Download
                </button>
                {(user?.role === 'faculty' || user?.role === 'admin') && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}><Trash2 size={13} /></button>
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
            <h2>📚 Upload Resource</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Subject</label>
                  <input className="form-control" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="paper">Paper</option>
                    <option value="syllabus">Syllabus</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. CSE" />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input className="form-control" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} placeholder="e.g. 4" />
                </div>
              </div>
              <div className="form-group">
                <label>File URL (Google Drive / GitHub link)</label>
                <input className="form-control" type="url" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
