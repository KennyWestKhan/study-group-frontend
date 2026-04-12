import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContextObj';

export default function SessionExplorer() {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({ course: '', description: '', time: '', location: '', max_members: '', skill_level: 'Beginner' });
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [savingSession, setSavingSession] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateSession = async (e, manualStatus = null) => {
    if (e.preventDefault) e.preventDefault();
    setSavingSession(true);
    try {
      const payload = manualStatus ? { ...editingSession, status: manualStatus } : editingSession;
      await api.put(`/sessions/${editingSession.id}`, payload);
      setShowEditModal(false);
      setEditingSession(null);
      fetchSessions();
    } catch (err) {
      console.error('Failed to update session:', err);
      alert('Failed to update session.');
    } finally {
      setSavingSession(false);
    }
  };

  const handleJoin = async (e, sessionId) => {
    e.preventDefault();
    setJoiningId(sessionId);
    try {
      await api.post(`/sessions/${sessionId}/join`);
      fetchSessions();
      alert('Successfully joined the session!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join session');
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (e, sessionId) => {
    e.preventDefault();
    setJoiningId(sessionId);
    try {
      await api.post(`/sessions/${sessionId}/leave`);
      fetchSessions();
      alert('You have unregistered from this session.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave session');
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/sessions', newSession);
      setSessions((prev) => [...prev, res.data]);
      setShowForm(false);
      setNewSession({ course: '', time: '', location: '', max_members: 5 });
      alert('Session created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const [activeFilter, setActiveFilter] = useState('All Disciplines');

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.course?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All Disciplines' || 
                         s.course?.toLowerCase().includes(activeFilter.toLowerCase()) ||
                         (activeFilter === 'Engineering' && (s.course?.toLowerCase().includes('eng') || s.course?.toLowerCase().includes('circuit')));
    return matchesSearch && matchesFilter;
  });

  const getCourseGradient = (courseName) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-400 to-cyan-500',
      'from-amber-400 to-orange-500',
      'from-purple-500 to-pink-500',
      'from-rose-400 to-red-500',
      'from-slate-700 to-slate-900'
    ];
    // Simple hash to pick a gradient
    const charCodeSum = (courseName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  return (
    <div className="flex-1 bg-surface min-h-screen">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-primary-container p-12 mb-12 shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container to-transparent z-0 opacity-40">
          <img alt="Academic environment" className="w-full h-full object-cover mix-blend-overlay" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXYpusAH7vsKt4tNb6HAGbrjv5p4mDd_fHUfTzcPWijUoWh_lAEVkNj_b-Ac2ysmT7Wh6onW3tmJAAzzBROrSyQoTFe7cNvDFI8zAml9gNE915--iXS7l6QqS_uAzjtnwO-jgSYY-EO79dk7EyOSOcmI8Ox4dLroE7SkLmmY2U2nbOv-RoBojRRdBwe3LVyh4TN7mInKdvMa1Jo9Nupe7wxstamULoTIW3UDv_uQUzXkJHUD5gq-zToeERkqCn9UsB7g47sJgLkqM"/>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-4 py-1.5 bg-secondary-container text-primary font-bold rounded-full text-xs mb-6 uppercase tracking-widest">
            AIT Academic Excellence
          </span>
          <h1 className="text-5xl font-extrabold text-white font-headline leading-tight tracking-tighter mb-4">
            Study Session Explorer
          </h1>
          <p className="text-blue-100 text-lg mb-8 font-light">
            Join your fellow AIT Scholars in collaborative learning environments. From Circuit Theory to Advanced Software Engineering.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setShowForm(true);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 bg-secondary-container hover:bg-[#fecb00] text-primary font-bold px-8 py-4 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Create New AIT Session
            </button>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-semibold px-8 py-4 rounded-xl transition-all border border-white/20">
              View My Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="relative w-full md:w-1/2 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-secondary transition-colors">search</span>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-secondary/30 shadow-sm text-slate-700 font-medium" 
            placeholder="Search by topic, course code or professor..."
          />
        </div>
        
        <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All Disciplines', 'Engineering', 'Computer Science', 'Business'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === filter 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loadingSessions ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[2rem] p-8 border border-outline-variant/20 bg-white animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"/>
              <div className="h-6 bg-slate-200 rounded w-2/3 mb-3"/>
              <div className="h-3 bg-slate-100 rounded w-full mb-2"/>
              <div className="h-3 bg-slate-100 rounded w-5/6 mb-8"/>
              <div className="h-10 bg-slate-200 rounded-xl"/>
            </div>
          ))
        ) : filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <div key={session.id} className="glass-card flex flex-col rounded-[2rem] p-0 border border-white/40 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden relative group bg-white">
              <div className={`h-32 bg-gradient-to-br ${getCourseGradient(session.course)} relative p-6`}>
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start w-full relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase border border-white/30">
                      {session.status || 'Active'}
                    </span>
                    {session.creator_id === user?.id && (
                      <button 
                        onClick={() => {
                          setEditingSession(session);
                          setShowEditModal(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-all border border-white/30"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-primary">{session.active_count || 0} Online</span>
                    </div>
                    <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                      <span className="text-[10px] font-bold text-slate-600">{session.members?.length || 0} Registered</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 pt-6">
                <h4 className="text-xl font-bold text-primary mb-2">{session.course}</h4>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{session.description || 'Connect and collaborate with peers in this live study session.'}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-secondary">calendar_today</span>
                    <span className="text-sm font-medium">
                      {new Date(session.time).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    <span className="text-sm font-medium">{session.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-secondary">person</span>
                    <span className="text-sm font-bold text-primary">Host: {session.creator_id === user?.id ? 'Me' : (session.creator?.name || 'AIT Scholar')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <span className="material-symbols-outlined text-secondary">trending_up</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">{session.skill_level || 'Beginner'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {session.creator_id !== user?.id && (
                    session.members?.some(m => m.id === user?.id) ? (
                      <button
                        onClick={(e) => handleLeave(e, session.id)}
                        disabled={joiningId === session.id}
                        className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200 flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {joiningId === session.id ? 'Processing...' : 'Unregister Session'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleJoin(e, session.id)}
                        disabled={joiningId === session.id || session.status === 'Full'}
                        className="w-full py-3 bg-secondary text-primary font-bold rounded-xl hover:bg-[#fecb00] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {joiningId === session.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Joining...
                          </>
                        ) : session.status === 'Full' ? 'Session Full' : 'Join Session'}
                      </button>
                    )
                  )}
                  <Link to={`/room/${session.id}`} className="w-full py-4 bg-primary-container text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-md active:scale-[0.98] text-center block">
                    Enter Room
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            No sessions available yet. Create one!
          </div>
        )}
        
        {/* Create Custom Card or Form */}
        {!showForm ? (
          <div onClick={() => setShowForm(true)} className="flex flex-col items-center justify-center rounded-[2rem] p-8 border-2 border-dashed border-outline-variant bg-transparent hover:bg-slate-50 transition-colors group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl">add</span>
            </div>
            <h3 className="text-xl font-bold text-primary font-headline mb-2">Host a Session</h3>
            <p className="text-slate-500 text-sm text-center mb-6">Can't find your topic? Start your own group and invite peers.</p>
            <button className="text-secondary font-bold text-sm underline-offset-4 hover:underline">Create Now</button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="glass-card flex flex-col rounded-[2rem] p-8 border border-white/40 shadow-xl shadow-slate-200/50 bg-white">
            <h3 className="text-xl font-bold text-primary font-headline mb-4">Create Session</h3>
            
            <input 
              required 
              type="text" 
              placeholder="Course Topic" 
              value={newSession.course} 
              onChange={e => setNewSession({...newSession, course: e.target.value})} 
              className="mb-3 w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary/30"
            />
            <textarea 
              placeholder="Session Description (What will you cover?)" 
              value={newSession.description} 
              onChange={e => setNewSession({...newSession, description: e.target.value})} 
              className="mb-3 w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary/30 min-h-[100px] resize-none text-sm"
            />
            <input 
              required 
              type="datetime-local" 
              value={newSession.time} 
              onChange={e => setNewSession({...newSession, time: e.target.value})} 
              className="mb-3 w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary/30 text-slate-500"
            />
            <input 
              required 
              type="text" 
              placeholder="Location" 
              value={newSession.location} 
              onChange={e => setNewSession({...newSession, location: e.target.value})} 
              className="mb-3 w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary/30"
            />
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Excellence Level</label>
              <select 
                value={newSession.skill_level}
                onChange={e => setNewSession({...newSession, skill_level: e.target.value})}
                className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary/30 text-sm font-medium cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <input 
              type="number" 
              min="2" 
              max="5"
              placeholder="Max Members (Max: 5)" 
              value={newSession.max_members} 
              onChange={e => setNewSession({...newSession, max_members: e.target.value})} 
              className="mb-8 w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-secondary/30"
            />
            
            <div className="flex gap-3 mt-auto">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating...
                  </>
                ) : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-extrabold text-primary tracking-tight">Edit Session</h3>
                <p className="text-slate-500 font-medium">Update your study group details</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUpdateSession} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Course / Topic</label>
                <input 
                  required
                  type="text" 
                  value={editingSession.course}
                  onChange={e => setEditingSession({...editingSession, course: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  value={editingSession.description}
                  onChange={e => setEditingSession({...editingSession, description: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium min-h-[120px] resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                <input 
                  required
                  type="text" 
                  value={editingSession.location}
                  onChange={e => setEditingSession({...editingSession, location: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Excellence Level</label>
                <select 
                  value={editingSession.skill_level}
                  onChange={e => setEditingSession({...editingSession, skill_level: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Max Scholars (Max: 5)</label>
                <input 
                  type="number"
                  min="2"
                  max="5"
                  value={editingSession.max_members}
                  onChange={e => setEditingSession({...editingSession, max_members: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to close this session? It will no longer be joinable.')) {
                      await handleUpdateSession({ preventDefault: () => {} }, 'Closed');
                    }
                  }}
                  className="flex-1 h-14 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Close Session
                </button>
                <button 
                  type="submit"
                  disabled={savingSession}
                  className="flex-[2] h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {savingSession ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
