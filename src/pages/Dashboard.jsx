import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContextObj';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [recentSessions, setRecentSessions] = useState([]);
  const [stats, setStats] = useState({ totalHours: 0, weeklyHours: [0,0,0,0,0,0,0], dayLabels: ['M','T','W','T','F','S','S'] });
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLog, setNewLog] = useState({ topic: '', hours_studied: 1 });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [savingSession, setSavingSession] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/matches');
      setRecentSessions(res.data.slice(0, 4));
      
      const logsRes = await api.get('/logs/dashboard');
      setStats({ 
        totalHours: logsRes.data.totalHours || 0,
        weeklyHours: logsRes.data.weeklyHours || [0,0,0,0,0,0,0],
        dayLabels: logsRes.data.dayLabels || ['M','T','W','T','F','S','S']
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/logs', newLog);
      setShowLogModal(false);
      setNewLog({ topic: '', hours_studied: 1 });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to log hours:', err);
    }
  };

  const handleJoin = async (e, sessionId) => {
    e.preventDefault();
    try {
      await api.post(`/sessions/${sessionId}/join`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to join:', err);
    }
  };

  const handleLeave = async (e, sessionId) => {
    e.preventDefault();
    try {
      await api.post(`/sessions/${sessionId}/leave`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  };

  const handleUpdateSession = async (e, manualStatus = null) => {
    if (e.preventDefault) e.preventDefault();
    setSavingSession(true);
    try {
      const payload = manualStatus ? { ...editingSession, status: manualStatus } : editingSession;
      await api.put(`/sessions/${editingSession.id}`, payload);
      setShowEditModal(false);
      setEditingSession(null);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update session:', err);
    } finally {
      setSavingSession(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const studyGoal = 50;
  const progressPercentage = Math.min((stats.totalHours / studyGoal) * 100, 100);
  const strokeDashoffset = 552.92 - (552.92 * progressPercentage) / 100;

  const getCourseGradient = (courseName) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-400 to-cyan-500',
      'from-amber-400 to-orange-500',
      'from-purple-500 to-pink-500',
      'from-rose-400 to-red-500',
      'from-slate-700 to-slate-900'
    ];
    const charCodeSum = (courseName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[charCodeSum % gradients.length];
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-primary-container p-12 text-white">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-4 tracking-tight">
              {getTimeGreeting()}, {user?.name || 'Scholar'}!<br/>Ready for your next AIT study session?
            </h1>
            <p className="text-on-primary-container text-lg mb-8 opacity-90">
              {recentSessions.length > 0 
                ? `You have ${recentSessions.length} recommended study sessions waiting for you.`
                : "Your academic squad is ready. Start or join a session to master your curriculum."}
            </p>
            <div className="flex gap-4">
              <Link to="/sessions" className="bg-secondary-container text-on-secondary-fixed font-bold px-8 py-4 rounded-xl hover:scale-105 transition-transform inline-block text-center shadow-lg shadow-black/10">
                View Schedule
              </Link>
              <button 
                onClick={() => setShowLogModal(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20 shadow-lg"
              >
                Log Study Hours
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Study Progress Orbit */}
        <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-primary tracking-tight">Academic Progress</h3>
              <p className="text-slate-500 text-sm">You've logged {stats.totalHours.toFixed(1)} hours of study so far</p>
            </div>
            <div className="flex items-center gap-2 text-secondary font-bold bg-secondary-container/20 px-4 py-2 rounded-full text-sm">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Scholar Tier: {stats.totalHours >= 50 ? 'Platinum' : stats.totalHours >= 20 ? 'Gold' : stats.totalHours >= 5 ? 'Silver' : 'Bronze'}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                <circle className="text-secondary" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={strokeDashoffset} strokeWidth="12" style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-primary">{stats.totalHours.toFixed(1)}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ {studyGoal}h Goal</span>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-7 gap-3 items-end h-40">
              {stats.weeklyHours.map((h, i) => (
                <div key={i} className="group relative w-full flex flex-col items-center">
                  <div 
                    className={`rounded-t-lg w-full transition-all duration-1000 ${h > 0 ? 'bg-secondary' : 'bg-surface-container-high'}`}
                    style={{ height: `${Math.max((h / 10) * 100, 5)}%` }} // Capped at 10h per day for visualization
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {h.toFixed(1)}h
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold mt-2">{stats.dayLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bg-primary-container text-white rounded-[2rem] p-8 flex-1 flex flex-col justify-between shadow-xl shadow-primary/10">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <span className="material-symbols-outlined text-secondary-container text-3xl">bolt</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Focus Drive</h4>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Keep logging hours to maximize your academic potential and reach the next Scholar Tier!
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-3xl font-extrabold">{stats.totalHours.toFixed(1)} <span className="text-sm font-medium opacity-60 ml-1">hrs</span></span>
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white">trending_up</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Hours Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">history_edu</span>
                Record Study Session
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleLogSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Topic / Subject</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Data Structures, Calculus..."
                  value={newLog.topic}
                  onChange={e => setNewLog({...newLog, topic: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Duration (Hours)</label>
                <div className="relative">
                  <input 
                    required
                    type="number" 
                    step="0.5"
                    min="0.5"
                    value={newLog.hours_studied}
                    onChange={e => setNewLog({...newLog, hours_studied: parseFloat(e.target.value)})}
                    className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-secondary transition-all font-medium"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">hrs</span>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Log Entry
              </button>
            </form>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Skill Level</label>
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
              <div>
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
                      await handleUpdateSession({ preventDefault: () => {}, target: { status: 'Closed' } }, 'Closed');
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
      
      {/* Discover Sessions (Preview) */}
      <div className="mt-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-extrabold text-primary tracking-tight">Discover AIT Sessions</h3>
            <p className="text-slate-500">Curated study rooms based on your curriculum</p>
          </div>
          <Link to="/sessions" className="text-primary font-bold hover:underline decoration-secondary decoration-2 underline-offset-4 transition-all">See All</Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden animate-pulse">
                <div className="h-32 bg-slate-200"/>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"/>
                  <div className="h-3 bg-slate-100 rounded w-1/2"/>
                  <div className="h-3 bg-slate-100 rounded w-1/3"/>
                </div>
              </div>
            ))
          ) : recentSessions.length > 0 ? (
            recentSessions.map((session) => (
              <div key={session.id} className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 border border-slate-100">
                <div className={`h-32 bg-gradient-to-br ${getCourseGradient(session.course)} relative`}>
                  <div className="absolute top-3 inset-x-4 flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-white/30">{session.status || 'Active'}</span>
                      {session.creator_id === user?.id && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
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
                        <span className="text-[10px] font-bold text-primary">{session.active_count || 0}</span>
                      </div>
                      <div className="w-[1px] h-3 bg-slate-200 mx-1"></div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[12px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                        <span className="text-[10px] font-bold text-slate-600">{session.members?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border border-white/30">{session.location}</span>
                </div>
                <div className="p-5">
                  <h5 className="text-lg font-bold text-primary mb-1 line-clamp-1">{session.course}</h5>
                  <p className="text-slate-500 text-[11px] mb-3 line-clamp-2">{session.description || 'Connect and collaborate with peers in this live study session.'}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Match: <span className="text-secondary">{session.match_score} pts</span></p>
                    <span className="text-slate-300">•</span>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Host: <span className="text-primary">{session.creator_id === user?.id ? 'Me' : (session.creator?.name || 'AIT Scholar')}</span></p>
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      {session.creator_id !== user?.id && (
                        session.members?.some(m => m.id === user?.id) ? (
                          <button 
                            onClick={(e) => handleLeave(e, session.id)}
                            className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-all border border-slate-200"
                          >
                            Unregister
                          </button>
                        ) : (
                          <button 
                            onClick={(e) => handleJoin(e, session.id)}
                            disabled={session.status === 'Full'}
                            className="flex-1 py-2 rounded-xl bg-secondary text-primary text-[10px] font-bold shadow-lg shadow-secondary/10 hover:scale-105 transition-all disabled:opacity-50"
                          >
                            {session.status === 'Full' ? 'Full' : 'Join'}
                          </button>
                        )
                      )}
                      <Link 
                        to={`/room/${session.id}`}
                        className="flex-1 py-2 rounded-xl bg-primary text-white text-center text-[10px] font-bold hover:bg-primary-container transition-all"
                      >
                        Enter Room
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 col-span-full">No active sessions recommended for you right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
