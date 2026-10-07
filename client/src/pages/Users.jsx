import { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Trash2, UserCheck, UserX } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetch = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.role = filter;
      if (search) params.search = search;
      const { data } = await API.get('/users', { params });
      setUsers(data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [filter, search]);

  const handleToggle = async (id) => {
    try { await API.put(`/users/${id}/toggle`); toast.success('Updated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    try { await API.delete(`/users/${id}`); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>👥 Manage Users</h1>
        <p>Admin — all registered users</p>
      </div>

      <div className="filters">
        <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 14px', border: '2px solid var(--border)', borderRadius: 8, minWidth: 220 }} />
        {['all', 'student', 'faculty', 'admin'].map(r => (
          <button key={r} className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(r)} style={{ textTransform: 'capitalize' }}>{r}</button>
        ))}
      </div>

      <div className="card">
        {loading ? <p>Loading...</p> : users.length === 0 ? (
          <div className="empty-state"><h3>No users found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '.88rem' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role}`} style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{u.department || '—'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-resolved' : 'badge-rejected'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: '.85rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => handleToggle(u._id)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
