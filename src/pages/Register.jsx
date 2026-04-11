import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextObj';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    skill_level: 'Beginner',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account.');
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
              Join the <br/>Sanctuary
            </h1>
            <p className="text-xl text-primary-fixed-dim max-w-md font-medium leading-relaxed">
              Elevate your academic journey alongside top scholars across all AIT disciplines.
            </p>
          </div>
        </section>

        {/* Right Side: Registration Form */}
        <section className="flex flex-col justify-center px-8 md:px-12 lg:px-20 py-16 bg-surface-container-lowest overflow-y-auto max-h-[90vh]">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Create Account</h2>
              <p className="text-on-surface-variant">Sign up to get access to AIT collaborative resources.</p>
            </div>
            
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium border border-red-100">{error}</div>}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all" 
                  placeholder="Kwame Mensah" 
                  required
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Email Address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all" 
                  placeholder="student@ait.edu.gh" 
                  required
                />
              </div>
              
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Password *</label>
                <div className="relative group/pass">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-12 px-5 pr-12 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all" 
                    placeholder="••••••••" 
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Course</label>
                  <input 
                    type="text" 
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    list="course-list"
                    className="w-full h-12 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm" 
                    placeholder="e.g. Comp Sci" 
                  />
                  <datalist id="course-list">
                    <option value="BSc. Computer Science" />
                    <option value="BSc. Computer Engineering" />
                    <option value="BSc. Electrical/Electronic Engineering" />
                    <option value="BSc. Telecommunications Engineering" />
                    <option value="BSc. Mechanical Engineering" />
                    <option value="BSc. Civil Engineering" />
                    <option value="BSc. Business Information Technology" />
                    <option value="BSc. Management Information Systems" />
                    <option value="MBA Information Technology" />
                    <option value="MSc. Computer Science" />
                    <option value="MSc. Embedded Systems" />
                    <option value="MSc. Data Science & AI" />
                  </datalist>
                </div>
                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Skill Level</label>
                  <select 
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm text-on-surface cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-2 ml-1">Preferred Campus / Location</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  list="location-list"
                  className="w-full h-12 px-5 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm placeholder:text-outline" 
                  placeholder="Main Campus Library" 
                />
                <datalist id="location-list">
                  <option value="Main Campus Library" />
                  <option value="ICT Lab 1" />
                  <option value="ICT Lab 2" />
                  <option value="Engineering Block" />
                  <option value="PG Study Room" />
                  <option value="Student Lounge" />
                  <option value="Cafeteria Study Area" />
                  <option value="Online (Virtual)" />
                </datalist>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 mt-4 bg-primary text-white font-headline font-bold rounded-lg shadow-lg hover:bg-primary-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-sm text-on-surface-variant font-medium">Already have an account? </span>
              <Link to="/login" className="text-sm font-bold text-primary hover:underline underline-offset-4">Log in here</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
