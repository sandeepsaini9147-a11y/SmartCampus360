import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, MapPin, Clock, Users } from 'lucide-react';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', category: 'academic', date: '', time: '', venue: '', organizer: '', maxParticipants: 100 });

  const fetchEvents = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const { data } = await API.get('/events', { params });
      setEvents(data.events);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events', form);
      toast.success('Event created!');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'academic', date: '', time: '', venue: '', organizer: '', maxParticipants: 100 });
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRegister = async (id) => {
    try {
      const { data } = await API.post(`/events/${id}/register`);
      toast.success(data.registered ? 'Registered!' : 'Unregistered');
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try { await API.delete(`/events/${id}`); toast.success('Deleted'); fetchEvents(); }
    catch { toast.error('Delete failed'); }
  };

  const categoryEmoji = { academic: '📚', cultural: '🎭', sports: '🏆', technical: '💻', other: '🎯' };

  return (
    <div>
      <div className="page-header">
        <h1>📅 Events</h1>
        <p>Campus events and activities</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="filters" style={{ marginBottom: 0 }}>
          {['all', 'academic', 'cultural', 'sports', 'technical', 'other'].map(cat => (
            <button key={cat} className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(cat)} style={{ textTransform: 'capitalize' }}>{cat}</button>
          ))}
        </div>
        {(user?.role === 'faculty' || user?.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Event</button>
        )}
      </div>

      {loading ? <p>Loading...</p> : events.length === 0 ? (
        <div className="empty-state"><h3>No events found</h3></div>
      ) : (
        <div className="card-grid">
          {events.map(ev => {
            const isRegistered = ev.registrations?.includes(user?.id);
            const isFull = ev.registrations?.length >= ev.maxParticipants;
            return (
              <div className="event-card" key={ev._id}>
                <div className="event-date">{categoryEmoji[ev.category]} {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                <div className="event-title">{ev.title}</div>
                <div className="event-meta">
                  {ev.venue && <span><MapPin size={13} /> {ev.venue}</span>}
                  {ev.time && <span><Clock size={13} /> {ev.time}</span>}
                  <span><Users size={13} /> {ev.registrations?.length || 0}/{ev.maxParticipants}</span>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: '.87rem', marginBottom: 12 }}>{ev.description.slice(0, 100)}...</p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge badge-${ev.category}`} style={{ textTransform: 'capitalize' }}>{ev.category}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {user?.role === 'student' && (
                      <button className={`btn btn-sm ${isRegistered ? 'btn-secondary' : isFull ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => handleRegister(ev._id)} disabled={isFull && !isRegistered}>
                        {isRegistered ? '✓ Registered' : isFull ? 'Full' : 'Register'}
                      </button>
                    )}
                    {(user?.role === 'faculty' || user?.role === 'admin') && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev._id)}><Trash2 size={12} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>📅 Create Event</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="academic">Academic</option>
                    <option value="cultural">Cultural</option>
                    <option value="sports">Sports</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Time</label>
                  <input className="form-control" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Max Participants</label>
                  <input className="form-control" type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Venue</label>
                  <input className="form-control" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="e.g. Auditorium" />
                </div>
                <div className="form-group">
                  <label>Organizer</label>
                  <input className="form-control" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
