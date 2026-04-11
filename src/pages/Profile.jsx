import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContextObj';
import api from '../api/axios';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalHours: 0, sessionsJoined: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', course: '', skill_level: '', location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        course: user.course || '',
        skill_level: user.skill_level || 'Intermediate',
        location: user.location || ''
      });
      fetchProfileStats();
    }
  }, [user]);

  const fetchProfileStats = async () => {
    try {
      const logRes = await api.get('/logs/dashboard');
      const sessionRes = await api.get('/sessions');
      const joinedCount = sessionRes.data.filter(s => s.members?.some(m => m.id === user?.id)).length;
      setStats({ totalHours: logRes.data.totalHours || 0, sessionsJoined: joinedCount });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/users/profile', formData);
      setEditing(false);
      window.location.reload(); // Refresh to get updated context
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 relative">
      {/* Profile Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-end gap-10">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Legendary AIT Scholar
          </div>
          
          <h2 className="text-5xl md:text-7xl font-headline font-extrabold text-primary tracking-tighter leading-none">
            {user?.name ? user.name.split(' ')[0] : 'Scholar'} <br/>
            <span className="text-secondary">{user?.name ? user.name.split(' ').slice(1).join(' ') : ''}</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-on-surface-variant font-medium max-w-xl">
            Pursuing Excellence at <span className="text-primary font-bold">AIT</span>. Dedicated to {user?.course || 'academic'} excellence and peer collaboration.
          </p>
          
          <div className="flex flex-wrap gap-3 pt-4">
            <span className="px-5 py-2 rounded-full bg-surface-container-highest text-primary font-semibold text-sm">{user?.course || 'No course set'}</span>
            <span className="px-5 py-2 rounded-full border border-outline-variant/30 text-outline font-medium text-sm hover:bg-surface-container-highest cursor-pointer transition-colors">+ Add Expertise</span>
          </div>
        </div>

        {/* Profile Identity Card */}
        <div className="w-full lg:w-[400px] glass-card rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 border border-white/40">
          <div className="relative h-64 bg-primary-container">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl bg-secondary flex items-center justify-center text-4xl font-bold text-primary rotate-3 transform hover:rotate-0 transition-transform duration-500">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
            </div>
          </div>
          <div className="p-8 text-center space-y-4">
            <p className="text-sm font-label text-on-surface-variant leading-relaxed">
              Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}. Email: <b>{user?.email}</b>
            </p>
            <button 
              onClick={() => setEditing(true)}
              className="w-full py-4 bg-primary-container text-white rounded-xl font-bold hover:bg-primary transition-all active:scale-95"
            >
              Edit Public Profile
            </button>
          </div>
        </div>
      </section>

      {/* Edit Profile Drawer/Modal */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm" onClick={() => setEditing(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold text-primary font-headline">Edit Profile</h3>
              <button 
                onClick={() => setEditing(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6 flex-grow">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 px-5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Course of Study</label>
                <input 
                  type="text" 
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value})}
                  className="w-full h-14 px-5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary transition-all font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Skill Level</label>
                <select 
                  value={formData.skill_level}
                  onChange={e => setFormData({...formData, skill_level: e.target.value})}
                  className="w-full h-14 px-5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary transition-all font-medium" 
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Preferred Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full h-14 px-5 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary transition-all font-medium" 
                />
              </div>
              
              <button 
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-container shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          <>
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-8"/>
              <div className="h-14 bg-slate-200 rounded w-1/2 mb-2"/>
              <div className="h-4 bg-slate-100 rounded w-2/3"/>
            </div>
            <div className="bg-primary-container/30 p-8 rounded-3xl animate-pulse">
              <div className="h-4 bg-slate-300 rounded w-1/3 mb-8"/>
              <div className="h-12 bg-slate-300 rounded w-1/2"/>
            </div>
            <div className="bg-secondary-container/30 p-8 rounded-3xl animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-8"/>
              <div className="h-12 bg-slate-200 rounded w-1/2"/>
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-3xl text-secondary">query_stats</span>
                <span className="text-xs font-bold text-outline uppercase tracking-tighter">Academic Velocity</span>
              </div>
              <div className="mt-8">
                <h4 className="text-6xl font-headline font-extrabold text-primary tracking-tighter">{stats.totalHours.toFixed(1)}</h4>
                <p className="text-lg text-on-surface-variant font-medium">Total Study Hours</p>
              </div>
            </div>
            
            <div className="bg-primary-container p-8 rounded-3xl flex flex-col justify-between shadow-xl">
              <span className="material-symbols-outlined text-3xl text-secondary-container">groups</span>
              <div className="mt-8">
                <h4 className="text-5xl font-headline font-bold text-white tracking-tighter">{stats.sessionsJoined}</h4>
                <p className="text-sm text-on-primary-container font-medium">Sessions Joined</p>
              </div>
            </div>
            
            <div className="bg-secondary-container p-8 rounded-3xl flex flex-col justify-between shadow-lg">
              <span className="material-symbols-outlined text-3xl text-primary">workspace_premium</span>
              <div className="mt-8">
                <h4 className="text-5xl font-headline font-bold text-primary tracking-tighter">0</h4>
                <p className="text-sm text-on-secondary-fixed-variant font-medium">Impact Badges</p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
