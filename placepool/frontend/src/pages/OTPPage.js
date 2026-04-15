import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { AuthWrap, AuthBtn } from './LoginPage';

export default function OTPPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp]       = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = Array.from({length:6}, () => useRef());

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) refs[i+1].current.focus();
  };
  const handleKey = (i, e) => {
    if (e.key==='Backspace' && !otp[i] && i>0) refs[i-1].current.focus();
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits'); return; }
    setLoading(true);
    try {
      const r = await api.post('/auth/verify-otp', { email: state?.email, otp: code });
      login(r.data.token, r.data.user);
      toast.success('Verified! Welcome to PlacePool 🎉');
      navigate('/');
    } catch(err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['','','','','','']);
      refs[0].current.focus();
    } finally { setLoading(false); }
  };

  const resend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email: state?.email });
      toast.success('OTP resent!');
    } catch { toast.error('Failed to resend'); }
    finally { setResending(false); }
  };

  return <AuthWrap title="Check your email" sub={`OTP sent to ${state?.email || 'your email'}`}>
    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:12, textAlign:'center', fontSize:13, color:'#065f46', marginBottom:18 }}>
      📧 Enter the 6-digit OTP from your inbox. Valid for 10 minutes.
    </div>
    <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:20 }}>
      {otp.map((d,i) => (
        <input key={i} ref={refs[i]} value={d} maxLength={1}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          style={{ width:46, height:52, borderRadius:10, border:'1.5px solid #e5e7eb', textAlign:'center', fontSize:22, fontWeight:700, color:'#7c3aed', outline:'none' }} />
      ))}
    </div>
    <AuthBtn loading={loading} type="button" onClick={verify}>Verify OTP →</AuthBtn>
    <p style={{ textAlign:'center', marginTop:12, fontSize:13, color:'#7c3aed', cursor:'pointer', fontWeight:500 }}
      onClick={!resending ? resend : undefined}>{resending ? 'Resending…' : "Didn't receive? Resend OTP"}</p>
    <p style={{ textAlign:'center', marginTop:8, fontSize:12, color:'#9ca3af', cursor:'pointer' }}
      onClick={() => navigate(-1)}>← Go back</p>
  </AuthWrap>;
}
