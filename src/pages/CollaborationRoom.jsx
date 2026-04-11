import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextObj';
import io from 'socket.io-client';
import api from '../api/axios';

export default function CollaborationRoom() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [session, setSession] = useState(null);
  const [activeScholars, setActiveScholars] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [socket, setSocket] = useState(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!user) return; // Wait for user to be available

    // 0. Fetch Session Details
    const fetchSessionStatus = async () => {
      try {
        const res = await api.get(`/sessions/${id}`);
        setSession(res.data);
      } catch (err) {
        console.error('Failed to load session details:', err);
      }
    };
    fetchSessionStatus();

    // 1. Fetch Chat History
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/sessions/${id}/messages`);
        const history = res.data.map(m => ({
          session_id: m.session_id,
          user_id: m.user_id,
          userName: m.User?.name || 'Scholar',
          content: m.content,
          createdAt: m.createdAt
        }));
        setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();

    // 2. Connect to Socket.IO backend
    const s = io(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001');
    setSocket(s);

    s.on('connect', () => {
      console.log('Socket connected, joining room:', id);
      s.emit('join_room', { sessionId: id, user: { id: user.id, name: user.name } });
    });

    s.on('receive_message', (data) => {
      console.log('Received message:', data);
      setMessages((prev) => [...prev, data]);
    });

    s.on('update_user_list', (users) => {
      console.log('Updated user list:', users);
      setActiveScholars(users);
    });

    return () => {
      s.disconnect();
    };
  }, [id, user]); // Added user to dependencies

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (inputMsg.trim() && socket) {
      const messageData = {
        session_id: id,
        user_id: user?.id,
        userName: user?.name || 'Scholar',
        content: inputMsg,
      };
      socket.emit('send_message', messageData);
      setInputMsg('');
    }
  };

  const handleLeaveSession = async () => {
    try {
      await api.post(`/sessions/${id}/leave`);
      navigate('/sessions');
    } catch (err) {
      console.error('Error leaving session:', err);
      // Still navigate away even if API fails as fallback
      navigate('/sessions');
    }
  };

  return (
    <div className="flex-grow flex flex-col h-screen bg-surface relative">
      {/* TopAppBar */}
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-30 w-full px-8 py-4 flex justify-between items-center shadow-sm shadow-blue-900/5">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-extrabold text-primary tracking-tighter">AIT Study Sanctuary</Link>
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            <span className="text-primary border-b-2 border-secondary-container pb-1 font-semibold text-sm">Session Room</span>
            <span className="text-slate-500 hover:text-primary transition-colors text-sm font-semibold cursor-pointer">Shared Files</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleLeaveSession} className="flex items-center gap-2 bg-error-container/20 text-error px-4 py-2 rounded-xl text-sm font-bold hover:bg-error-container/40 transition-all">
            <span className="material-symbols-outlined text-sm">exit_to_app</span>
            Leave Session
          </button>
        </div>
      </header>

      {/* Dynamic Collaboration Workspace */}
      <div className="flex-grow overflow-hidden flex flex-col lg:flex-row p-6 gap-6">
        
        {/* Left Column: Live Collaboration & Chat */}
        <div className="flex-[3] flex flex-col gap-6">
          <section className="bg-primary p-8 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-secondary-container text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Live Now</span>
                <span className="text-white/60 text-xs font-label">Session ID: {id}</span>
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                {session?.course ? 'Live Study Room :  ' + session.course : 'Loading Session...'}
              </h2>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-200 font-label uppercase">Scholars</p>
                    <p className="text-white font-bold">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Interface */}
          <section className="flex-grow flex flex-col bg-surface-container-lowest rounded-[2rem] shadow-sm overflow-hidden border border-outline-variant/10">
            <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/50">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">forum</span>
                Study Discourse
              </h3>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {messages.map((msg, i) => {
                const isMe = msg.userName === user?.name || msg.user_id === user?.id;
                return (
                  <div key={i} className={`flex gap-4 items-start max-w-[85%] ${isMe ? 'justify-end ml-auto' : ''}`}>
                    {!isMe && (
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex justify-center items-center font-bold mt-1">
                        {msg.userName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className={isMe ? 'text-right' : ''}>
                      <p className={`text-xs font-bold text-primary mb-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                        {isMe ? 'You' : msg.userName}
                      </p>
                      <div className={`${isMe ? 'bg-primary text-white rounded-tr-none shadow-primary/10' : 'bg-surface-container rounded-tl-none'} rounded-2xl p-4 text-sm leading-relaxed shadow-lg`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef}></div>
            </div>
            
            <div className="p-4 bg-surface-container-low">
              <div className="relative">
                <input 
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-6 pr-16 focus:ring-2 focus:ring-secondary transition-all text-sm font-medium" 
                  placeholder="Type your contribution..."
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-2 top-2 bg-primary-container text-white p-2 px-4 rounded-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Scholars & Resources */}
        <div className="flex-[1.2] flex flex-col gap-6 h-full min-w-[320px] hidden md:flex">
          <section className="bg-surface-container-low rounded-[2rem] p-6 flex flex-col flex-grow max-h-[50%]">
            <h3 className="font-bold text-primary flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              Active Scholars
            </h3>
            <div className="overflow-y-auto space-y-4 pr-2">
              {activeScholars.map((scholar, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-white rounded-2xl transition-all">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold relative">
                    {scholar.name?.charAt(0).toUpperCase() || 'S'}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">{scholar.id === user?.id ? 'You' : scholar.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Online</p>
                  </div>
                </div>
              ))}
              {activeScholars.length === 0 && (
                <div className="flex items-center gap-3 p-2 opacity-50">
                  <p className="text-sm font-medium text-slate-400 italic">No other scholars available...</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
