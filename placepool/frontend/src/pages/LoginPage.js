import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]       = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const set = k => e => setForm({...form,[k]:e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch(err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthWrap>
      <TabRow active="login" />
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Field label="University Email" type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} />
        <Field label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={set('password')} />
        <AuthBtn loading={loading}>Sign In →</AuthBtn>
        <div style={{ textAlign:'center' }}>
          <Link to="/forgot-password" style={{ fontSize:12, color:'#7c3aed', fontWeight:500 }}>Forgot password?</Link>
        </div>
      </form>
    </AuthWrap>
  );
}

/* ── Shared auth components ─────────────────────────── */
export function AuthWrap({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f5f3ff,#fdf4ff,#f0f9ff)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:20, border:'1px solid #ede9fe', padding:'36px 32px', width:'100%', maxWidth:430, boxShadow:'0 4px 32px rgba(124,58,237,.08)' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:54, height:54, background:'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, fontWeight:700, margin:'0 auto 12px' }}>P</div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#7c3aed', marginBottom:3 }}>PlacePool</h1>
          <p style={{ fontSize:12, color:'#9ca3af' }}>University Placement Prep Portal</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TabRow({ active }) {
  return (
    <div style={{ display:'flex', background:'#f3f4f6', borderRadius:10, padding:3, marginBottom:22 }}>
      {[['login','Sign In','/login'],['signup','Sign Up','/signup']].map(([key,label,to])=>(
        <Link key={key} to={to} style={{ flex:1, padding:'8px 0', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none', transition:'all .15s',
          background:active===key?'#fff':'transparent', color:active===key?'#7c3aed':'#6b7280', boxShadow:active===key?'0 1px 3px rgba(0,0,0,.1)':'none' }}>
          {label}
        </Link>
      ))}
    </div>
  );
}

export function Field({ label, type='text', placeholder, value, onChange, required=true }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        style={{ width:'100%', padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:9, fontSize:13, color:'#1a1a2e', background:'#fff', outline:'none', transition:'border .15s' }} />
    </div>
  );
}

export function AuthBtn({ children, loading, type='submit', onClick }) {
  return (
    <button type={type} onClick={onClick} disabled={loading}
      style={{ padding:12, background:loading?'#a78bfa':'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:loading?'not-allowed':'pointer', width:'100%', transition:'.15s' }}>
      {loading ? '⏳  Please wait…' : children}
    </button>
  );
}