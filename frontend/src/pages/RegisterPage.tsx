import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      api.get(`/auth/invites/validate/${code}`)
        .then(res => setRole(res.data.role))
        .catch(() => toast.error('Invalid invite code'));
    }
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password, name, invite_code: code });
      setAuth(res.data.access_token, res.data.user);
      toast.success('Account created!');
      if (res.data.user.role === 'ceo') navigate('/ceo');
      else if (res.data.user.role === 'manager') navigate('/manager');
      else navigate('/intern');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roleAccent = role === 'intern' ? '#0ea5e9' : role === 'manager' ? '#6366f1' : '#f59e0b';
  const roleBg = role === 'intern' ? '#e0f2fe' : role === 'manager' ? '#ede9fe' : '#fef3c7';

  const fieldStyle = {
    width: '100%', padding: '11px 14px 11px 40px',
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '8px', color: '#0f1623', fontSize: '14px',
    fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const,
  };
  const labelStyle = { display: 'block' as const, marginBottom: '7px', fontSize: '13px', fontWeight: '600' as const, color: '#374151' };
  const iconStyle = (color = '#94a3b8'): React.CSSProperties => ({ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '460px', background: '#fff', borderRadius: '14px', border: '1px solid #e8eaf0', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#0f1623', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#fff', fontWeight: '800', fontSize: '13px' }}>IMS</span>
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '700', color: '#0f1623' }}>Create your account</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Join the Intern Management System</p>
        </div>

        {role && (
          <div style={{ marginBottom: '24px', padding: '12px 16px', background: roleBg, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} color={roleAccent} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>You're registering as</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: roleAccent, textTransform: 'capitalize' }}>{role}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Full Name', value: name, onChange: setName, type: 'text', placeholder: 'John Doe', Icon: User },
            { label: 'Email Address', value: email, onChange: setEmail, type: 'email', placeholder: 'you@company.com', Icon: Mail },
            { label: 'Password', value: password, onChange: setPassword, type: 'password', placeholder: '••••••••', Icon: Lock },
          ].map(({ label, value, onChange, type, placeholder, Icon }) => (
            <div key={label} style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={16} style={iconStyle()} />
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required placeholder={placeholder} style={fieldStyle} />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || !role}
            style={{
              width: '100%', padding: '13px', background: roleAccent || '#0f1623',
              border: 'none', borderRadius: '8px', color: '#fff',
              fontSize: '15px', fontWeight: '600', cursor: loading || !role ? 'not-allowed' : 'pointer',
              opacity: loading || !role ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {loading ? 'Creating account...' : (<>Create Account <ArrowRight size={16} /></>)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;