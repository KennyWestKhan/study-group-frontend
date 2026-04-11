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
              <div key={session.id} className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500">
                <div className="h-32 bg-slate-200 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
                  <span className="absolute bottom-3 left-4 bg-secondary-container text-on-secondary-fixed text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{session.location}</span>
                </div>
                <div className="p-5">
                  <h5 className="text-lg font-bold text-primary mb-1">{session.course}</h5>
                  <p className="text-slate-500 text-xs mb-4">Match Score: <span className="text-secondary font-bold">{session.match_score} pts</span></p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span> {new Date(session.time).toLocaleDateString()}
                    </span>
                    <Link to={`/room/${session.id}`} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
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
