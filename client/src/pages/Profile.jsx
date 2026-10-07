import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', year: user?.year || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await updateProfile(form); toast.success('Profile updated!'); }
    catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const roleColor = { student: '#6366f1', faculty: '#10b981', admin: '#ef4444' };

  return (
    <div>
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account details</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, maxWidth: 900 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: roleColor[user?.role], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 16px' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text2)', marginBottom: 12 }}>{user?.email}</p>
          <span className={`badge badge-${user?.role}`} style={{ textTransform: 'capitalize', fontSize: '.85rem', padding: '5px 14px' }}>{user?.role}</span>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8, text: 'left' }}>
            {[['Department', user?.department], ['Year', user?.year], ['Phone', user?.phone]].map(([l, v]) => v ? (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text2)' }}>{l}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ) : null)}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: 20 }}>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email (cannot change)</label>
              <input className="form-control" value={user?.email} disabled style={{ opacity: .6 }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. CSE, ECE" />
              </div>
              {user?.role === 'student' && (
                <div className="form-group">
                  <label>Year</label>
                  <select className="form-control" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
