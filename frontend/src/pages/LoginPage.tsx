import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setAuth(res.data.access_token, res.data.user);
      toast.success('Welcome back!');
      if (res.data.user.role === 'ceo') navigate('/ceo');
      else if (res.data.user.role === 'manager') navigate('/manager');
      else navigate('/intern');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f5f6fa',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Left panel */}
      <div style={{
        width: '420px',
        background: '#0f1623',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 40px',
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#0ea5e9', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '48px',
          }}>
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '13px' }}>IMS</span>
          </div>
          <h2 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: '700', color: '#fff', lineHeight: 1.2 }}>
            Intern Management System
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>
            Track attendance, logs, tasks, expenses and stipends — all in one place.
          </p>
        </div>
        <div>
          {['Interns', 'Managers', 'CEO Analytics'].map((role) => (
            <div key={role} style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9' }} />
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '700', color: '#0f1623' }}>
            Sign in
          </h1>
          <p style={{ margin: '0 0 36px', color: '#64748b', fontSize: '15px' }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '8px', color: '#0f1623', fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif", outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '7px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '11px 14px 11px 40px',
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '8px', color: '#0f1623', fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif", outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', background: '#0f1623',
                border: 'none', borderRadius: '8px', color: '#fff',
                fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? 'Signing in...' : (<>Sign in <ArrowRight size={16} /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;