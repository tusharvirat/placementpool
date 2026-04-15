import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SECTIONS = [
  { key:'companies', label:'🏢 Companies' },
  { key:'dsa',       label:'💻 DSA Questions' },
  { key:'subjects',  label:'📚 Core Subjects' },
  { key:'aptitude',  label:'🧠 Aptitude' },
  { key:'topics',    label:'📂 DSA Topics' },
];
const RES_TYPES = ['pdf','video','sheet','note','link','image','ppt','other'];
const RES_ICONS = { pdf:'📄',video:'🎥',sheet:'📊',note:'📝',link:'🔗',image:'🖼️',ppt:'📑',other:'📁' };

export default function AdminPage() {
  const [section, setSection] = useState('companies');
  return (
    <div style={{ animation:'fadeIn .25s ease' }}>
      <div style={{ fontSize:17, fontWeight:700, color:'#7c3aed', marginBottom:16 }}>⚙ Admin Panel</div>
      <div style={{ display:'grid', gridTemplateColumns:'175px 1fr', gap:14 }}>
        <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:9, height:'fit-content', position:'sticky', top:10 }}>
          {SECTIONS.map(s=>(
            <button key={s.key} onClick={()=>setSection(s.key)}
              style={{ width:'100%', textAlign:'left', padding:'9px 11px', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer', border:'none', marginBottom:2, transition:'all .1s',
                background:section===s.key?'#ede9fe':'transparent', color:section===s.key?'#7c3aed':'#4b5563', borderLeft:`3px solid ${section===s.key?'#7c3aed':'transparent'}` }}>
              {s.label}
            </button>
          ))}
        </div>
        <div>
          {section==='companies' && <CompaniesAdmin />}
          {section==='dsa'       && <DSAAdmin />}
          {section==='subjects'  && <SubjectsAdmin />}
          {section==='aptitude'  && <AptitudeAdmin />}
          {section==='topics'    && <TopicsAdmin />}
        </div>
      </div>
    </div>
  );
}


/* ── Rich Text Editor (P2) ── */
function RichEditor({ label, value, onChange }) {
  const ref = React.useRef();
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    if (ref.current && !initialized) {
      ref.current.innerHTML = value || '';
      setInitialized(true);
    }
  }, []);

  const exec = (cmd, val=null) => { document.execCommand(cmd, false, val); ref.current.focus(); };
  const handleInput = () => { if(onChange) onChange({ target:{ value: ref.current.innerHTML } }); };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const toolBtn = (label, cmd, val=null, title='') => (
    <button type="button" title={title||label} onMouseDown={e=>{ e.preventDefault(); if(val!==null)exec(cmd,val);else exec(cmd); }}
      style={{ padding:'4px 9px', borderRadius:5, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:12, fontWeight:500, color:'#374151', minWidth:30, transition:'all .1s' }}
      onMouseEnter={e=>e.currentTarget.style.background='#f3f4f6'}
      onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
      {label}
    </button>
  );

  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{label}</label>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:9, overflow:'hidden' }}>
        {/* Toolbar */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, padding:'8px 10px', background:'#f9fafb', borderBottom:'1px solid #e5e7eb' }}>
          {toolBtn(<b>B</b>,'bold',null,'Bold')}
          {toolBtn(<i>I</i>,'italic',null,'Italic')}
          {toolBtn(<u>U</u>,'underline',null,'Underline')}
          {toolBtn('H1','formatBlock','h2','Heading')}
          {toolBtn('H2','formatBlock','h3','Subheading')}
          {toolBtn('¶','formatBlock','p','Paragraph')}
          {toolBtn('• List','insertUnorderedList',null,'Bullet List')}
          {toolBtn('1. List','insertOrderedList',null,'Numbered List')}
          {toolBtn('Code','formatBlock','pre','Code Block')}
          {toolBtn('—','insertHorizontalRule',null,'Divider')}
          <button type="button" title="Insert Image" onMouseDown={e=>{ e.preventDefault(); insertImage(); }}
            style={{ padding:'4px 9px', borderRadius:5, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer', fontSize:12, color:'#7c3aed', fontWeight:500 }}>
            🖼 Image
          </button>
          <button type="button" title="Clear formatting" onMouseDown={e=>{ e.preventDefault(); exec('removeFormat'); }}
            style={{ padding:'4px 9px', borderRadius:5, border:'1px solid #fecaca', background:'#fff', cursor:'pointer', fontSize:12, color:'#ef4444', fontWeight:500 }}>
            ✕ Clear
          </button>
        </div>
        {/* Editor area */}
        <div ref={ref} contentEditable suppressContentEditableWarning onInput={handleInput}
          style={{ minHeight:120, padding:'12px 14px', fontSize:13, lineHeight:1.7, color:'#1a1a2e', outline:'none', background:'#fff' }}
          data-placeholder="Write answer here — use toolbar to format, add headings, lists, images…"
        />
      </div>
      <style>{`
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; }
        [contenteditable] h2 { font-size:16px; font-weight:700; margin:8px 0 4px; }
        [contenteditable] h3 { font-size:14px; font-weight:600; margin:6px 0 3px; }
        [contenteditable] pre { background:#f3f4f6; border-radius:6px; padding:8px 12px; font-family:monospace; font-size:12px; margin:6px 0; }
        [contenteditable] ul,[contenteditable] ol { padding-left:20px; margin:6px 0; }
        [contenteditable] img { max-width:100%; border-radius:8px; margin:6px 0; }
        [contenteditable] hr { border:none; border-top:2px solid #ede9fe; margin:10px 0; }
      `}</style>
    </div>
  );
}

/* ── UI helpers ── */
const Panel = ({ title, count, children }) => (
  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9fe', padding:20 }}>
    <div style={{ fontSize:14, fontWeight:700, color:'#374151', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      {title}{count!=null&&<span style={{ fontSize:11, color:'#9ca3af', fontWeight:400, background:'#f3f4f6', padding:'2px 9px', borderRadius:20 }}>{count} items</span>}
    </div>
    {children}
  </div>
);
const Inp = ({ label, ...p }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{label}</label>
    <input style={{ width:'100%', padding:'9px 11px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, color:'#1a1a2e', background:'#fff', outline:'none' }} {...p} />
  </div>
);
const Sel = ({ label, children, ...p }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{label}</label>
    <select style={{ width:'100%', padding:'9px 11px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, background:'#fff', cursor:'pointer', outline:'none', color:'#1a1a2e' }} {...p}>{children}</select>
  </div>
);
const Txt = ({ label, ...p }) => (
  <div style={{ marginBottom:12 }}>
    <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>{label}</label>
    <textarea style={{ width:'100%', padding:'9px 11px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, resize:'vertical', minHeight:70, fontFamily:'inherit', color:'#1a1a2e', outline:'none' }} {...p}/>
  </div>
);
const SelOrText = ({ label, options, value, onChange, placeholder }) => {
  const [custom, setCustom] = useState(false);
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>
        {label} <span onClick={()=>setCustom(!custom)} style={{ fontSize:10, color:'#7c3aed', cursor:'pointer', fontWeight:400, textDecoration:'underline', marginLeft:4 }}>{custom?'← Dropdown':'+ Custom'}</span>
      </label>
      {custom
        ? <input placeholder={placeholder} value={value} onChange={onChange} style={{ width:'100%', padding:'9px 11px', border:'1px solid #a78bfa', borderRadius:8, fontSize:13, color:'#1a1a2e', background:'#fff', outline:'none' }}/>
        : <select value={value} onChange={onChange} style={{ width:'100%', padding:'9px 11px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:13, background:'#fff', cursor:'pointer', outline:'none', color:'#1a1a2e' }}>
            <option value="">Select…</option>
            {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
          </select>
      }
    </div>
  );
};
const BtnPrimary = ({ children, onClick, loading }) => (
  <button onClick={onClick} disabled={loading}
    style={{ padding:'10px 0', background:loading?'#a78bfa':'linear-gradient(135deg,#7c3aed,#a855f7)', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:loading?'not-allowed':'pointer', width:'100%', marginTop:4 }}>
    {loading?'⏳ Please wait…':children}
  </button>
);
const DelBtn = ({ onClick, loading }) => (
  <button onClick={onClick} disabled={loading}
    style={{ padding:'4px 10px', borderRadius:6, fontSize:11, cursor:'pointer', border:'1px solid #fecaca', background:'#fff', color:loading?'#9ca3af':'#ef4444' }}>
    {loading?'…':'Delete'}
  </button>
);
const Row2 = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>{children}</div>;
const Row3 = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>{children}</div>;
const Banner   = ({ msg }) => msg ? <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#065f46', padding:'9px 13px', borderRadius:8, fontSize:12, fontWeight:500, marginBottom:12 }}>✅ {msg}</div> : null;
const ErrBanner= ({ msg }) => msg ? <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b', padding:'9px 13px', borderRadius:8, fontSize:12, marginBottom:12 }}>⚠️ {msg}</div> : null;

function AdminTable({ heads, rows }) {
  return (
    <div style={{ overflowX:'auto', marginTop:14 }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead><tr>{heads.map(h=><th key={h} style={{ textAlign:'left', padding:'7px 9px', borderBottom:'2px solid #f3f4f6', color:'#9ca3af', fontWeight:700, fontSize:10, textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
function TD({ children, mw }) {
  return <td style={{ padding:'9px 9px', borderBottom:'1px solid #f9fafb', color:'#374151', verticalAlign:'middle', maxWidth:mw||'none', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:mw?'nowrap':'normal' }}>{children}</td>;
}

/* ── Companies Admin ── */
function CompaniesAdmin() {
  const [cos, setCos]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [selCo, setSelCo]       = useState(null);
  const [resLoading, setResLoading]   = useState(false);
  const [resDeleting, setResDeleting] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef();

  const [form, setForm] = useState({ name:'', role:'', emoji:'🏢', accentColor:'#7c3aed', bgColor:'#ede9fe', tags:'', visitDate:'', isUpcoming:false, announcement:'' });
  const [resForm, setResForm] = useState({ name:'', type:'pdf', description:'', url:'' });
  const [logoFile, setLogoFile] = useState(null);
  const [resFile,  setResFile]  = useState(null);

  const set  = k => e => setForm(f=>({...f,[k]: e.target.type==='checkbox'?e.target.checked:e.target.value}));
  const setR = k => e => setResForm(r=>({...r,[k]:e.target.value}));

  const load = useCallback(()=>{ api.get('/companies').then(r=>setCos(r.data.data)).catch(()=>setErr('Failed to load')).finally(()=>setLoading(false)); },[]);
  useEffect(()=>{ load(); },[load]);

  const flash    = m => { setMsg(m); setTimeout(()=>setMsg(''),3500); };
  const flashErr = m => { setErr(m); setTimeout(()=>setErr(''),4000); };

  const addCo = async () => {
    if (!form.name.trim()) { flashErr('Company name is required'); return; }
    setSaving(true); setErr('');
    try {
      const fd = new FormData();
      ['name','role','emoji','accentColor','bgColor','announcement'].forEach(k=>fd.append(k,form[k]||''));
      fd.append('tags', form.tags);
      fd.append('isUpcoming', form.isUpcoming);
      if (form.visitDate) fd.append('visitDate', form.visitDate);
      if (logoFile) fd.append('logo', logoFile);
      const r = await api.post('/companies', fd, { headers:{'Content-Type':'multipart/form-data'} });
      setCos(c=>[r.data.data,...c]);
      setForm({ name:'', role:'', emoji:'🏢', accentColor:'#7c3aed', bgColor:'#ede9fe', tags:'', visitDate:'', isUpcoming:false, announcement:'' });
      setLogoFile(null);
      flash('Company added!');
    } catch(e) { flashErr(e.response?.data?.message||'Failed to add company'); }
    finally { setSaving(false); }
  };

  const toggleUpcoming = async (co) => {
    try {
      const fd = new FormData();
      fd.append('isUpcoming', !co.isUpcoming);
      const r = await api.put(`/companies/${co._id}`, fd, { headers:{'Content-Type':'multipart/form-data'} });
      setCos(cs=>cs.map(c=>c._id===co._id?r.data.data:c));
      toast.success(r.data.data.isUpcoming?'Marked as upcoming!':'Removed from upcoming');
    } catch{ toast.error('Update failed'); }
  };

  const delCo = async (id) => {
    setDeleting(id);
    try { await api.delete(`/companies/${id}`); setCos(c=>c.filter(x=>x._id!==id)); if(selCo===id)setSelCo(null); toast.success('Deleted'); }
    catch(e){ toast.error(e.response?.data?.message||'Delete failed'); }
    finally { setDeleting(null); }
  };

  const addResource = async () => {
    if (!resForm.name.trim()) { toast.error('Resource name required'); return; }
    setResLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', resForm.name.trim());
      fd.append('type', resForm.type);
      fd.append('description', resForm.description);
      fd.append('url', resForm.url);
      if (resFile) fd.append('file', resFile);
      const r = await api.post(`/companies/${selCo}/resources`, fd, { headers:{'Content-Type':'multipart/form-data'}, timeout:90000 });
      setCos(cs=>cs.map(c=>c._id===selCo?r.data.data:c));
      setResForm({ name:'', type:'pdf', description:'', url:'' });
      setResFile(null);
      if(fileRef.current) fileRef.current.value='';
      toast.success('Resource added!');
    } catch(e){ toast.error(e.response?.data?.message||e.message||'Upload failed'); }
    finally { setResLoading(false); }
  };

  const delResource = async (coId, resId) => {
    setResDeleting(resId);
    try {
      const r = await api.delete(`/companies/${coId}/resources/${resId}`);
      setCos(cs=>cs.map(c=>c._id===coId?r.data.data:c));
      toast.success('Deleted');
    } catch(e){ toast.error(e.response?.data?.message||'Delete failed'); }
    finally { setResDeleting(null); }
  };

  const selCoData = cos.find(c=>c._id===selCo);
  if (loading) return <Panel title="Manage Companies"><div style={{padding:24,textAlign:'center',color:'#9ca3af'}}>Loading…</div></Panel>;

  return (
    <Panel title="Manage Companies" count={cos.length}>
      <Banner msg={msg}/><ErrBanner msg={err}/>
      <div style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:11,paddingBottom:8,borderBottom:'1px solid #f3f4f6'}}>Add New Company</div>
      <Row3>
        <Inp label="Company Name *" placeholder="e.g. Google"      value={form.name}  onChange={set('name')}/>
        <Inp label="Role & Visit"   placeholder="SDE-1 · Aug 2025" value={form.role}  onChange={set('role')}/>
        <Inp label="Emoji"          placeholder="🔍"                value={form.emoji} onChange={set('emoji')}/>
      </Row3>
      <Row3>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:5}}>Accent Color</label>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <input type="color" value={form.accentColor} onChange={set('accentColor')} style={{width:40,height:36,border:'1px solid #e5e7eb',borderRadius:7,cursor:'pointer',padding:2}}/>
            <input value={form.accentColor} onChange={set('accentColor')} style={{flex:1,padding:'8px 9px',border:'1px solid #e5e7eb',borderRadius:7,fontSize:12,outline:'none',color:'#1a1a2e'}}/>
          </div>
        </div>
        <Inp label="Visit Date" type="date" value={form.visitDate} onChange={set('visitDate')}/>
        <Inp label="Tags (comma-separated)" placeholder="DSA, System Design" value={form.tags} onChange={set('tags')}/>
      </Row3>

      {/* Upcoming toggle + announcement */}
      <div style={{background:'#f5f3ff',borderRadius:10,padding:13,marginBottom:13,border:'1px solid #ddd6fe'}}>
        <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:form.isUpcoming?10:0}}>
          <div onClick={()=>setForm(f=>({...f,isUpcoming:!f.isUpcoming}))}
            style={{width:44,height:24,borderRadius:12,background:form.isUpcoming?'#7c3aed':'#d1d5db',position:'relative',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
            <div style={{position:'absolute',top:2,left:form.isUpcoming?20:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'#374151'}}>📅 Mark as Upcoming Campus Visit</div>
            <div style={{fontSize:11,color:'#9ca3af'}}>Shows a highlighted card on student dashboard</div>
          </div>
        </label>
        {form.isUpcoming && (
          <Txt label="Announcement for students" placeholder="e.g. Amazon is visiting July 15! Focus on DSA + Leadership Principles. Online test first." value={form.announcement} onChange={e=>setForm(f=>({...f,announcement:e.target.value}))}/>
        )}
      </div>

      {/* Logo */}
      <div style={{marginBottom:13}}>
        <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:5}}>Company Logo (optional)</label>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {logoFile && <img src={URL.createObjectURL(logoFile)} alt="preview" style={{width:42,height:42,borderRadius:8,objectFit:'contain',border:'1px solid #ede9fe'}}/>}
          <label style={{flex:1,border:'1.5px dashed #ddd6fe',borderRadius:9,padding:'10px 14px',cursor:'pointer',background:'#faf5ff',fontSize:12,color:'#7c3aed',fontWeight:500,textAlign:'center'}}>
            {logoFile?`✅ ${logoFile.name}`:'📸 Upload company logo (PNG, JPG, SVG)'}
            <input type="file" accept="image/*" onChange={e=>setLogoFile(e.target.files[0])} style={{display:'none'}}/>
          </label>
        </div>
      </div>
      <BtnPrimary onClick={addCo} loading={saving}>+ Add Company</BtnPrimary>

      {cos.length>0 && (
        <AdminTable heads={['','Company','Role','Upcoming','Files','Actions']} rows={cos.map(co=>(
          <tr key={co._id} style={{background:selCo===co._id?'#faf5ff':'transparent'}}>
            <TD>{co.logoUrl?<img src={co.logoUrl} alt="" style={{width:28,height:28,borderRadius:6,objectFit:'contain'}}/>:<span style={{fontSize:18}}>{co.emoji}</span>}</TD>
            <TD><strong>{co.name}</strong>{co.visitDate&&<div style={{fontSize:10,color:'#9ca3af'}}>{new Date(co.visitDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>}</TD>
            <TD mw={110}>{co.role||'—'}</TD>
            <TD>
              <button onClick={()=>toggleUpcoming(co)}
                style={{padding:'3px 9px',borderRadius:6,fontSize:10,cursor:'pointer',border:'1px solid',fontWeight:600,transition:'all .12s',
                  borderColor:co.isUpcoming?'#10b981':'#e5e7eb',background:co.isUpcoming?'#d1fae5':'#fff',color:co.isUpcoming?'#065f46':'#9ca3af'}}>
                {co.isUpcoming?'✓ Live':'Set Live'}
              </button>
            </TD>
            <TD><span style={{background:'#ede9fe',color:'#7c3aed',padding:'2px 8px',borderRadius:6,fontSize:11,fontWeight:600}}>{co.resources?.length||0}</span></TD>
            <TD>
              <button onClick={()=>setSelCo(selCo===co._id?null:co._id)}
                style={{padding:'4px 9px',borderRadius:6,fontSize:11,cursor:'pointer',border:'1px solid #ddd6fe',background:selCo===co._id?'#7c3aed':'#faf5ff',color:selCo===co._id?'#fff':'#7c3aed',marginRight:5,fontWeight:600}}>
                {selCo===co._id?'▲ Close':'+ Resource'}
              </button>
              <DelBtn onClick={()=>delCo(co._id)} loading={deleting===co._id}/>
            </TD>
          </tr>
        ))}/>
      )}

      {/* Resource panel */}
      {selCo && selCoData && (
        <div style={{marginTop:18,borderTop:'2px solid #ede9fe',paddingTop:16,background:'#faf5ff',borderRadius:10,padding:16,marginTop:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:13,color:'#7c3aed'}}>📎 Add Resource to <strong>{selCoData.name}</strong></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7,marginBottom:13}}>
            {RES_TYPES.map(t=>(
              <button key={t} onClick={()=>setResForm(r=>({...r,type:t}))}
                style={{padding:'8px 5px',borderRadius:8,border:'1.5px solid',borderColor:resForm.type===t?'#7c3aed':'#e5e7eb',background:resForm.type===t?'#ede9fe':'#fff',color:resForm.type===t?'#7c3aed':'#6b7280',fontSize:10,fontWeight:resForm.type===t?700:500,cursor:'pointer',textAlign:'center',transition:'all .12s'}}>
                <div style={{fontSize:17,marginBottom:2}}>{RES_ICONS[t]}</div>{t}
              </button>
            ))}
          </div>
          <Row2>
            <Inp label="Resource Name *" placeholder="e.g. Interview Guide 2025" value={resForm.name} onChange={setR('name')}/>
            <Inp label="External URL (optional)" placeholder="https://drive.google.com/..." value={resForm.url} onChange={setR('url')}/>
          </Row2>
          <Txt label="Description" placeholder="What does this resource cover?" value={resForm.description} onChange={e=>setResForm(r=>({...r,description:e.target.value}))}/>
          <div style={{marginBottom:13}}>
            <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:5}}>
              Upload File <span style={{color:'#9ca3af',fontWeight:400}}>(PDF, Video, PPT, DOCX, ZIP, Image — max 100MB)</span>
            </label>
            <label style={{display:'block',border:'2px dashed #ddd6fe',borderRadius:10,padding:16,textAlign:'center',background:'#fff',cursor:'pointer',transition:'border-color .15s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='#7c3aed'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='#ddd6fe'}>
              <input ref={fileRef} type="file" onChange={e=>setResFile(e.target.files[0])} style={{display:'none'}}
                accept=".pdf,.mp4,.mov,.webm,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png,.gif,.svg"/>
              <div style={{fontSize:20,marginBottom:4}}>☁️</div>
              <div style={{fontSize:12,color:resFile?'#10b981':'#9ca3af',fontWeight:resFile?600:400}}>
                {resFile?`✅ ${resFile.name} (${(resFile.size/1024/1024).toFixed(1)} MB)`:'Click to upload any file format'}
              </div>
            </label>
          </div>
          <BtnPrimary onClick={addResource} loading={resLoading}>
            {resLoading?(resFile?'Uploading file… please wait':'Saving…'):'+ Add Resource'}
          </BtnPrimary>

          {selCoData.resources?.length>0 && (
            <div style={{marginTop:14}}>
              <div style={{fontSize:12,fontWeight:600,color:'#374151',marginBottom:8}}>Existing Resources ({selCoData.resources.length})</div>
              <AdminTable heads={['Type','Name','Open','Delete']} rows={selCoData.resources.map(r=>(
                <tr key={r._id}>
                  <TD><span style={{fontSize:16}}>{RES_ICONS[r.type]||'📁'}</span></TD>
                  <TD mw={210}><strong style={{fontSize:12}}>{r.name}</strong>{r.description&&<div style={{color:'#9ca3af',fontSize:10,marginTop:1}}>{r.description.slice(0,60)}</div>}</TD>
                  <TD>{(r.secureUrl||r.url)?<a href={r.secureUrl||r.url} target="_blank" rel="noopener noreferrer" style={{color:'#7c3aed',fontSize:11,fontWeight:600,padding:'3px 8px',border:'1px solid #ddd6fe',borderRadius:6,background:'#faf5ff',whiteSpace:'nowrap'}}>Open ↗</a>:'—'}</TD>
                  <TD><DelBtn onClick={()=>delResource(selCo,r._id)} loading={resDeleting===r._id}/></TD>
                </tr>
              ))}/>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ── DSA Admin ── */
function DSAAdmin() {
  const [topics,   setTopics]   = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ name:'', topic:'', difficulty:'easy', leetcodeUrl:'', description:'', companyTags:'' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const flash = m => { setMsg(m); setTimeout(()=>setMsg(''),3500); };

  useEffect(()=>{
    Promise.all([api.get('/dsa/topics'), api.get('/dsa/problems')])
      .then(([t,p])=>{ setTopics(t.data.data); setProblems(p.data.data); if(t.data.data[0]) setForm(f=>({...f,topic:t.data.data[0]._id})); })
      .finally(()=>setLoading(false));
  },[]);

  const add = async () => {
    if (!form.name.trim()) { toast.error('Problem name required'); return; }
    if (!form.topic) { toast.error('Select a topic'); return; }
    setSaving(true);
    try {
      const payload = { ...form, companyTags: form.companyTags.split(',').map(t=>t.trim()).filter(Boolean) };
      const r = await api.post('/dsa/problems', payload);
      setProblems(p=>[...p, r.data.data]);
      setForm(f=>({...f, name:'', leetcodeUrl:'', description:'', companyTags:''}));
      flash('Problem added!');
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try { await api.delete(`/dsa/problems/${id}`); setProblems(p=>p.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch(e){ toast.error(e.response?.data?.message||'Delete failed'); }
    finally { setDeleting(null); }
  };

  if (loading) return <Panel title="DSA Problems"><div style={{padding:24,textAlign:'center',color:'#9ca3af'}}>Loading…</div></Panel>;
  return (
    <Panel title="Add DSA Problem" count={problems.length}>
      <Banner msg={msg}/>
      <Row2>
        <Inp label="Problem Name *" placeholder="e.g. Two Sum" value={form.name} onChange={set('name')}/>
        <Inp label="LeetCode URL"   placeholder="https://leetcode.com/problems/..." value={form.leetcodeUrl} onChange={set('leetcodeUrl')}/>
      </Row2>
      <Row3>
        <Sel label="Topic *" value={form.topic} onChange={set('topic')}>{topics.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}</Sel>
        <Sel label="Difficulty *" value={form.difficulty} onChange={set('difficulty')}>
          <option value="easy">🟢 Easy</option><option value="medium">🟡 Medium</option><option value="hard">🔴 Hard</option>
        </Sel>
        <Inp label="Company Tags (comma-separated)" placeholder="Amazon, Google" value={form.companyTags} onChange={set('companyTags')}/>
      </Row3>
      <Txt label="Approach / Hint" placeholder="Key insight or algorithm…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
      <BtnPrimary onClick={add} loading={saving}>+ Add to Sheet</BtnPrimary>
      {problems.length>0 && (
        <AdminTable heads={['Problem','Topic','Diff','Tags','Link','Delete']} rows={problems.map(p=>(
          <tr key={p._id}>
            <TD mw={180}>{p.name}</TD>
            <TD mw={120}>{p.topic?.name||'—'}</TD>
            <TD><span style={{fontSize:10,padding:'2px 8px',borderRadius:5,fontWeight:600,background:p.difficulty==='easy'?'#d1fae5':p.difficulty==='hard'?'#fee2e2':'#fef3c7',color:p.difficulty==='easy'?'#065f46':p.difficulty==='hard'?'#991b1b':'#92400e'}}>{p.difficulty}</span></TD>
            <TD mw={120}>{(p.companyTags||[]).join(', ')||'—'}</TD>
            <TD>{p.leetcodeUrl?<a href={p.leetcodeUrl} target="_blank" rel="noopener noreferrer" style={{color:'#7c3aed',fontSize:12,fontWeight:600}}>↗</a>:'—'}</TD>
            <TD><DelBtn onClick={()=>del(p._id)} loading={deleting===p._id}/></TD>
          </tr>
        ))}/>
      )}
    </Panel>
  );
}

/* ── Subjects Admin ── */
function SubjectsAdmin() {
  const [subjects,  setSubjects]  = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [showSubjForm, setShowSubjForm] = useState(false);
  const [addingSubj,   setAddingSubj]   = useState(false);
  const [newSubj, setNewSubj] = useState({ name:'', icon:'📚', color:'#ede9fe' });
  const [msg, setMsg] = useState('');
  const flash = m => { setMsg(m); setTimeout(()=>setMsg(''),3500); };
  const [form, setForm] = useState({ subject:'', topicName:'', question:'', answer:'', type:'Short Answer', difficulty:'medium', options:'' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{
    Promise.all([api.get('/subjects'), api.get('/subjects/questions')])
      .then(([s,q])=>{ setSubjects(s.data.data); setQuestions(q.data.data); if(s.data.data[0]) setForm(f=>({...f,subject:s.data.data[0]._id})); })
      .finally(()=>setLoading(false));
  },[]);

  const addSubject = async () => {
    if (!newSubj.name.trim()) { toast.error('Subject name required'); return; }
    setAddingSubj(true);
    try {
      const r = await api.post('/subjects', newSubj);
      setSubjects(s=>[...s,r.data.data]);
      setNewSubj({ name:'', icon:'📚', color:'#ede9fe' });
      setShowSubjForm(false);
      toast.success('Subject added!');
    } catch(e){ toast.error(e.response?.data?.message||'Already exists or failed'); }
    finally { setAddingSubj(false); }
  };

  const add = async () => {
    if (!form.question.trim()||!form.answer.trim()) { toast.error('Question and answer required'); return; }
    if (!form.subject) { toast.error('Select a subject'); return; }
    setSaving(true);
    try {
      const payload = { ...form, options: form.type==='MCQ'?form.options.split(',').map(o=>o.trim()).filter(Boolean):[] };
      const r = await api.post('/subjects/questions', payload);
      setQuestions(q=>[...q,r.data.data]);
      setForm(f=>({...f,topicName:'',question:'',answer:'',options:''}));
      flash('Question added!');
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try { await api.delete(`/subjects/questions/${id}`); setQuestions(q=>q.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch(e){ toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  if (loading) return <Panel title="Core Subjects"><div style={{padding:24,textAlign:'center',color:'#9ca3af'}}>Loading…</div></Panel>;
  const QTYPES = ['Short Answer','MCQ','True/False','Long Answer','Fill in the Blank'];

  return (
    <Panel title="Core Subject Questions" count={questions.length}>
      <Banner msg={msg}/>
      <div style={{marginBottom:14,padding:11,background:'#f9fafb',borderRadius:9,border:'1px solid #f3f4f6'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:showSubjForm?10:0}}>
          <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>Subjects: {subjects.map(s=>s.name).join(' · ')||'None yet'}</span>
          <button onClick={()=>setShowSubjForm(!showSubjForm)} style={{fontSize:11,color:'#7c3aed',background:'#ede9fe',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontWeight:600}}>
            {showSubjForm?'✕ Cancel':'+ New Subject'}
          </button>
        </div>
        {showSubjForm && (
          <Row3>
            <Inp label="Subject Name *" placeholder="e.g. Compiler Design" value={newSubj.name} onChange={e=>setNewSubj(s=>({...s,name:e.target.value}))}/>
            <Inp label="Icon Emoji" placeholder="📖" value={newSubj.icon} onChange={e=>setNewSubj(s=>({...s,icon:e.target.value}))}/>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:5}}>Badge Color</label>
              <div style={{display:'flex',gap:6}}>
                <input type="color" value={newSubj.color} onChange={e=>setNewSubj(s=>({...s,color:e.target.value}))} style={{width:40,height:36,border:'1px solid #e5e7eb',borderRadius:7,cursor:'pointer'}}/>
                <button onClick={addSubject} disabled={addingSubj} style={{flex:1,padding:'9px 0',background:'#7c3aed',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  {addingSubj?'…':'Add'}
                </button>
              </div>
            </div>
          </Row3>
        )}
      </div>
      <Row2>
        <Sel label="Subject *" value={form.subject} onChange={set('subject')}>
          <option value="">Select Subject…</option>
          {subjects.map(s=><option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
        </Sel>
        <Inp label="Topic Name" placeholder="e.g. Process Scheduling" value={form.topicName} onChange={set('topicName')}/>
      </Row2>
      <Txt label="Question *" placeholder="Enter the question…" value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))}/>
      <RichEditor label="Answer / Explanation * (rich text — use toolbar to format, add images)" value={form.answer} onChange={e=>setForm(f=>({...f,answer:e.target.value}))}/>
      <Row3>
        <SelOrText label="Question Type" options={QTYPES} value={form.type} onChange={set('type')} placeholder="e.g. Diagram-based"/>
        <SelOrText label="Difficulty" options={['easy','medium','hard']} value={form.difficulty} onChange={set('difficulty')} placeholder="e.g. very hard"/>
        {(form.type==='MCQ'||form.type==='True/False') && <Inp label="Options (comma-separated)" placeholder="A, B, C, D" value={form.options} onChange={set('options')}/>}
      </Row3>
      <BtnPrimary onClick={add} loading={saving}>+ Add Question</BtnPrimary>
      {questions.length>0 && (
        <AdminTable heads={['Subject','Topic','Question','Type','Diff','Delete']} rows={questions.map(q=>(
          <tr key={q._id}>
            <TD mw={100}>{q.subject?.name||'—'}</TD>
            <TD mw={100}>{q.topicName||'—'}</TD>
            <TD mw={200}>{q.question}</TD>
            <TD><span style={{fontSize:10,padding:'2px 7px',borderRadius:5,background:'#ede9fe',color:'#7c3aed',fontWeight:500,whiteSpace:'nowrap'}}>{q.type}</span></TD>
            <TD><span style={{fontSize:10,padding:'2px 7px',borderRadius:5,fontWeight:600,background:q.difficulty==='easy'?'#d1fae5':q.difficulty==='hard'?'#fee2e2':'#fef3c7',color:q.difficulty==='easy'?'#065f46':q.difficulty==='hard'?'#991b1b':'#92400e'}}>{q.difficulty}</span></TD>
            <TD><DelBtn onClick={()=>del(q._id)} loading={deleting===q._id}/></TD>
          </tr>
        ))}/>
      )}
    </Panel>
  );
}

/* ── Aptitude Admin ── */
function AptitudeAdmin() {
  const [cats,      setCats]      = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [addingCat, setAddingCat] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name:'', icon:'🧠', color:'#ede9fe' });
  const [msg, setMsg] = useState('');
  const flash = m => { setMsg(m); setTimeout(()=>setMsg(''),3500); };
  const [form, setForm] = useState({ category:'', question:'', options:'', answer:'', explanation:'', difficulty:'medium' });
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(()=>{
    Promise.all([api.get('/aptitude/categories'), api.get('/aptitude/questions')])
      .then(([c,q])=>{
        setCats(c.data.data);
        setQuestions(q.data.data);
        if(c.data.data[0]) setForm(f=>({...f,category:c.data.data[0]._id}));
      })
      .finally(()=>setLoading(false));
  },[]);

  const addCat = async () => {
    if (!newCat.name.trim()) { toast.error('Category name required'); return; }
    setAddingCat(true);
    try {
      const r = await api.post('/aptitude/categories', newCat);
      const updated = [...cats, r.data.data];
      setCats(updated);
      setForm(f=>({...f, category: r.data.data._id})); // auto-select new cat
      setNewCat({ name:'', icon:'🧠', color:'#ede9fe' });
      setShowCatForm(false);
      toast.success('Category added and selected!');
    } catch(e){ toast.error(e.response?.data?.message||'Already exists or failed'); }
    finally { setAddingCat(false); }
  };

  const add = async () => {
    if (!form.question.trim()||!form.answer.trim()) { toast.error('Question and answer required'); return; }
    if (!form.category) { toast.error('Select a category'); return; }
    setSaving(true);
    try {
      const payload = { ...form, options: form.options.split(',').map(o=>o.trim()).filter(Boolean) };
      const r = await api.post('/aptitude/questions', payload);
      // r.data.data now has category populated (backend fix)
      setQuestions(q=>[...q, r.data.data]);
      setForm(f=>({...f, question:'', options:'', answer:'', explanation:''}));
      flash('Question added!');
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try { await api.delete(`/aptitude/questions/${id}`); setQuestions(q=>q.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch(e){ toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  if (loading) return <Panel title="Aptitude Questions"><div style={{padding:24,textAlign:'center',color:'#9ca3af'}}>Loading…</div></Panel>;

  return (
    <Panel title="Aptitude Questions" count={questions.length}>
      <Banner msg={msg}/>

      {/* Category manager */}
      <div style={{marginBottom:14,padding:11,background:'#f9fafb',borderRadius:9,border:'1px solid #f3f4f6'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:showCatForm?10:0}}>
          <span style={{fontSize:12,fontWeight:600,color:'#374151'}}>Categories: {cats.map(c=>`${c.icon} ${c.name}`).join(' · ')||'None yet'}</span>
          <button onClick={()=>setShowCatForm(!showCatForm)} style={{fontSize:11,color:'#7c3aed',background:'#ede9fe',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontWeight:600}}>
            {showCatForm?'✕ Cancel':'+ New Category'}
          </button>
        </div>
        {showCatForm && (
          <Row3>
            <Inp label="Category Name *" placeholder="e.g. Coding Aptitude" value={newCat.name} onChange={e=>setNewCat(c=>({...c,name:e.target.value}))}/>
            <Inp label="Icon Emoji" placeholder="🔢" value={newCat.icon} onChange={e=>setNewCat(c=>({...c,icon:e.target.value}))}/>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:5}}>Color</label>
              <div style={{display:'flex',gap:6}}>
                <input type="color" value={newCat.color} onChange={e=>setNewCat(c=>({...c,color:e.target.value}))} style={{width:40,height:36,border:'1px solid #e5e7eb',borderRadius:7,cursor:'pointer'}}/>
                <button onClick={addCat} disabled={addingCat} style={{flex:1,padding:'9px 0',background:'#7c3aed',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                  {addingCat?'…':'Add Category'}
                </button>
              </div>
            </div>
          </Row3>
        )}
      </div>

      <Row2>
        <Sel label="Category *" value={form.category} onChange={set('category')}>
          <option value="">Select Category…</option>
          {cats.map(c=><option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
        </Sel>
        <SelOrText label="Difficulty" options={['easy','medium','hard']} value={form.difficulty} onChange={set('difficulty')} placeholder="e.g. very hard"/>
      </Row2>
      <Txt label="Question *" placeholder="Enter aptitude question…" value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))}/>
      <Inp label="Options (comma-separated for MCQ)" placeholder="Option A, Option B, Option C, Option D" value={form.options} onChange={set('options')}/>
      <Row2>
        <Inp label="Correct Answer *" placeholder="Option A" value={form.answer} onChange={set('answer')}/>
        <Inp label="Explanation (optional)" placeholder="Because…" value={form.explanation} onChange={set('explanation')}/>
      </Row2>
      <BtnPrimary onClick={add} loading={saving}>+ Add Question</BtnPrimary>

      {questions.length>0 && (
        <AdminTable heads={['Category','Question','Difficulty','Delete']} rows={questions.map(q=>(
          <tr key={q._id}>
            {/* P1 fix: category now populated from backend */}
            <TD mw={130}>{q.category?.icon} {q.category?.name||<span style={{color:'#ef4444'}}>Category deleted</span>}</TD>
            <TD mw={280}>{q.question}</TD>
            <TD><span style={{fontSize:10,padding:'2px 8px',borderRadius:5,fontWeight:600,background:q.difficulty==='easy'?'#d1fae5':q.difficulty==='hard'?'#fee2e2':'#fef3c7',color:q.difficulty==='easy'?'#065f46':q.difficulty==='hard'?'#991b1b':'#92400e'}}>{q.difficulty}</span></TD>
            <TD><DelBtn onClick={()=>del(q._id)} loading={deleting===q._id}/></TD>
          </tr>
        ))}/>
      )}
    </Panel>
  );
}

/* ── Topics Admin ── */
function TopicsAdmin() {
  const [topics,   setTopics]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ name:'', description:'' });

  useEffect(()=>{ api.get('/dsa/topics').then(r=>setTopics(r.data.data)).finally(()=>setLoading(false)); },[]);

  const add = async () => {
    if (!form.name.trim()) { toast.error('Topic name required'); return; }
    setSaving(true);
    try {
      const r = await api.post('/dsa/topics', { name:form.name.trim(), description:form.description.trim(), order:topics.length });
      setTopics(t=>[...t,r.data.data]);
      setForm({ name:'', description:'' });
      toast.success('Topic added!');
    } catch(e){ toast.error(e.response?.data?.message||'Already exists or failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    setDeleting(id);
    try { await api.delete(`/dsa/topics/${id}`); setTopics(t=>t.filter(x=>x._id!==id)); toast.success('Deleted'); }
    catch(e){ toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  if (loading) return <Panel title="DSA Topics"><div style={{padding:24,textAlign:'center',color:'#9ca3af'}}>Loading…</div></Panel>;
  return (
    <Panel title="DSA Patterns & Topics" count={topics.length}>
      <Row2>
        <Inp label="Topic / Pattern Name *" placeholder="e.g. Sliding Window" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
        <Inp label="Description (optional)" placeholder="When to use this pattern…" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
      </Row2>
      <BtnPrimary onClick={add} loading={saving}>+ Add Topic</BtnPrimary>
      <div style={{marginTop:16,display:'flex',flexWrap:'wrap',gap:8}}>
        {topics.map(t=>(
          <span key={t._id} style={{background:'#ede9fe',color:'#7c3aed',padding:'7px 13px',borderRadius:20,fontSize:12,fontWeight:500,display:'inline-flex',alignItems:'center',gap:7,border:'1px solid #ddd6fe'}}>
            {t.name}
            <span onClick={()=>del(t._id)} style={{cursor:deleting===t._id?'wait':'pointer',opacity:.7,fontSize:13,fontWeight:700,color:'#991b1b'}}>
              {deleting===t._id?'…':'×'}
            </span>
          </span>
        ))}
      </div>
    </Panel>
  );
}
