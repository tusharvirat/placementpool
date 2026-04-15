import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AuthWrap, Field, AuthBtn } from './LoginPage';

export default function ForgotPasswordPage() {
  const [step, setStep]     = useState(1); // 1=enter email, 2=enter otp+newpass
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState('');
  const [newPass, setNewPass] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const reset = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword:newPass });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthWrap>
      <div style={{ textAlign:'center', marginBottom:20 }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#374151' }}>🔐 Reset Password</div>
        <div style={{ fontSize:12, color:'#9ca3af', marginTop:3 }}>
          {step===1 ? 'Enter your registered email to receive an OTP' : `OTP sent to ${email}`}
        </div>
      </div>

      {step===1 ? (
        <form onSubmit={sendOTP} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Field label="Registered Email" type="email" placeholder="you@university.edu" value={email} onChange={e=>setEmail(e.target.value)} />
          <AuthBtn loading={loading}>Send Reset OTP →</AuthBtn>
          <Link to="/login" style={{ textAlign:'center', fontSize:12, color:'#7c3aed', fontWeight:500 }}>← Back to login</Link>
        </form>
      ) : (
        <form onSubmit={reset} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9, padding:'10px 13px', fontSize:12, color:'#065f46', textAlign:'center' }}>
            📧 Check {email} for the 6-digit OTP
          </div>
          <Field label="OTP" placeholder="6-digit code" value={otp} onChange={e=>setOtp(e.target.value)} />
          <Field label="New Password" type="password" placeholder="Minimum 6 characters" value={newPass} onChange={e=>setNewPass(e.target.value)} />
          <AuthBtn loading={loading}>Reset Password →</AuthBtn>
          <button type="button" onClick={()=>setStep(1)} style={{ fontSize:12, color:'#7c3aed', background:'none', border:'none', cursor:'pointer', fontWeight:500, textAlign:'center' }}>← Change email</button>
        </form>
      )}
    </AuthWrap>
  );
}
