import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to:'/',          icon:'🏠', label:'Dashboard', end:true },
  { to:'/companies', icon:'🏢', label:'Companies' },
  { to:'/dsa',       icon:'💻', label:'DSA Sheet' },
  { to:'/subjects',  icon:'📚', label:'Core Subjects' },
  { to:'/aptitude',  icon:'🧠', label:'Aptitude' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const doLogout  = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const sItem = (active) => ({
    display:'flex', alignItems:'center', gap:9, padding:'9px 11px', borderRadius:9,
    fontSize:12.5, fontWeight:active?600:500, cursor:'pointer',
    color:active?'#7c3aed':'#4b5563',
    background:active?'#ede9fe':'transparent',
    marginBottom:3, textDecoration:'none', transition:'all .12s',
    borderLeft:`3px solid ${active?'#7c3aed':'transparent'}`,
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      {/* ── Topbar ── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #ede9fe', height:54, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', position:'sticky', top:0, zIndex:200 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:32, height:32, background:'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15 }}>P</div>
          <span style={{ fontWeight:700, fontSize:15, color:'#7c3aed', letterSpacing:'-.3px' }}>PlacePool</span>
        </div>
        {/* Top nav pills */}
        <div style={{ display:'flex', gap:2 }}>
          {NAV.map(n=>(
            <NavLink key={n.to} to={n.to} end={n.end}
              style={({ isActive })=>({ padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:isActive?600:500, cursor:'pointer', border:'none', background:isActive?'#ede9fe':'transparent', color:isActive?'#7c3aed':'#6b7280', textDecoration:'none', transition:'all .12s' })}>
              {n.label}
            </NavLink>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {user?.role==='admin' && (
            <button onClick={()=>navigate('/admin')} style={{ background:'#fdf4ff', color:'#9333ea', border:'1px solid #e9d5ff', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer' }}>
              ⚙ Admin Panel
            </button>
          )}
          <div onClick={doLogout}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 11px', borderRadius:20, border:'1px solid #ede9fe', cursor:'pointer', fontSize:12, color:'#6b7280', transition:'all .12s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#fef2f2'; e.currentTarget.style.color='#ef4444'; e.currentTarget.style.borderColor='#fecaca'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280'; e.currentTarget.style.borderColor='#ede9fe'; }}>
            <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span>{user?.name?.split(' ')[0]}</span>
            <span style={{ fontSize:10, opacity:.5 }}>↩</span>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', flex:1 }}>
        {/* ── Sidebar — NO "NAVIGATION" heading (P3 fix) ── */}
        <div style={{ width:193, background:'#fff', borderRight:'1px solid #ede9fe', padding:'16px 8px', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:54, height:'calc(100vh - 54px)', overflowY:'auto' }}>
          {NAV.map(n=>(
            <NavLink key={n.to} to={n.to} end={n.end} style={({ isActive })=>sItem(isActive)}>
              <span style={{ fontSize:15, width:19, textAlign:'center' }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
          {user?.role==='admin' && (
            <NavLink to="/admin" style={({ isActive })=>({...sItem(isActive), marginTop:12, paddingTop:12, borderTop:'1px solid #f3f4f6'})}>
              <span style={{ fontSize:15, width:19, textAlign:'center' }}>⚙</span>Admin Panel
            </NavLink>
          )}
          {/* User info at bottom */}
          <div style={{ marginTop:'auto', paddingTop:14 }}>
            <div style={{ padding:'11px 12px', borderRadius:10, background:'linear-gradient(135deg,#f5f3ff,#fdf4ff)', border:'1px solid #ede9fe' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#5b21b6', marginBottom:2 }}>{user?.name}</div>
              {user?.rollNo && <div style={{ fontSize:11, color:'#9ca3af' }}>{user.rollNo}</div>}
              <div style={{ fontSize:11, color:'#9ca3af' }}>{user?.email}</div>
              <div style={{ fontSize:10, color:'#a78bfa', marginTop:4, textTransform:'capitalize', fontWeight:500 }}>🎓 {user?.role}</div>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ flex:1, overflowY:'auto', padding:22, scrollBehavior:'smooth' }}>
          <div key={location.pathname} style={{ animation:'fadeIn .22s ease', maxWidth:1200 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
