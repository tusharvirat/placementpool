import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [progress,  setProgress]  = useState(null);
  const [problems,  setProblems]  = useState([]);
  const [companies, setCompanies] = useState([]);
  const [subjects,  setSubjects]  = useState([]);

  const load = useCallback(() => {
    let cancelled = false;
    Promise.all([
      api.get('/progress/clean'),
      api.get('/dsa/problems'),
      api.get('/companies'),
      api.get('/subjects'),
    ]).then(([pr, p, co, s]) => {
      if (cancelled) return;
      setProgress(pr.data.data);
      setProblems(p.data.data);
      setCompanies(co.data.data);
      setSubjects(s.data.data);
    }).catch(e => {
      if (cancelled || e.code === 'ERR_CANCELED') return;
      // Fallback: load individually
      api.get('/progress').then(r=>setProgress(r.data.data)).catch(()=>{});
      api.get('/dsa/problems').then(r=>setProblems(r.data.data)).catch(()=>{});
      api.get('/companies').then(r=>setCompanies(r.data.data)).catch(()=>{});
      api.get('/subjects').then(r=>setSubjects(r.data.data)).catch(()=>{});
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { const cleanup = load(); return cleanup; }, [load]);

  // Only count solved problems that still exist and are active
  const activeIds  = new Set(problems.map(p => p._id?.toString()));
  const solvedIds  = (progress?.solvedProblems||[]).filter(id => activeIds.has(id?.toString()));
  const solved     = solvedIds.length;
  const total      = problems.length;

  const solvedE = problems.filter(p => p.difficulty==='easy'   && solvedIds.some(id=>id?.toString()===p._id?.toString())).length;
  const solvedM = problems.filter(p => p.difficulty==='medium' && solvedIds.some(id=>id?.toString()===p._id?.toString())).length;
  const solvedH = problems.filter(p => p.difficulty==='hard'   && solvedIds.some(id=>id?.toString()===p._id?.toString())).length;

  const last7 = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    const key = d.toISOString().split('T')[0];
    const log = progress?.activityLog?.find(l=>l.date===key);
    return { day:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], count:log?.count||0 };
  });

  // Split companies into upcoming and past
  const now = new Date();
  const upcoming = companies.filter(c => c.isUpcoming || (c.visitDate && new Date(c.visitDate) > now));
  const past     = companies.filter(c => !c.isUpcoming && (!c.visitDate || new Date(c.visitDate) <= now));

  const StatCard = ({ num, label, sub, color='#7c3aed', to }) => (
    <div onClick={()=>to&&navigate(to)}
      style={{ background:'#fff', borderRadius:13, border:'1px solid #ede9fe', padding:'15px 17px', cursor:to?'pointer':'default', transition:'all .18s', position:'relative', overflow:'hidden' }}
      onMouseEnter={e=>{ if(to){ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px ${color}22`; e.currentTarget.style.borderColor=color+'44'; } }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#ede9fe'; }}>
      <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:color, borderRadius:'13px 0 0 13px' }} />
      <div style={{ fontSize:24, fontWeight:700, color, paddingLeft:8 }}>{num}</div>
      <div style={{ fontSize:11, color:'#9ca3af', marginTop:2, fontWeight:500, paddingLeft:8 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color, marginTop:5, fontWeight:600, opacity:.8, paddingLeft:8 }}>{sub} {to&&'→'}</div>}
    </div>
  );

  return (
    <div style={{ animation:'fadeIn .3s ease' }}>

      {/* ── Upcoming Companies Banner ── */}
      <div style={{ marginBottom:18 }}>
        {upcoming.length === 0 ? (
          <div style={{ background:'linear-gradient(135deg,#f5f3ff,#fdf4ff)', border:'1.5px dashed #c4b5fd', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontSize:28 }}>🏢</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#7c3aed', marginBottom:2 }}>Upcoming Campus Visits</div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>No company visits announced yet. Admin will post upcoming companies here.</div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:11 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#374151' }}>📅 Upcoming Campus Visits</div>
              <div style={{ background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, animation:'pulse 2s infinite' }}>LIVE</div>
              <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}`}</style>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(upcoming.length,3)},1fr)`, gap:12 }}>
              {upcoming.map((co,i) => {
                const daysLeft = co.visitDate ? Math.ceil((new Date(co.visitDate)-now)/(1000*60*60*24)) : null;
                return (
                  <div key={co._id} onClick={()=>navigate('/companies')}
                    style={{ background:'#fff', borderRadius:13, border:`2px solid ${co.accentColor||'#7c3aed'}22`, cursor:'pointer', overflow:'hidden', transition:'all .18s', position:'relative', boxShadow:`0 2px 16px ${co.accentColor||'#7c3aed'}18` }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 28px ${co.accentColor||'#7c3aed'}30`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 2px 16px ${co.accentColor||'#7c3aed'}18`; }}>
                    {/* Gradient top strip */}
                    <div style={{ height:6, background:`linear-gradient(90deg,${co.accentColor||'#7c3aed'},${co.accentColor||'#7c3aed'}88)` }} />
                    <div style={{ padding:'14px 16px' }}>
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          {co.logoUrl
                            ? <img src={co.logoUrl} alt={co.name} style={{ width:42, height:42, borderRadius:10, objectFit:'contain', border:'1px solid #f3f4f6' }} />
                            : <div style={{ width:42, height:42, borderRadius:10, background:co.bgColor||'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:21 }}>{co.emoji||'🏢'}</div>
                          }
                          <div>
                            <div style={{ fontSize:15, fontWeight:700, color:'#1a1a2e' }}>{co.name}</div>
                            <div style={{ fontSize:11, color:'#9ca3af' }}>{co.role}</div>
                          </div>
                        </div>
                        {daysLeft !== null && (
                          <div style={{ background: daysLeft<=7?'#fef2f2':daysLeft<=14?'#fef3c7':'#f0fdf4', color: daysLeft<=7?'#dc2626':daysLeft<=14?'#d97706':'#16a34a', padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, whiteSpace:'nowrap', flexShrink:0, border:`1px solid ${daysLeft<=7?'#fecaca':daysLeft<=14?'#fde68a':'#bbf7d0'}` }}>
                            {daysLeft === 0 ? '🔴 Today!' : daysLeft === 1 ? '🟡 Tomorrow!' : `⏰ ${daysLeft} days`}
                          </div>
                        )}
                      </div>
                      {co.announcement && (
                        <div style={{ fontSize:12, color:'#374151', background:co.bgColor||'#f5f3ff', padding:'9px 12px', borderRadius:9, marginBottom:10, lineHeight:1.5, borderLeft:`3px solid ${co.accentColor||'#7c3aed'}` }}>
                          📢 {co.announcement}
                        </div>
                      )}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {(co.tags||[]).slice(0,3).map(t=><span key={t} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:co.bgColor||'#ede9fe', color:co.accentColor||'#7c3aed', fontWeight:500 }}>{t}</span>)}
                        </div>
                        <span style={{ fontSize:11, color:co.accentColor||'#7c3aed', fontWeight:600 }}>
                          {co.visitDate && new Date(co.visitDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'})} · {co.resources?.length||0} resources →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Welcome Banner ── */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius:14, padding:'20px 24px', color:'#fff', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:600, marginBottom:5 }}>Good morning, {user?.name?.split(' ')[0]} 👋</h2>
          <p style={{ fontSize:13, opacity:.88, lineHeight:1.7 }}>
            You've solved <strong>{solved}</strong> of <strong>{total}</strong> problems · {total>0?Math.round(solved/total*100):0}% complete
            {user?.rollNo && <span style={{opacity:.7}}> · {user.rollNo}</span>}
          </p>
        </div>
        <div style={{ background:'rgba(255,255,255,.18)', borderRadius:12, padding:'13px 20px', textAlign:'center', flexShrink:0 }}>
          <div style={{ fontSize:30, fontWeight:700 }}>🔥 {progress?.streak||0}</div>
          <div style={{ fontSize:11, opacity:.8, marginTop:2 }}>day streak</div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:18 }}>
        <StatCard num={solved}                         label="Problems Solved"  sub={`${total>0?Math.round(solved/total*100):0}% of sheet`} color="#7c3aed" to="/dsa" />
        <StatCard num={companies.length}               label="Companies Added"  sub="View resources"    color="#f59e0b" to="/companies" />
        <StatCard num={subjects.length}                label="Core Subjects"    sub="Study now"         color="#10b981" to="/subjects" />
        <StatCard num={progress?.aptitudeDone?.length||0} label="Aptitude Done" sub="Keep practising"  color="#a855f7" to="/aptitude" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
        {/* Doughnut */}
        <div style={{ background:'#fff', borderRadius:13, border:'1px solid #ede9fe', padding:17 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Difficulty Breakdown</div>
          <div style={{ display:'flex', alignItems:'center', gap:18 }}>
            <div style={{ width:120, height:120, flexShrink:0 }}>
              <Doughnut
                data={{ labels:['Easy','Medium','Hard'], datasets:[{
                  data: [solvedE||0, solvedM||0, solvedH||0].some(v=>v>0) ? [solvedE,solvedM,solvedH] : [1,0,0],
                  backgroundColor:['#10b981','#f59e0b','#ef4444'], borderWidth:0, hoverOffset:4
                }]}}
                options={{ plugins:{legend:{display:false}}, cutout:'68%', maintainAspectRatio:false, animation:{animateScale:true} }} />
            </div>
            <div style={{ flex:1 }}>
              {[['#10b981','Easy',solvedE,problems.filter(p=>p.difficulty==='easy').length],
                ['#f59e0b','Medium',solvedM,problems.filter(p=>p.difficulty==='medium').length],
                ['#ef4444','Hard',solvedH,problems.filter(p=>p.difficulty==='hard').length]].map(([c,l,s,t])=>(
                <div key={l} style={{ display:'flex', alignItems:'center', gap:9, marginBottom:10 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:c, flexShrink:0 }}/>
                  <div><span style={{ fontSize:13, fontWeight:600 }}>{s}/{t}</span><span style={{ fontSize:11, color:'#9ca3af', marginLeft:5 }}>{l}</span></div>
                </div>
              ))}
              <div style={{ marginTop:8, fontSize:11, color:'#9ca3af', borderTop:'1px solid #f3f4f6', paddingTop:8 }}>
                Total solved: <strong style={{color:'#7c3aed'}}>{solved}</strong> / {total}
              </div>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ background:'#fff', borderRadius:13, border:'1px solid #ede9fe', padding:17 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Weekly Activity</div>
          <div style={{ height:148 }}>
            <Bar
              data={{ labels:last7.map(d=>d.day), datasets:[{ label:'Problems solved', data:last7.map(d=>d.count), backgroundColor:'#a78bfa', borderRadius:7, hoverBackgroundColor:'#7c3aed' }] }}
              options={{ plugins:{legend:{display:false}}, scales:{ y:{beginAtZero:true,ticks:{stepSize:1,precision:0},grid:{color:'#f9fafb'}}, x:{grid:{display:false}} }, maintainAspectRatio:false }} />
          </div>
        </div>
      </div>

      {/* ── Topic Progress ── */}
      <div style={{ background:'#fff', borderRadius:13, border:'1px solid #ede9fe', padding:17, marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>DSA Topic Progress</div>
          <button onClick={()=>navigate('/dsa')} style={{ fontSize:11, color:'#7c3aed', background:'#ede9fe', border:'none', borderRadius:7, padding:'4px 12px', cursor:'pointer', fontWeight:600 }}>Open Sheet →</button>
        </div>
        {problems.length === 0 ? (
          <div style={{ textAlign:'center', padding:16, color:'#9ca3af', fontSize:13 }}>No problems added yet. Admin can add from the Admin Panel.</div>
        ) : (
          // Group by topic
          Object.entries(problems.reduce((acc,p) => {
            const tName = p.topic?.name || 'Uncategorized';
            if (!acc[tName]) acc[tName] = [];
            acc[tName].push(p);
            return acc;
          }, {})).slice(0,8).map(([topic, tProbs]) => {
            const done = tProbs.filter(p => solvedIds.some(id=>id?.toString()===p._id?.toString())).length;
            const pct  = Math.round(done/tProbs.length*100);
            const color = pct===100?'#10b981':pct>=60?'#7c3aed':pct>=30?'#f59e0b':'#ef4444';
            return (
              <div key={topic} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#6b7280', marginBottom:4 }}>
                  <span style={{ fontWeight:500 }}>{topic}</span>
                  <span style={{ color, fontWeight:600 }}>{done}/{tProbs.length}</span>
                </div>
                <div style={{ background:'#f3f4f6', borderRadius:6, height:7, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:6, transition:'width .6s ease' }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Past Company Resources Preview ── */}
      {past.length > 0 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>📚 Previously Visited Companies</div>
            <button onClick={()=>navigate('/companies')} style={{ fontSize:11, color:'#7c3aed', background:'#ede9fe', border:'none', borderRadius:7, padding:'4px 12px', cursor:'pointer', fontWeight:600 }}>View all →</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {past.slice(0,3).map(co=>(
              <div key={co._id} onClick={()=>navigate('/companies')}
                style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:15, cursor:'pointer', borderTop:`4px solid ${co.accentColor||'#7c3aed'}`, transition:'all .15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(124,58,237,.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
                  {co.logoUrl
                    ? <img src={co.logoUrl} alt={co.name} style={{ width:36,height:36,borderRadius:9,objectFit:'contain',border:'1px solid #f3f4f6' }} />
                    : <div style={{ width:36,height:36,borderRadius:9,background:co.bgColor||'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17 }}>{co.emoji||'🏢'}</div>
                  }
                  <div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{co.name}</div>
                    <div style={{ fontSize:10, color:'#9ca3af' }}>{co.role}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:'#a78bfa', fontWeight:500 }}>📁 {co.resources?.length||0} resources available</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
