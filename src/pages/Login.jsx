import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextObj';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 min-h-[800px] bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_20px_40px_rgba(0,51,102,0.08)]">
        
        {/* Left Side: Editorial Content */}
        <section className="relative hidden lg:flex flex-col justify-between p-16 bg-ait-gradient text-white overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-container rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-secondary/20 rounded-full blur-[80px] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-2xl font-headline font-extrabold tracking-tight">AIT Study Sanctuary</span>
            </div>
            <h1 className="text-6xl font-headline font-extrabold leading-tight mb-6">
              Welcome to Your <br/>Sanctuary
            </h1>
            <p className="text-xl text-primary-fixed-dim max-w-md font-medium leading-relaxed">
              Empowering AIT Scholars through collaborative intelligence and premium resources.
            </p>
          </div>
          
          <div className="relative z-10 mt-auto">
            <div className="glass-panel p-8 rounded-xl border border-white/10 max-w-md">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="italic text-lg mb-4 text-white/90 font-medium">
                "The most organized study experience I've ever had. My research project transformed in just one semester at AIT."
              </p>
              <div className="flex items-center gap-4">
                <img alt="AIT scholar portrait" className="w-12 h-12 rounded-full border-2 border-secondary object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr9SUnnyFcx_czAZQnvg15zkbYxSYvH8v8T1CBLRToBJ7Gz1Z2SEE9Sc0-_lDP2ky-Nd7kxFehl3wMhdFRJpx6v_2TFjGuf2XohdD-xJe6un1uoiNWN9DkaOPlxGbOZ5RNK7Yin7Hq7_qb3DdIOgG855uDuLjorCWIvAe9Wc_3cBcMiM9TCtRrhLJcTcs4bMr4Tt8WuW7mdebe-hafgRjZ0MJpWVpLOwEFbGqLVL3ySlRaXTioXhx4DjmFrEYECHgETQdF7Tdb4Zc"/>
                <div>
                  <p className="font-headline font-bold text-sm">Ama Boateng</p>
                  <p className="text-xs text-primary-fixed-dim">BSc. Computer Science, AIT</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-0 z-0 opacity-25 mix-blend-overlay pointer-events-none">
            <img alt="AIT scholars collaborating" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcKMJ0HKc4znzSNG5IukJwLG-0_N0TnqmvftwgRXp5PZlTVNINfO7jFo7_PvQvioTw3fzOrRs-xP8Ldg4YL2FIkeo2MKE06DE0rg79tjOrwn7j8UAzvyiVvwesaboMJSZjhwej4cITlU-noG1W1wwWiH6BkMVA_oUcjLvBpASdoRhU8wib9V-cLe7M509NYjMZx4wXVCy5DtIkdjeTnPPeUEMeadaIY66LuQPjFgTQixRfaDhTCNUimfSlR_gDKWVtwb4FU7YTzGM"/>
          </div>
        </section>

        {/* Right Side: Interaction Layer */}
        <section className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 bg-surface-container-lowest">
          <div className="max-w-md w-full mx-auto">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              </div>
              <span className="text-2xl font-headline font-extrabold tracking-tight text-primary">AIT Study Sanctuary</span>
            </div>
            
            <div className="mb-10">
              <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Sign In</h2>
              <p className="text-on-surface-variant">Enter your credentials to access your academic sanctuary.</p>
            </div>
            
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all" 
                  placeholder="student.name@ait.edu.gh" 
                  required
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2 ml-1">
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold">Password</label>
                  <Link to="/auth/forgot-password" className="text-xs font-bold text-primary hover:text-primary-container transition-colors">Forgot Password?</Link>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all" 
                  placeholder="••••••••" 
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low cursor-pointer"/>
                <label htmlFor="remember" className="ml-3 text-sm font-medium text-on-surface-variant cursor-pointer">Remember me for 30 days</label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-white font-headline font-bold rounded-lg shadow-lg hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-variant"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-surface-container-lowest text-outline">New to AIT?</span>
              </div>
            </div>
            
            <Link to="/auth/register" className="w-full flex items-center justify-center gap-3 h-14 rounded-lg border border-surface-variant hover:bg-surface-container-low transition-colors font-bold text-primary">
              Create an Account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
