import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AptitudePage() {
  const [cats,      setCats]      = useState([]);
  const [questions, setQuestions] = useState([]);
  const [progress,  setProgress]  = useState(null);
  const [selCat,    setSelCat]    = useState(null);
  const [answers,   setAnswers]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/aptitude/categories'),
      api.get('/aptitude/questions'),
      api.get('/progress'),
    ]).then(([c,q,p]) => {
      if (cancelled) return;
      setCats(c.data.data);
      setQuestions(q.data.data);
      setProgress(p.data.data);
    }).catch(e => {
      if (cancelled) return;
      if (e.code !== 'ERR_CANCELED') toast.error('Failed to load aptitude data');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggleDone = useCallback(async (qid) => {
    if (toggling) return;
    setToggling(qid);
    try {
      const r = await api.post(`/progress/toggle-aptitude/${qid}`);
      setProgress(r.data.data);
      // P4 fix: check if it was added or removed
      const nowDone = (r.data.data.aptitudeDone || []).some(id => id?.toString() === qid?.toString());
      toast.success(nowDone ? '✅ Marked as done!' : 'Unmarked');
    } catch(e) {
      if (e.code !== 'ERR_CANCELED') toast.error('Failed to update progress');
    }
    finally { setToggling(null); }
  }, [toggling]);

  // P4 fix: convert all IDs to strings before comparison — MongoDB ObjectIds fail Set.has()
  const doneSet = new Set((progress?.aptitudeDone || []).map(id => id?.toString()));
  const isDone  = (qid) => doneSet.has(qid?.toString());

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#7c3aed', fontSize:14 }}>Loading aptitude…</div>;

  return (
    <div style={{ animation:'fadeIn .25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ fontSize:18, fontWeight:700 }}>🧠 Aptitude Practice</div>
        <div style={{ fontSize:12, color:'#9ca3af' }}>{doneSet.size} questions completed</div>
      </div>

      {cats.length === 0 && (
        <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:12, border:'1px solid #ede9fe', color:'#9ca3af', fontSize:13 }}>
          No aptitude categories yet. Admin can add from the Admin Panel.
        </div>
      )}

      {!selCat ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:13 }}>
          {cats.map((c,i) => {
            const qs  = questions.filter(q => q.category?._id?.toString() === c._id?.toString());
            // P4 fix: use string comparison
            const doneCnt = qs.filter(q => isDone(q._id)).length;
            const pct = qs.length ? Math.round(doneCnt/qs.length*100) : 0;
            const radius = 28, circ = 2*Math.PI*radius;
            return (
              <div key={c._id} onClick={()=>setSelCat(c._id)}
                style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:'18px 16px', cursor:'pointer', textAlign:'center', transition:'all .15s', animation:`fadeIn .2s ease ${i*.07}s both` }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(124,58,237,.1)'; e.currentTarget.style.borderColor='#c4b5fd'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='#ede9fe'; }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{c.icon||'🧠'}</div>
                <svg width="76" height="76" viewBox="0 0 76 76" style={{ display:'block', margin:'0 auto 10px' }} role="img" aria-label={`${c.name} ${pct}% done`}>
                  <circle cx="38" cy="38" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="9"/>
                  <circle cx="38" cy="38" r={radius} fill="none" stroke="#7c3aed" strokeWidth="9"
                    strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeDashoffset={circ*0.25} strokeLinecap="round"
                    style={{ transition:'stroke-dasharray .6s ease' }}/>
                  <text x="38" y="43" textAnchor="middle" fontSize="14" fontWeight="700" fill="#374151">{pct}%</text>
                </svg>
                <div style={{ fontSize:13, fontWeight:700, marginBottom:3 }}>{c.name}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:6 }}>{doneCnt}/{qs.length} done</div>
                {qs.length > 0 && (
                  <div style={{ fontSize:10, background:'#f3f4f6', borderRadius:6, height:4, overflow:'hidden', marginTop:6 }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:'#7c3aed', borderRadius:6, transition:'width .5s ease' }}/>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <button onClick={()=>{ setSelCat(null); setAnswers({}); }}
              style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', color:'#6b7280', cursor:'pointer', fontSize:13, fontWeight:500 }}>
              ← Back
            </button>
            <div style={{ fontSize:15, fontWeight:700 }}>{cats.find(c=>c._id?.toString()===selCat?.toString())?.name}</div>
            <div style={{ fontSize:12, color:'#9ca3af', marginLeft:'auto' }}>
              {questions.filter(q=>q.category?._id?.toString()===selCat?.toString() && isDone(q._id)).length} / {questions.filter(q=>q.category?._id?.toString()===selCat?.toString()).length} done
            </div>
          </div>

          {questions.filter(q=>q.category?._id?.toString()===selCat?.toString()).length===0 && (
            <div style={{ color:'#9ca3af', fontSize:13, padding:24, background:'#fff', borderRadius:12, border:'1px solid #ede9fe', textAlign:'center' }}>
              No questions in this category yet. Admin can add from the Admin Panel.
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {questions.filter(q=>q.category?._id?.toString()===selCat?.toString()).map((q,i)=>{
              const qDone = isDone(q._id);
              const sel   = answers[q._id];
              return (
                <div key={q._id} style={{ background:'#fff', borderRadius:12, border:`1.5px solid ${qDone?'#10b981':'#ede9fe'}`, padding:17, animation:`fadeIn .15s ease ${i*.03}s both`, transition:'border-color .2s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:11 }}>
                    <div style={{ fontSize:13, fontWeight:600, flex:1, lineHeight:1.5 }}>Q{i+1}. {q.question}</div>
                    <div style={{ display:'flex', gap:5, flexShrink:0, marginLeft:10 }}>
                      <span style={{ fontSize:10, padding:'3px 8px', borderRadius:5, fontWeight:600, background:q.difficulty==='easy'?'#d1fae5':q.difficulty==='hard'?'#fee2e2':'#fef3c7', color:q.difficulty==='easy'?'#065f46':q.difficulty==='hard'?'#991b1b':'#92400e' }}>{q.difficulty}</span>
                      {qDone && <span style={{ fontSize:10, padding:'3px 8px', borderRadius:5, background:'#d1fae5', color:'#065f46', fontWeight:600 }}>✓ Done</span>}
                    </div>
                  </div>

                  {(q.options||[]).length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
                      {q.options.map((o,idx)=>(
                        <div key={idx} onClick={()=>setAnswers(a=>({...a,[q._id]:o}))}
                          style={{ fontSize:12, padding:'9px 13px', borderRadius:8, cursor:'pointer', transition:'all .1s',
                            border:`1px solid ${sel===o?'#a78bfa':sel&&o===q.answer?'#10b981':'#f3f4f6'}`,
                            background:sel===o?'#ede9fe':sel&&o===q.answer?'#f0fdf4':'#f9fafb',
                            color:sel===o?'#7c3aed':sel&&o===q.answer?'#065f46':'#374151', fontWeight:sel===o?600:400 }}>
                          <span style={{ fontWeight:700, marginRight:8 }}>{String.fromCharCode(65+idx)}.</span>{o}
                        </div>
                      ))}
                    </div>
                  )}

                  {sel && (
                    <div style={{ padding:'10px 13px', background:sel===q.answer?'#f0fdf4':'#fef2f2', borderRadius:9, fontSize:12, color:sel===q.answer?'#065f46':'#991b1b', border:`1px solid ${sel===q.answer?'#bbf7d0':'#fecaca'}`, marginBottom:10, lineHeight:1.5 }}>
                      {sel===q.answer ? '✅ Correct!' : `❌ Incorrect. Correct answer: ${q.answer}`}
                      {q.explanation && <div style={{ marginTop:5, color:'#6b7280', fontSize:11 }}>💡 {q.explanation}</div>}
                    </div>
                  )}

                  <button onClick={()=>toggleDone(q._id)} disabled={toggling===q._id}
                    style={{ fontSize:11, padding:'6px 14px', borderRadius:7, border:'1px solid', cursor:toggling===q._id?'wait':'pointer', fontWeight:600, transition:'all .15s',
                      borderColor:qDone?'#10b981':'#e5e7eb', background:qDone?'#d1fae5':'#fff', color:qDone?'#065f46':'#6b7280' }}>
                    {toggling===q._id ? '⏳' : qDone ? '✓ Marked done — click to undo' : 'Mark as done'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
