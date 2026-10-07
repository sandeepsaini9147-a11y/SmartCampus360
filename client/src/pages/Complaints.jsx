import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', category: 'all' });
  const [form, setForm] = useState({ title: '', description: '', category: 'other', priority: 'medium' });
  const [responseForm, setResponseForm] = useState({ status: '', response: '' });

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.category !== 'all') params.category = filter.category;
      const { data } = await API.get('/complaints', { params });
      setComplaints(data.complaints);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/complaints', form);
      toast.success('Complaint submitted!');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'other', priority: 'medium' });
      fetchComplaints();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleUpdate = async (id) => {
    try {
      await API.put(`/complaints/${id}`, responseForm);
      toast.success('Updated!');
      setSelected(null);
      fetchComplaints();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this complaint?')) return;
    try { await API.delete(`/complaints/${id}`); toast.success('Deleted'); fetchComplaints(); }
    catch { toast.error('Delete failed'); }
  };

  const statusColor = { pending: 'badge-pending', 'in-progress': 'badge-in-progress', resolved: 'badge-resolved', rejected: 'badge-rejected' };
  const priorityColor = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };

  return (
    <div>
      <div className="page-header">
        <h1>⚠️ Complaints</h1>
        <p>{user?.role === 'student' ? 'Submit and track your complaints' : 'Manage all complaints'}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="filters" style={{ marginBottom: 0 }}>
          <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
            <option value="all">All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="academic">Academic</option>
            <option value="hostel">Hostel</option>
            <option value="food">Food</option>
            <option value="other">Other</option>
          </select>
        </div>
        {user?.role === 'student' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Complaint</button>
        )}
      </div>

      {loading ? <p>Loading...</p> : complaints.length === 0 ? (
        <div className="empty-state"><h3>No complaints found</h3><p>No complaints match your filters.</p></div>
      ) : (
        <div className="card-grid">
          {complaints.map(c => (
            <div className="complaint-card" key={c._id}>
              <div className="complaint-header">
                <h3>{c.title}</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(user?.role === 'faculty' || user?.role === 'admin') && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setSelected(c); setResponseForm({ status: c.status, response: c.response || '' }); }}>
                      <Edit size={12} />
                    </button>
                  )}
                  {(user?.role === 'student' && c.status === 'pending') && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={12} /></button>
                  )}
                  {user?.role === 'admin' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={12} /></button>
                  )}
                </div>
              </div>
              <div className="complaint-meta">
                <span className={`badge ${statusColor[c.status]}`}>{c.status}</span>
                <span className={`badge ${priorityColor[c.priority]}`}>{c.priority}</span>
                <span className="badge badge-other" style={{ textTransform: 'capitalize' }}>{c.category}</span>
              </div>
              <p className="complaint-desc">{c.description.slice(0, 120)}{c.description.length > 120 ? '...' : ''}</p>
              <div style={{ fontSize: '.8rem', color: 'var(--text2)', display: 'flex', justifyContent: 'space-between' }}>
                <span>By: {c.submittedBy?.name}</span>
                <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              {c.response && (
                <div style={{ marginTop: 10, padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: '.85rem' }}>
                  <strong>Response:</strong> {c.response}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>📝 Submit New Complaint</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief title of the issue" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="academic">Academic</option>
                    <option value="hostel">Hostel</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue in detail..." required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <h2>Update Complaint</h2>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>{selected.title}</p>
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={responseForm.status} onChange={e => setResponseForm({ ...responseForm, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group">
              <label>Response</label>
              <textarea className="form-control" rows={4} value={responseForm.response} onChange={e => setResponseForm({ ...responseForm, response: e.target.value })} placeholder="Write a response..." />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => handleUpdate(selected._id)}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
