import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const resIcon  = { pdf:'📄',video:'🎥',sheet:'📊',note:'📝',link:'🔗',image:'🖼️',ppt:'📑',other:'📁' };
const resLabel = { pdf:'PDF',video:'Video',sheet:'Sheet',note:'Notes',link:'Link',image:'Image',ppt:'PPT',other:'File' };

// P4 fix: get the best openable URL from a resource
function getUrl(r) {
  return r.secureUrl || r.url || null;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [sel,       setSel]       = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(()=>{
    api.get('/companies').then(r=>setCompanies(r.data.data)).finally(()=>setLoading(false));
  },[]);

  if (loading) return <Loader/>;

  if (sel) {
    const co = companies.find(c=>c._id===sel);
    if (!co) return null;
    const byType = {};
    (co.resources||[]).forEach(r=>{ byType[r.type]=(byType[r.type]||0)+1; });
    return (
      <div style={{animation:'fadeIn .25s ease'}}>
        <button onClick={()=>setSel(null)} style={backBtn}>← All Companies</button>
        <div style={{background:'#fff',borderRadius:14,border:'1px solid #ede9fe',overflow:'hidden',boxShadow:'0 2px 16px rgba(124,58,237,.06)'}}>
          <div style={{height:6,background:`linear-gradient(90deg,${co.accentColor||'#7c3aed'},${co.accentColor||'#7c3aed'}66)`}}/>
          <div style={{padding:22}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:16,marginBottom:18}}>
              {co.logoUrl
                ?<img src={co.logoUrl} alt={co.name} style={{width:58,height:58,borderRadius:12,objectFit:'contain',border:'1px solid #f3f4f6',flexShrink:0}}/>
                :<div style={{width:58,height:58,borderRadius:12,background:co.bgColor||'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:27,flexShrink:0}}>{co.emoji||'🏢'}</div>
              }
              <div style={{flex:1}}>
                <div style={{fontSize:20,fontWeight:700,marginBottom:3}}>{co.name}</div>
                <div style={{fontSize:12,color:'#9ca3af',marginBottom:7}}>{co.role}</div>
                <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                  {(co.tags||[]).map(t=><span key={t} style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:co.bgColor||'#ede9fe',color:co.accentColor||'#7c3aed',fontWeight:500}}>{t}</span>)}
                </div>
              </div>
              <div style={{display:'flex',gap:7,flexWrap:'wrap',justifyContent:'flex-end',flexShrink:0}}>
                {Object.entries(byType).map(([t,c])=>(
                  <span key={t} style={{fontSize:11,padding:'4px 10px',borderRadius:8,border:'1px solid #ede9fe',color:'#6b7280',display:'flex',alignItems:'center',gap:4}}>{resIcon[t]} {c} {resLabel[t]}</span>
                ))}
              </div>
            </div>

            {co.announcement && (
              <div style={{background:`${co.bgColor||'#f5f3ff'}`,border:`1px solid ${co.accentColor||'#7c3aed'}33`,borderLeft:`4px solid ${co.accentColor||'#7c3aed'}`,borderRadius:10,padding:'12px 16px',marginBottom:18,fontSize:13,color:'#374151',lineHeight:1.6}}>
                📢 {co.announcement}
              </div>
            )}

            <div style={{fontSize:14,fontWeight:600,marginBottom:12}}>All Resources ({co.resources?.length||0})</div>
            {(!co.resources||co.resources.length===0)&&(
              <div style={{textAlign:'center',padding:28,color:'#9ca3af',fontSize:13,background:'#f9fafb',borderRadius:10}}>No resources added yet for this company.</div>
            )}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(co.resources||[]).map(r=>{
                const url = getUrl(r);
                return (
                  <div key={r._id} style={{display:'flex',alignItems:'center',gap:13,background:'#f9fafb',borderRadius:11,padding:'13px 16px',border:'1px solid #f3f4f6',transition:'background .13s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f3f0ff'}
                    onMouseLeave={e=>e.currentTarget.style.background='#f9fafb'}>
                    <div style={{width:42,height:42,borderRadius:9,background:'#fff',border:'1px solid #ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,flexShrink:0}}>
                      {resIcon[r.type]||'📁'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{r.name}</div>
                      {r.description&&<div style={{fontSize:11,color:'#9ca3af',lineHeight:1.5}}>{r.description}</div>}
                      <div style={{fontSize:10,color:'#c4b5fd',marginTop:3}}>
                        {resLabel[r.type]} · {new Date(r.addedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        {r.fileName&&<span style={{marginLeft:6}}>· {r.fileName}</span>}
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                      <span style={{fontSize:10,padding:'3px 9px',borderRadius:6,background:'#ede9fe',color:'#7c3aed',fontWeight:500,textTransform:'uppercase'}}>{r.type}</span>
                      {url ? (
                        // P4 fix: use secureUrl (https), open in new tab, no 401
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          style={{fontSize:12,color:'#fff',fontWeight:600,padding:'7px 14px',borderRadius:8,background:`linear-gradient(135deg,${co.accentColor||'#7c3aed'},${co.accentColor||'#7c3aed'}cc)`,textDecoration:'none',whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:5}}>
                          {r.type==='video'?'▶ Play':r.type==='pdf'?'📄 Open':'Open ↗'}
                        </a>
                      ) : (
                        <span style={{fontSize:11,color:'#9ca3af'}}>No link</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{animation:'fadeIn .25s ease'}}>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:18,fontWeight:700}}>🏢 Company Resources</div>
        <div style={{fontSize:12,color:'#9ca3af',marginTop:3}}>Study materials for companies that have visited or are visiting your campus</div>
      </div>
      {companies.length===0&&(
        <div style={{textAlign:'center',padding:'48px 20px',background:'#fff',borderRadius:12,border:'1px solid #ede9fe'}}>
          <div style={{fontSize:36,marginBottom:10}}>🏢</div>
          <div style={{fontSize:14,fontWeight:500,color:'#374151',marginBottom:4}}>No companies added yet</div>
          <div style={{fontSize:12,color:'#9ca3af'}}>Admin can add company resources from the Admin Panel.</div>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
        {companies.map((co,i)=>(
          <div key={co._id} onClick={()=>setSel(co._id)}
            style={{background:'#fff',borderRadius:13,border:`1.5px solid ${co.isUpcoming?co.accentColor+'44':'#ede9fe'}`,cursor:'pointer',overflow:'hidden',transition:'all .15s',animation:`fadeIn .2s ease ${i*.05}s both`}}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 6px 22px ${co.accentColor||'#7c3aed'}18`; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <div style={{height:5,background:`linear-gradient(90deg,${co.accentColor||'#7c3aed'},${co.accentColor||'#7c3aed'}66)`}}/>
            {co.isUpcoming&&<div style={{background:co.accentColor||'#7c3aed',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',textAlign:'center',letterSpacing:.5}}>📅 UPCOMING VISIT</div>}
            <div style={{padding:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:11}}>
                {co.logoUrl
                  ?<img src={co.logoUrl} alt={co.name} style={{width:42,height:42,borderRadius:10,objectFit:'contain',border:'1px solid #f3f4f6'}}/>
                  :<div style={{width:42,height:42,borderRadius:10,background:co.bgColor||'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{co.emoji||'🏢'}</div>
                }
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{co.name}</div>
                  <div style={{fontSize:11,color:'#9ca3af'}}>{co.role}</div>
                </div>
                <span style={{marginLeft:'auto',fontSize:10,background:'#ede9fe',color:'#7c3aed',padding:'3px 8px',borderRadius:6,fontWeight:600}}>{co.resources?.length||0} files</span>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
                {(co.tags||[]).map(t=><span key={t} style={{fontSize:10,padding:'3px 8px',borderRadius:6,background:co.bgColor||'#ede9fe',color:co.accentColor||'#7c3aed',fontWeight:500}}>{t}</span>)}
              </div>
              {co.visitDate&&<div style={{fontSize:11,color:'#9ca3af',marginBottom:6}}>📅 {new Date(co.visitDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>}
              <div style={{fontSize:11,color:co.accentColor||'#7c3aed',fontWeight:600}}>View all resources →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const backBtn = { marginBottom:16,padding:'7px 16px',borderRadius:9,border:'1px solid #e5e7eb',background:'#fff',color:'#6b7280',cursor:'pointer',fontSize:13,fontWeight:500 };
function Loader() { return <div style={{padding:40,textAlign:'center',color:'#7c3aed',fontSize:14}}>Loading…</div>; }
