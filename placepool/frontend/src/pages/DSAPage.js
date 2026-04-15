import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const DC = { easy:{bg:'#d1fae5',color:'#065f46'}, medium:{bg:'#fef3c7',color:'#92400e'}, hard:{bg:'#fee2e2',color:'#991b1b'} };

export default function DSAPage() {
  const [topics,   setTopics]   = useState([]);
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selTopic, setSelTopic] = useState(null);
  const [selDiff,  setSelDiff]  = useState('all');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/dsa/topics'), api.get('/dsa/problems'), api.get('/progress')])
      .then(([t,p,pr]) => {
        if (cancelled) return;
        setTopics(t.data.data);
        setProblems(p.data.data);
        setProgress(pr.data.data);
        setSelTopic(t.data.data[0]?._id || null);
      })
      .catch(e => { if (!cancelled && e.code !== 'ERR_CANCELED') toast.error('Failed to load DSA data'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async (pid) => {
    if (toggling) return;
    setToggling(pid);
    try {
      const r = await api.post(`/progress/toggle-problem/${pid}`);
      setProgress(r.data.data);
      const nowSolved = (r.data.data.solvedProblems||[]).some(id=>id?.toString()===pid?.toString());
      toast.success(nowSolved ? '✅ Marked as solved!' : 'Unmarked');
    } catch(e) { if (e.code !== 'ERR_CANCELED') toast.error('Failed to update progress'); }
    finally { setToggling(null); }
  }, [toggling]);

  // String comparison for solved set
  const solvedSet = new Set((progress?.solvedProblems||[]).map(id=>id?.toString()));
  const topicProbs = problems.filter(p=>p.topic?._id?.toString()===selTopic?.toString());
  const filtered   = topicProbs
    .filter(p=>selDiff==='all'||p.difficulty===selDiff)
    .filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#7c3aed', fontSize:14 }}>Loading DSA sheet…</div>;

  return (
    <div style={{ animation:'fadeIn .25s ease' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:700 }}>💻 DSA Problem Sheet</div>
          <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{problems.filter(p=>solvedSet.has(p._id?.toString())).length} / {problems.length} solved overall</div>
        </div>
        <input placeholder="🔍  Search problems…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ padding:'8px 14px', border:'1px solid #e5e7eb', borderRadius:20, fontSize:12, outline:'none', width:210, color:'#1a1a2e' }}/>
      </div>

      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        {['all','easy','medium','hard'].map(d=>(
          <button key={d} onClick={()=>setSelDiff(d)} style={{ padding:'5px 14px', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all .12s',
            borderColor:selDiff===d?'#a78bfa':'#e5e7eb', background:selDiff===d?'#ede9fe':'#fff', color:selDiff===d?'#7c3aed':'#6b7280' }}>
            {d==='all'?'All':d.charAt(0).toUpperCase()+d.slice(1)}
            {d!=='all'&&<span style={{marginLeft:5,fontSize:10,opacity:.7}}>({topicProbs.filter(p=>p.difficulty===d).length})</span>}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'178px 1fr', gap:14 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:9, height:'fit-content', position:'sticky', top:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#9ca3af', padding:'3px 7px', marginBottom:5, textTransform:'uppercase' }}>Topics</div>
          {topics.length===0 && <div style={{fontSize:12,color:'#9ca3af',padding:'8px 10px'}}>No topics yet.</div>}
          {topics.map(t=>{
            const cnt  = problems.filter(p=>p.topic?._id?.toString()===t._id?.toString()).length;
            const done = problems.filter(p=>p.topic?._id?.toString()===t._id?.toString()&&solvedSet.has(p._id?.toString())).length;
            const pct  = cnt?Math.round(done/cnt*100):0;
            const active = selTopic?.toString()===t._id?.toString();
            return (
              <button key={t._id} onClick={()=>{setSelTopic(t._id);setSearch('');}} style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8, fontSize:11.5, cursor:'pointer', border:'none',
                background:active?'#ede9fe':'transparent', color:active?'#7c3aed':'#4b5563', fontWeight:active?600:500, marginBottom:3, transition:'all .1s', borderLeft:`3px solid ${active?'#7c3aed':'transparent'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span>{t.name}</span>
                  <span style={{ fontSize:10, background:active?'#ddd6fe':'#f3f4f6', color:active?'#7c3aed':'#6b7280', padding:'1px 6px', borderRadius:7 }}>{done}/{cnt}</span>
                </div>
                <div style={{ marginTop:4, background:'#f3f4f6', borderRadius:4, height:3, overflow:'hidden' }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:active?'#7c3aed':'#c4b5fd', borderRadius:4, transition:'width .4s ease' }}/>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {filtered.length===0 && (
            <div style={{ textAlign:'center', padding:'40px 20px', background:'#fff', borderRadius:12, border:'1px solid #ede9fe' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{problems.length===0?'📭':search?'🔍':'📂'}</div>
              <div style={{ fontSize:14, fontWeight:500, color:'#374151', marginBottom:4 }}>
                {problems.length===0?'No problems added yet':search?`No results for "${search}"`:`No ${selDiff==='all'?'':selDiff+' '}problems in this topic`}
              </div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>
                {problems.length===0?'Admin can add problems from the Admin Panel.':'Try a different filter or topic.'}
              </div>
            </div>
          )}
          {filtered.map((p,i)=>{
            const done = solvedSet.has(p._id?.toString());
            const dc   = DC[p.difficulty]||DC.easy;
            return (
              <div key={p._id} style={{ background:'#fff', borderRadius:11, border:`1px solid ${done?'#10b981':'#ede9fe'}`, padding:'13px 16px', display:'flex', alignItems:'flex-start', gap:12,
                animation:`fadeIn .18s ease ${i*.02}s both`, borderLeft:`3px solid ${done?'#10b981':'transparent'}`, transition:'border-color .2s' }}>
                <div onClick={()=>toggle(p._id)} title={done?'Mark unsolved':'Mark solved'}
                  style={{ width:24, height:24, borderRadius:'50%', border:done?'none':'2px solid #d1d5db', background:done?'#10b981':'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center', cursor:toggling===p._id?'wait':'pointer', flexShrink:0, marginTop:2,
                    fontSize:12, color:'#fff', fontWeight:700, transition:'all .2s', opacity:toggling===p._id?.6:1 }}>
                  {done&&'✓'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, marginBottom:4, color:done?'#6b7280':'#1a1a2e', textDecoration:done?'line-through':'none', transition:'all .2s' }}>{p.name}</div>
                  {p.description&&<div style={{ fontSize:11.5, color:'#9ca3af', lineHeight:1.55, marginBottom:7 }}>{p.description}</div>}
                  <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:5, fontWeight:600, background:dc.bg, color:dc.color }}>{p.difficulty}</span>
                    {(p.companyTags||[]).map(t=><span key={t} style={{ fontSize:10, padding:'2px 8px', borderRadius:5, background:'#ede9fe', color:'#7c3aed', fontWeight:500 }}>{t}</span>)}
                  </div>
                </div>
                {p.leetcodeUrl&&(
                  <a href={p.leetcodeUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11, color:'#7c3aed', fontWeight:600, padding:'5px 11px', border:'1px solid #ddd6fe', borderRadius:8, whiteSpace:'nowrap', flexShrink:0, background:'#faf5ff', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                    LeetCode <span style={{ fontSize:9 }}>↗</span>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
