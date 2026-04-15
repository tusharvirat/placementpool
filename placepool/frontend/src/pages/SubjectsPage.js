import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects,  setSubjects]  = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selSubj,   setSelSubj]   = useState(null);
  const [showAns,   setShowAns]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [selTopic,  setSelTopic]  = useState('all');

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/subjects'), api.get('/subjects/questions')])
      .then(([s,q]) => {
        if (cancelled) return;
        setSubjects(s.data.data);
        setQuestions(q.data.data);
      })
      .catch(e => { if (!cancelled && e.code !== 'ERR_CANCELED') toast.error('Failed to load subjects'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#7c3aed', fontSize:14 }}>Loading subjects…</div>;

  const selSubjData = subjects.find(s=>s._id?.toString()===selSubj?.toString());
  const subjQs      = questions.filter(q=>q.subject?._id?.toString()===selSubj?.toString());
  const topics      = [...new Set(subjQs.map(q=>q.topicName).filter(Boolean))];
  const filteredQs  = selTopic==='all' ? subjQs : subjQs.filter(q=>q.topicName===selTopic);

  if (!selSubj) {
    return (
      <div style={{ animation:'fadeIn .25s ease' }}>
        <div style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>📚 Core Subjects</div>
        {subjects.length===0 && (
          <div style={{ textAlign:'center', padding:40, background:'#fff', borderRadius:12, border:'1px solid #ede9fe', color:'#9ca3af', fontSize:13 }}>
            No subjects added yet. Admin can add from Admin Panel.
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:13 }}>
          {subjects.map((s,i)=>{
            const cnt  = questions.filter(q=>q.subject?._id?.toString()===s._id?.toString()).length;
            const tpcs = [...new Set(questions.filter(q=>q.subject?._id?.toString()===s._id?.toString()).map(q=>q.topicName).filter(Boolean))];
            return (
              <div key={s._id} onClick={()=>{ setSelSubj(s._id); setSelTopic('all'); setShowAns({}); }}
                style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:18, cursor:'pointer', transition:'all .15s', animation:`fadeIn .2s ease ${i*.07}s both` }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='#c4b5fd'; e.currentTarget.style.boxShadow='0 6px 20px rgba(124,58,237,.1)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='#ede9fe'; e.currentTarget.style.boxShadow='none'; }}>
                <div style={{ width:42, height:42, borderRadius:11, background:s.color||'#ede9fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, marginBottom:11 }}>{s.icon}</div>
                <div style={{ fontSize:15, fontWeight:700, marginBottom:3 }}>{s.name}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:10 }}>{tpcs.length} topics · {cnt} questions</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {tpcs.slice(0,4).map(t=><span key={t} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:'#f3f4f6', color:'#6b7280', fontWeight:500 }}>{t}</span>)}
                  {tpcs.length>4&&<span style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:'#f3f4f6', color:'#9ca3af' }}>+{tpcs.length-4} more</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation:'fadeIn .25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <button onClick={()=>{ setSelSubj(null); setShowAns({}); }}
          style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', color:'#6b7280', cursor:'pointer', fontSize:13, fontWeight:500 }}>
          ← Back
        </button>
        <div style={{ fontSize:15, fontWeight:700 }}>{selSubjData?.icon} {selSubjData?.name}</div>
        <div style={{ fontSize:12, color:'#9ca3af', marginLeft:'auto' }}>{filteredQs.length} questions</div>
      </div>

      {/* Topic filter tabs */}
      {topics.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          <button onClick={()=>setSelTopic('all')} style={{ padding:'5px 13px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', borderColor:selTopic==='all'?'#a78bfa':'#e5e7eb', background:selTopic==='all'?'#ede9fe':'#fff', color:selTopic==='all'?'#7c3aed':'#6b7280' }}>All</button>
          {topics.map(t=>(
            <button key={t} onClick={()=>setSelTopic(t)} style={{ padding:'5px 13px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', borderColor:selTopic===t?'#a78bfa':'#e5e7eb', background:selTopic===t?'#ede9fe':'#fff', color:selTopic===t?'#7c3aed':'#6b7280' }}>{t}</button>
          ))}
        </div>
      )}

      {filteredQs.length===0 && (
        <div style={{ color:'#9ca3af', fontSize:13, padding:24, background:'#fff', borderRadius:12, border:'1px solid #ede9fe', textAlign:'center' }}>
          No questions in this subject yet. Admin can add from the Admin Panel.
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
        {filteredQs.map((q,i)=>(
          <div key={q._id} style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:18, animation:`fadeIn .15s ease ${i*.02}s both` }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:10 }}>
              <div style={{ fontSize:13.5, fontWeight:600, flex:1, lineHeight:1.5 }}>Q{i+1}. {q.question}</div>
              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                <span style={{ fontSize:10, padding:'3px 8px', borderRadius:6, fontWeight:600, background:q.difficulty==='easy'?'#d1fae5':q.difficulty==='hard'?'#fee2e2':'#fef3c7', color:q.difficulty==='easy'?'#065f46':q.difficulty==='hard'?'#991b1b':'#92400e' }}>{q.difficulty}</span>
                <span style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:'#ede9fe', color:'#7c3aed', fontWeight:500 }}>{q.type}</span>
              </div>
            </div>
            {q.topicName&&<div style={{ fontSize:11, color:'#9ca3af', marginBottom:8, display:'flex', alignItems:'center', gap:4 }}>📂 {q.topicName}</div>}

            {/* P2: Rich content display - render HTML if it contains tags, else plain text */}
            {q.type==='MCQ'&&(q.options||[]).length>0&&(
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:10 }}>
                {q.options.map((o,idx)=>(
                  <div key={idx} style={{ fontSize:12, padding:'8px 12px', borderRadius:8, background:'#f9fafb', border:'1px solid #f3f4f6', display:'flex', gap:8 }}>
                    <span style={{ fontWeight:700, color:'#7c3aed', flexShrink:0 }}>{String.fromCharCode(65+idx)}.</span>{o}
                  </div>
                ))}
              </div>
            )}

            <button onClick={()=>setShowAns(a=>({...a,[q._id]:!a[q._id]}))}
              style={{ fontSize:12, color:'#7c3aed', fontWeight:600, cursor:'pointer', border:'1px solid #ddd6fe', borderRadius:8, padding:'6px 14px', background:'#faf5ff', transition:'all .15s' }}>
              {showAns[q._id]?'Hide Answer ▲':'Show Answer ▼'}
            </button>

            {showAns[q._id]&&(
              <div style={{ marginTop:11, padding:'13px 16px', background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0', lineHeight:1.7 }}>
                {/* P2: render HTML answer if it has tags */}
                {q.answer && (/<[a-z][\s\S]*>/i.test(q.answer))
                  ? <div dangerouslySetInnerHTML={{ __html: q.answer }} style={{ fontSize:13, color:'#065f46' }}/>
                  : <div style={{ fontSize:13, color:'#065f46', whiteSpace:'pre-wrap' }}><strong>Answer:</strong> {q.answer}</div>
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
