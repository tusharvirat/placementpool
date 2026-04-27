import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { AuthWrap, TabRow, Field, AuthBtn } from './LoginPage';

export default function SignupPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', rollNo:'' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const set = k => e => setForm({...form,[k]:e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast.success('Account created! Check your email for OTP.');
      navigate('/verify-otp', { state:{ email:form.email, mode:'signup' } });
    } catch(err) { toast.error(err.response?.data?.message || 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthWrap>
      <TabRow active="signup" />
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <Field label="Full Name" placeholder="Aryan Singh" value={form.name} onChange={set('name')} />
          <Field label="Roll Number" placeholder="21CS045" value={form.rollNo} onChange={set('rollNo')} required={false} />
        </div>
        <Field label="University Email" type="email" placeholder="roll@university.edu" value={form.email} onChange={set('email')} />
        <Field label="Password (min 6 chars)" type="password" placeholder="Create a strong password" value={form.password} onChange={set('password')} />
        <AuthBtn loading={loading}>Create Account →</AuthBtn>
      </form>
    </AuthWrap>
  );
}
