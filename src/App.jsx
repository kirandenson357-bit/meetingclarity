import { useState, useEffect, useRef, useCallback } from "react";

const SAMPLE_NOTES = `Q1 Strategy Sync - March 22, 2026

Attendees: Sarah Chen (Head of Product), James Okafor (Engineering Lead), Mia Santos (Design), Tom Brennan (Marketing Director)

Sarah opened by reviewing Q1 OKRs. We are at 68% completion with 6 weeks remaining. The mobile app launch is the critical path item.

James confirmed the backend API has 3 remaining bugs: authentication timeout, data sync edge case, and push notification delay. He estimates Friday EOD for all three. Mia's designs are fully handed off.

Tom raised the concern that he needs a confirmed launch date to book paid media slots, requesting at minimum 2 weeks notice. Sarah proposed April 14 as the soft target.

The customer feedback survey was approved. Sarah will draft and send it Monday. Tom will amplify via email newsletter (42k subscribers). Target: 500 responses in 2 weeks.

Mia flagged the staging environment has been down since Tuesday, blocking QA. James will fix it today before EOD.

Budget: Sarah will schedule a dedicated finance review with CFO next week. Estimated 45-minute session.

Everyone to update OKR tracking in Notion before Friday standup.`;

function makeTheme(dark) {
  if (dark) return {
    bg:"#1c1c1e",bgAlt:"#2c2c2e",surface:"#2c2c2e",surfaceHigh:"#3a3a3c",
    sidebar:"rgba(28,28,30,0.96)",border:"rgba(255,255,255,0.08)",borderStrong:"rgba(255,255,255,0.14)",
    ink:"#f5f5f7",ink2:"#d1d1d6",ink3:"#8e8e93",ink4:"#636366",
    blue:"#0a84ff",blueHover:"#1a8fff",blueLight:"rgba(10,132,255,0.15)",
    green:"#30d158",greenLight:"rgba(48,209,88,0.15)",greenText:"#30d158",
    orange:"#ff9f0a",orangeLight:"rgba(255,159,10,0.15)",orangeText:"#ff9f0a",
    red:"#ff453a",redLight:"rgba(255,69,58,0.15)",
    shadow:"0 2px 8px rgba(0,0,0,0.4)",shadowLg:"0 4px 24px rgba(0,0,0,0.5)",inputBg:"rgba(255,255,255,0.06)",
  };
  return {
    bg:"#f5f5f7",bgAlt:"#ebebed",surface:"#ffffff",surfaceHigh:"#f5f5f7",
    sidebar:"rgba(248,248,250,0.95)",border:"rgba(0,0,0,0.08)",borderStrong:"rgba(0,0,0,0.14)",
    ink:"#1d1d1f",ink2:"#424245",ink3:"#6e6e73",ink4:"#98989d",
    blue:"#0071e3",blueHover:"#0077ed",blueLight:"rgba(0,113,227,0.08)",
    green:"#34c759",greenLight:"rgba(52,199,89,0.1)",greenText:"#248a3d",
    orange:"#ff9f0a",orangeLight:"rgba(255,159,10,0.1)",orangeText:"#b25000",
    red:"#ff3b30",redLight:"rgba(255,59,48,0.08)",
    shadow:"0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.06)",
    shadowLg:"0 2px 8px rgba(0,0,0,0.06),0 8px 32px rgba(0,0,0,0.1)",inputBg:"rgba(0,0,0,0.03)",
  };
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{-webkit-font-smoothing:antialiased}
  body{font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-thumb{background:rgba(128,128,128,0.2);border-radius:4px}
  textarea,input,button{font-family:inherit}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulseRec{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  .fu{animation:fadeUp .36s cubic-bezier(.16,1,.3,1) both}
  .fu2{animation:fadeUp .36s .08s cubic-bezier(.16,1,.3,1) both}
  .fu3{animation:fadeUp .36s .13s cubic-bezier(.16,1,.3,1) both}
  .chk{transition:all .18s cubic-bezier(.34,1.56,.64,1)}
`;

function Icon({ name, size=16, color="currentColor" }) {
  const p = { stroke:color, strokeWidth:"1.6", strokeLinecap:"round", strokeLinejoin:"round", fill:"none" };
  const icons = {
    home:    <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M3 8L10 2l7 6v9a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"/><path {...p} d="M7 18v-6h6v6"/></svg>,
    plus:    <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M10 4v12M4 10h12"/></svg>,
    check:   <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M4 10l5 5 7-8"/></svg>,
    list:    <svg width={size} height={size} viewBox="0 0 20 20"><circle cx="4" cy="6" r="1.2" fill={color}/><path {...p} d="M8 6h8"/><circle cx="4" cy="10" r="1.2" fill={color}/><path {...p} d="M8 10h8"/><circle cx="4" cy="14" r="1.2" fill={color}/><path {...p} d="M8 14h8"/></svg>,
    clock:   <svg width={size} height={size} viewBox="0 0 20 20"><circle {...p} cx="10" cy="10" r="7"/><path {...p} d="M10 6.5V10l2.5 2"/></svg>,
    mic:     <svg width={size} height={size} viewBox="0 0 20 20"><rect {...p} x="7" y="2" width="6" height="10" rx="3"/><path {...p} d="M4 10a6 6 0 0012 0M10 16v2"/></svg>,
    mail:    <svg width={size} height={size} viewBox="0 0 20 20"><rect {...p} x="2" y="5" width="16" height="12" rx="2"/><path {...p} d="M2 7l8 5 8-5"/></svg>,
    copy:    <svg width={size} height={size} viewBox="0 0 20 20"><rect {...p} x="7" y="7" width="10" height="11" rx="2"/><path {...p} d="M4 13V4a1 1 0 011-1h9"/></svg>,
    trash:   <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M3 6h14M8 6V4h4v2M6 6l1 11h6l1-11"/></svg>,
    arrow:   <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M4 10h12M12 6l4 4-4 4"/></svg>,
    chevR:   <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M8 6l4 4-4 4"/></svg>,
    spark:   <svg width={size} height={size} viewBox="0 0 20 20"><path d="M10 2l1.8 5.5H17l-4.4 3.2 1.7 5.3L10 13l-4.3 3 1.7-5.3L3 7.5h5.2L10 2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" fill="none"/></svg>,
    search:  <svg width={size} height={size} viewBox="0 0 20 20"><circle {...p} cx="8.5" cy="8.5" r="5"/><path {...p} d="M13 13l4 4"/></svg>,
    moon:    <svg width={size} height={size} viewBox="0 0 20 20"><path d="M17 12.5A7 7 0 117.5 3a5.5 5.5 0 009.5 9.5z" stroke={color} strokeWidth="1.6" fill="none"/></svg>,
    sun:     <svg width={size} height={size} viewBox="0 0 20 20"><circle {...p} cx="10" cy="10" r="3"/><path {...p} d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"/></svg>,
    print:   <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M5 7V3h10v4M5 15H3a1 1 0 01-1-1V9a1 1 0 011-1h14a1 1 0 011 1v5a1 1 0 01-1 1h-2"/><rect {...p} x="5" y="12" width="10" height="6"/></svg>,
    close:   <svg width={size} height={size} viewBox="0 0 20 20"><path {...p} d="M5 5l10 10M15 5L5 15"/></svg>,
    team:    <svg width={size} height={size} viewBox="0 0 20 20"><circle {...p} cx="8" cy="7" r="3"/><path {...p} d="M2 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle {...p} cx="15" cy="7" r="2"/><path {...p} d="M15 13c1.7.5 3 2 3 4"/></svg>,
    person:  <svg width={size} height={size} viewBox="0 0 20 20"><circle {...p} cx="10" cy="7" r="3"/><path {...p} d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>,
  };
  return icons[name] || null;
}

function Spinner({ size=18, color="#0071e3" }) {
  return <div style={{ width:size, height:size, border:"2px solid rgba(128,128,128,0.2)", borderTop:`2px solid ${color}`, borderRadius:"50%", animation:"spin .7s linear infinite", flexShrink:0 }} />;
}

function Badge({ children, color="gray", T }) {
  const s = { gray:{bg:T.surfaceHigh,color:T.ink3}, blue:{bg:T.blueLight,color:T.blue}, green:{bg:T.greenLight,color:T.greenText}, orange:{bg:T.orangeLight,color:T.orangeText}, red:{bg:T.redLight,color:T.red} }[color] || {bg:T.surfaceHigh,color:T.ink3};
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:980, fontSize:11, fontWeight:500, background:s.bg, color:s.color, whiteSpace:"nowrap" }}>{children}</span>;
}

// ── PRINT MODAL (sandbox-safe PDF via browser print) ──────────────────────────
function PrintModal({ meeting, onClose, T }) {
  const frameRef = useRef(null);

  const doPrint = useCallback(() => {
    const fr = frameRef.current;
    if (!fr) return;
    try {
      fr.contentWindow.focus();
      fr.contentWindow.print();
    } catch(e) {
      // Fallback: inject into page and print
      const prevTitle = document.title;
      document.title = meeting.title || "Meeting Summary";
      const overlay = document.createElement("div");
      overlay.id = "__mc_print__";
      overlay.style.cssText = "position:fixed;inset:0;background:white;z-index:99999;padding:40px;font-family:sans-serif;";
      overlay.innerHTML = fr.contentDocument?.body?.innerHTML || "";
      document.body.appendChild(overlay);
      // Hide everything else
      const styleEl = document.createElement("style");
      styleEl.id = "__mc_print_style__";
      styleEl.innerHTML = "@media print { body > *:not(#__mc_print__) { display:none!important } }";
      document.head.appendChild(styleEl);
      window.print();
      document.body.removeChild(overlay);
      document.head.removeChild(styleEl);
      document.title = prevTitle;
    }
  }, [meeting.title]);

  const dateStr = meeting.createdAt
    ? new Date(meeting.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})
    : new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${meeting.title||"Meeting Summary"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0} body{font-family:'DM Sans',sans-serif;background:#fff;color:#1d1d1f;padding:40px 48px;font-size:13px;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .hdr{background:#0071e3;color:#fff;padding:14px 18px;border-radius:10px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:center}
  .hdr h2{font-size:15px;font-weight:700} .hdr span{font-size:11px;opacity:.8}
  h1{font-size:22px;font-weight:700;letter-spacing:-.5px;margin-bottom:8px}
  .sum{font-size:13px;color:#424245;line-height:1.75;margin-bottom:10px}
  .pills{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px}
  .pill{background:#f5f5f7;color:#6e6e73;font-size:11px;padding:3px 9px;border-radius:980px}
  hr{border:none;border-top:1px solid #e5e5ea;margin:14px 0}
  .sec-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6e6e73;margin-bottom:9px;display:flex;align-items:center;gap:5px}
  .dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
  .item{display:flex;gap:8px;margin-bottom:7px;font-size:13px;color:#424245;align-items:flex-start}
  .arow{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f0f0f2;gap:10px}
  .atask{font-size:13px;color:#1d1d1f;flex:1}
  .tags{display:flex;gap:4px;flex-shrink:0}
  .tn{background:#f5f5f7;color:#6e6e73;font-size:10px;font-weight:600;padding:2px 7px;border-radius:980px}
  .to{background:rgba(255,159,10,.1);color:#b25000;font-size:10px;font-weight:600;padding:2px 7px;border-radius:980px}
  .tg{background:rgba(52,199,89,.1);color:#248a3d;font-size:10px;font-weight:600;padding:2px 7px;border-radius:980px}
  .ftr{margin-top:28px;padding-top:12px;border-top:1px solid #e5e5ea;display:flex;justify-content:space-between;color:#98989d;font-size:10px}
  @media print{@page{margin:18mm}}
</style></head><body>
<div class="hdr"><h2>MeetingClarity</h2><span>${dateStr}</span></div>
<h1>${meeting.title||"Untitled Meeting"}</h1>
<p class="sum">${meeting.summary||""}</p>
${(meeting.attendees||[]).length?`<div class="pills">${(meeting.attendees||[]).map(a=>`<span class="pill">${a}</span>`).join("")}</div>`:""}
<hr/>
${(meeting.decisions||[]).length?`<div class="sec-lbl"><div class="dot" style="background:#34c759"></div>Decisions Made</div>${(meeting.decisions||[]).map(d=>`<div class="item"><span style="color:#34c759;font-size:10px;margin-top:2px">&#x25CF;</span><span>${d}</span></div>`).join("")}<hr/>`:""}
${(meeting.action_items||[]).length?`<div class="sec-lbl"><div class="dot" style="background:#0071e3"></div>Action Items</div>${(meeting.action_items||[]).map(a=>`<div class="arow"><span class="atask">${a.done?`<s style="opacity:.5">`:""}${a.task}${a.done?"</s>":""}</span><div class="tags"><span class="tn">${a.owner||"Team"}</span><span class="${a.done?"tg":"to"}">${a.done?"Done":(a.due||"TBD")}</span></div></div>`).join("")}<hr/>`:""}
${(meeting.follow_ups||[]).length?`<div class="sec-lbl"><div class="dot" style="background:#ff9f0a"></div>Follow-ups Needed</div>${(meeting.follow_ups||[]).map(f=>`<div class="item"><span style="color:#ff9f0a">&#x2192;</span><span>${f}</span></div>`).join("")}`:""}
<div class="ftr"><span>Generated by MeetingClarity</span><span>${new Date().toLocaleString()}</span></div>
</body></html>`;

  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .18s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:640,height:560,background:T.surface,borderRadius:18,boxShadow:"0 24px 80px rgba(0,0,0,0.3)",overflow:"hidden",border:`1px solid ${T.border}`,display:"flex",flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"16px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:T.ink,letterSpacing:-0.3 }}>Print / Save as PDF</div>
            <div style={{ fontSize:12,color:T.ink3,marginTop:2 }}>Click "Print" then choose "Save as PDF" in your browser</div>
          </div>
          <button onClick={onClose} style={{ width:30,height:30,borderRadius:"50%",background:T.surfaceHigh,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <Icon name="close" size={14} color={T.ink3} />
          </button>
        </div>
        {/* iframe preview */}
        <iframe ref={frameRef} srcDoc={html} style={{ flex:1,border:"none",background:"#fff" }} title="Print Preview" />
        {/* Footer */}
        <div style={{ padding:"14px 22px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,justifyContent:"flex-end",flexShrink:0 }}>
          <button onClick={onClose} style={{ padding:"9px 18px",borderRadius:980,background:T.surfaceHigh,border:"none",color:T.ink,fontSize:13,fontWeight:500,cursor:"pointer" }}>Cancel</button>
          <button onClick={doPrint} style={{ padding:"9px 20px",borderRadius:980,background:T.blue,border:"none",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            <Icon name="print" size={13} color="#fff" /> Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SEARCH MODAL ──────────────────────────────────────────────────────────────
function SearchModal({ meetings, onClose, onView, T }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { const t = setTimeout(()=>inputRef.current?.focus(),60); return ()=>clearTimeout(t); }, []);
  useEffect(() => { const h=e=>{if(e.key==="Escape")onClose()}; window.addEventListener("keydown",h); return ()=>window.removeEventListener("keydown",h); }, [onClose]);
  const results = q.trim().length<1 ? [] : meetings.filter(m=>{
    const hay=[m.title,m.summary,...(m.decisions||[]),...(m.follow_ups||[]),...(m.attendees||[]),...(m.action_items||[]).map(a=>a.task)].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  return (
    <div onClick={onClose} style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:80,animation:"fadeIn .18s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:580,background:T.surface,borderRadius:18,boxShadow:"0 24px 80px rgba(0,0,0,0.28)",overflow:"hidden",border:`1px solid ${T.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:`1px solid ${T.border}` }}>
          <Icon name="search" size={18} color={T.ink3}/>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search meetings, decisions, actions…" style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:16,color:T.ink }}/>
          {q && <button onClick={()=>setQ("")} style={{ background:T.surfaceHigh,border:"none",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><Icon name="close" size={11} color={T.ink3}/></button>}
          <span style={{ fontSize:10,color:T.ink4,background:T.surfaceHigh,padding:"3px 7px",borderRadius:5 }}>esc</span>
        </div>
        <div style={{ maxHeight:380,overflowY:"auto" }}>
          {!q && <div style={{ padding:"28px 20px",textAlign:"center",color:T.ink4,fontSize:13 }}>Start typing to search all meetings</div>}
          {q&&results.length===0 && <div style={{ padding:"28px 20px",textAlign:"center",color:T.ink3,fontSize:14 }}>No results for "{q}"</div>}
          {results.map((m,i)=>(
            <div key={m.id} onClick={()=>{onView(m);onClose();}} style={{ padding:"14px 20px",cursor:"pointer",borderBottom:i<results.length-1?`1px solid ${T.border}`:"none",transition:"background .12s" }}
              onMouseOver={e=>e.currentTarget.style.background=T.blueLight} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:34,height:34,borderRadius:9,background:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="clock" size={14} color={T.blue}/></div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:600,color:T.ink,marginBottom:2 }}>{m.title}</div>
                  <div style={{ fontSize:12,color:T.ink3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.summary}</div>
                </div>
                <Badge color="gray" T={T}>{new Date(m.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ meetings, onNew, onView, onGoActions, T }) {
  const allActions = meetings.flatMap(m=>(m.action_items||[]).map(a=>({...a,meetingTitle:m.title})));
  const pending = allActions.filter(a=>!a.done);
  const done    = allActions.filter(a=>a.done);
  const recent  = [...meetings].sort((a,b)=>b.createdAt-a.createdAt).slice(0,4);
  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28 }}>
        {[{label:"Total Meetings",value:meetings.length,sub:"all time",color:T.ink,d:"0s"},{label:"Pending Actions",value:pending.length,sub:"need attention",color:pending.length>0?T.orange:T.green,d:".05s"},{label:"Completed",value:done.length,sub:"actions done",color:T.greenText,d:".1s"}].map(({label,value,sub,color,d})=>(
          <div key={label} style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"22px 24px",animation:`fadeUp .36s ${d} cubic-bezier(.16,1,.3,1) both` }}>
            <div style={{ fontSize:12,fontWeight:500,color:T.ink3,marginBottom:10 }}>{label}</div>
            <div style={{ fontSize:36,fontWeight:700,color,letterSpacing:-1.5,lineHeight:1,marginBottom:4 }}>{value}</div>
            <div style={{ fontSize:12,color:T.ink4 }}>{sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:18 }}>
        <div className="fu2">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <span style={{ fontSize:15,fontWeight:600,color:T.ink,letterSpacing:-0.3 }}>Recent Meetings</span>
            <button onClick={onNew} style={{ background:"none",border:"none",color:T.blue,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}><Icon name="plus" size={13} color={T.blue}/> New</button>
          </div>
          {recent.length===0 ? (
            <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:40,textAlign:"center" }}>
              <div style={{ width:48,height:48,borderRadius:"50%",background:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}><Icon name="spark" size={22} color={T.blue}/></div>
              <div style={{ fontSize:14,fontWeight:600,color:T.ink,marginBottom:6 }}>No meetings yet</div>
              <div style={{ fontSize:13,color:T.ink3,marginBottom:18 }}>Analyze your first meeting to get started</div>
              <button onClick={onNew} style={{ background:T.blue,color:"#fff",border:"none",borderRadius:980,padding:"10px 20px",fontSize:14,fontWeight:500,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6 }}><Icon name="plus" size={13} color="#fff"/> New Meeting</button>
            </div>
          ) : recent.map((m,i)=>(
            <div key={m.id} onClick={()=>onView(m)} style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"16px 18px",marginBottom:10,cursor:"pointer",animation:`fadeUp .36s ${.1+i*.05}s cubic-bezier(.16,1,.3,1) both`,transition:"box-shadow .2s,transform .2s" }}
              onMouseOver={e=>{e.currentTarget.style.boxShadow=T.shadowLg;e.currentTarget.style.transform="translateY(-1px)"}}
              onMouseOut={e=>{e.currentTarget.style.boxShadow=T.shadow;e.currentTarget.style.transform="none"}}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:600,color:T.ink,marginBottom:5,letterSpacing:-0.2 }}>{m.title}</div>
                  <div style={{ fontSize:12,color:T.ink3,lineHeight:1.55,marginBottom:8,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{m.summary}</div>
                  <div style={{ display:"flex",gap:5,flexWrap:"wrap",alignItems:"center" }}>
                    <span style={{ fontSize:11,color:T.ink4 }}>{new Date(m.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                    <span style={{ color:T.border }}>·</span>
                    <Badge color={(m.action_items||[]).filter(a=>!a.done).length>0?"orange":"green"} T={T}>{(m.action_items||[]).filter(a=>!a.done).length} pending</Badge>
                  </div>
                </div>
                <Icon name="chevR" size={16} color={T.ink4}/>
              </div>
            </div>
          ))}
        </div>
        <div className="fu3">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <span style={{ fontSize:15,fontWeight:600,color:T.ink,letterSpacing:-0.3 }}>Up Next</span>
            {pending.length>0 && <button onClick={onGoActions} style={{ background:"none",border:"none",color:T.blue,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}>See all <Icon name="arrow" size={12} color={T.blue}/></button>}
          </div>
          {pending.length===0 ? (
            <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:32,textAlign:"center" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>✅</div>
              <div style={{ fontSize:14,fontWeight:500,color:T.ink,marginBottom:4 }}>All caught up!</div>
              <div style={{ fontSize:12,color:T.ink3 }}>No pending actions</div>
            </div>
          ) : pending.slice(0,5).map((a,i)=>(
            <div key={i} style={{ background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"12px 16px",marginBottom:8,animation:`fadeUp .36s ${.15+i*.04}s cubic-bezier(.16,1,.3,1) both` }}>
              <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:T.orange,flexShrink:0,marginTop:5 }}/>
                <div>
                  <div style={{ fontSize:13,color:T.ink,lineHeight:1.5,marginBottom:5 }}>{a.task}</div>
                  <div style={{ display:"flex",gap:5 }}><Badge color="gray" T={T}>{a.owner||"Team"}</Badge><Badge color="orange" T={T}>{a.due||"TBD"}</Badge></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── NEW MEETING ───────────────────────────────────────────────────────────────
function NewMeeting({ onResult, T }) {
  const [notes,setNotes]       = useState("");
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState(null);
  const [recording,setRecording] = useState(false);
  const recRef = useRef(null);

  useEffect(()=>{ return ()=>{ try{recRef.current?.stop()}catch(_){} }; },[]);

  const startRec = () => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Voice recording requires Chrome or Edge.");return;}
    try {
      const r=new SR(); r.continuous=true; r.interimResults=true; r.lang="en-US";
      let fin="";
      r.onresult=e=>{let int="";for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)fin+=e.results[i][0].transcript+" ";else int+=e.results[i][0].transcript;}setNotes(fin+int);};
      r.onerror=()=>{recRef.current=null;setRecording(false);};
      r.onend=()=>{recRef.current=null;setRecording(false);};
      r.start(); recRef.current=r; setRecording(true);
    } catch(e){ alert("Could not start recording."); }
  };
  const stopRec = () => { try{recRef.current?.stop()}catch(_){} recRef.current=null; setRecording(false); };

  const analyze = async () => {
    if(!notes.trim())return;
    setLoading(true); setError(null);
    try {
      const prompt = `Analyze these meeting notes. Respond ONLY with a raw JSON object, no markdown fences, no extra text.\n{"title":"max 6 words","summary":"2-3 sentence exec summary","decisions":["..."],"action_items":[{"task":"...","owner":"name or Team","due":"date or ASAP or TBD","done":false}],"follow_ups":["..."],"attendees":["First Last"]}\n\nNotes:\n${notes}`;
      const res = await fetch("/api/chat",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ prompt })
      });
      const data = await res.json();
      const raw = data?.text||"";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      onResult({...parsed,rawNotes:notes});
    } catch(e){ setError("Analysis failed — please try again."); }
    finally { setLoading(false); }
  };

  const wc = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="fu">
      <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" }}>
        <button onClick={recording?stopRec:startRec} style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:980,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,transition:"all .15s",background:recording?T.red:T.surfaceHigh,color:recording?"#fff":T.ink }}>
          {recording?<><span style={{ width:8,height:8,borderRadius:"50%",background:"#fff",animation:"pulseRec 1s ease infinite",display:"inline-block" }}/> Stop Recording</>:<><Icon name="mic" size={14} color={T.ink}/> Record</>}
        </button>
        <button onClick={()=>setNotes(SAMPLE_NOTES)} style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:980,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:T.surfaceHigh,color:T.ink }}>Load Sample</button>
        {notes && <button onClick={()=>{setNotes("");setError(null);}} style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:980,border:"none",cursor:"pointer",fontSize:14,fontWeight:500,background:T.redLight,color:T.red }}><Icon name="close" size={13} color={T.red}/> Clear</button>}
      </div>
      {recording && <div style={{ background:T.redLight,border:`1px solid ${T.red}40`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:T.red,display:"flex",alignItems:"center",gap:8 }}><span style={{ width:7,height:7,borderRadius:"50%",background:T.red,animation:"pulseRec 1s ease infinite",display:"inline-block",flexShrink:0 }}/>Listening — speak clearly, then click Stop Recording.</div>}
      <label style={{ fontSize:12,fontWeight:500,color:T.ink3,display:"block",marginBottom:6 }}>Meeting Notes</label>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Paste raw notes — attendees, what was decided, who owns what. Messy is fine."
        style={{ width:"100%",minHeight:260,resize:"vertical",background:T.inputBg,border:`1.5px solid ${T.border}`,borderRadius:12,padding:"14px 16px",fontSize:14,color:T.ink,outline:"none",lineHeight:1.8,transition:"border-color .2s",display:"block" }}
        onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>
      <div style={{ fontSize:12,color:T.ink4,marginTop:6,marginBottom:20 }}>{wc>0?`${wc} words`:"Start typing or paste your meeting notes"}</div>
      <button onClick={analyze} disabled={loading||!notes.trim()} style={{ width:"100%",padding:"14px",borderRadius:12,border:"none",background:notes.trim()&&!loading?T.blue:T.surfaceHigh,color:notes.trim()&&!loading?"#fff":T.ink4,fontSize:15,fontWeight:500,cursor:notes.trim()&&!loading?"pointer":"not-allowed",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
        {loading?<><Spinner size={16} color="#fff"/> Analyzing meeting…</>:<><Icon name="spark" size={15} color={notes.trim()?"#fff":T.ink4}/> Analyze & Extract</>}
      </button>
      {error && <div style={{ marginTop:12,background:T.redLight,border:`1px solid ${T.red}30`,borderRadius:10,padding:"11px 14px",fontSize:13,color:T.red }}>{error}</div>}
    </div>
  );
}

// ── MEETING RESULT ────────────────────────────────────────────────────────────
function MeetingResult({ meeting, onSave, saved, onActionToggle, team, T }) {
  const [actions,setActions]         = useState([]);
  const [copied,setCopied]           = useState(false);
  const [emailInput,setEmailInput]   = useState("");
  const [selected,setSelected]       = useState([]);   // selected member ids
  const [showPrint,setShowPrint]     = useState(false);
  const meetingKey = meeting.id||meeting.title||"";

  // FIX 1: Re-sync actions when switching between meetings
  useEffect(()=>{
    setActions((meeting.action_items||[]).map(a=>({...a})));
    setCopied(false);
    setEmailInput("");
    setSelected([]);
  },[meetingKey]);

  const toggle = useCallback((i)=>{
    setActions(prev=>{
      const updated = prev.map((a,idx)=>idx===i?{...a,done:!a.done}:a);
      // FIX 2: Persist immediately for already-saved meetings
      if(saved && onActionToggle) onActionToggle(updated);
      return updated;
    });
  },[saved,onActionToggle]);

  const emailText = [
    `Meeting Summary - ${meeting.title}`,"",meeting.summary,"","DECISIONS",
    ...(meeting.decisions||[]).map(d=>`- ${d}`),"","ACTION ITEMS",
    ...actions.map(a=>`- ${a.task} [${a.owner||"Team"}] (${a.done?"Done":(a.due||"TBD")})`),
    ...((meeting.follow_ups||[]).length?["\nFOLLOW-UPS",...(meeting.follow_ups||[]).map(f=>`- ${f}`)]:[ ]),
  ].join("\n");

  // Derive final recipient list: selected team members + any manual emails
  const selectedEmails = team.filter(m=>selected.includes(m.id)).map(m=>m.email);
  const manualEmails   = emailInput.trim() ? emailInput.split(",").map(e=>e.trim()).filter(Boolean) : [];
  const allEmails      = [...new Set([...selectedEmails, ...manualEmails])];

  const copyEmail = ()=>{ navigator.clipboard.writeText(emailText).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };
  const openMail  = ()=>{
    const to = allEmails.join(",");
    window.location.href=`mailto:${to}?subject=${encodeURIComponent("Meeting Summary - "+meeting.title)}&body=${encodeURIComponent(emailText)}`;
  };

  const toggleMember = id => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev,id]);
  const selectAll    = () => setSelected(team.map(m=>m.id));
  const clearAll     = () => setSelected([]);

  const avatarColor = (m) => { const cols=[T.blue,T.green,T.orange,T.red]; return cols[(m.level??2)%cols.length]; };
  const initials    = name => name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);

  const SectionCard = ({label,dot,items,icon,iconBg,iconColor})=>(
    <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"20px 22px" }}>
      <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:16 }}>
        <div style={{ width:7,height:7,borderRadius:"50%",background:dot }}/>
        <span style={{ fontSize:11,fontWeight:600,color:T.ink3,letterSpacing:0.3,textTransform:"uppercase" }}>{label}</span>
      </div>
      {items.length===0?<p style={{ fontSize:13,color:T.ink4,fontStyle:"italic" }}>None recorded</p>
        :items.map((d,i)=>(
          <div key={i} style={{ display:"flex",gap:10,marginBottom:10,alignItems:"flex-start" }}>
            <div style={{ width:18,height:18,borderRadius:"50%",background:iconBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}><Icon name={icon} size={10} color={iconColor}/></div>
            <span style={{ fontSize:13,color:T.ink2,lineHeight:1.6 }}>{d}</span>
          </div>
        ))}
    </div>
  );

  return (
    <div className="fu">
      {showPrint && <PrintModal meeting={{...meeting,action_items:actions}} onClose={()=>setShowPrint(false)} T={T}/>}

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${T.surface},${T.surfaceHigh})`,borderRadius:16,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"28px 32px",marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"flex-start",gap:16 }}>
          <div style={{ width:46,height:46,borderRadius:13,background:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="spark" size={20} color={T.blue}/></div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontSize:11,fontWeight:600,color:T.blue,letterSpacing:0.6,textTransform:"uppercase",marginBottom:5 }}>Meeting Summary</div>
            <h2 style={{ fontSize:22,fontWeight:700,color:T.ink,letterSpacing:-0.6,marginBottom:10,lineHeight:1.2 }}>{meeting.title}</h2>
            <p style={{ fontSize:14,color:T.ink2,lineHeight:1.75 }}>{meeting.summary}</p>
            {(meeting.attendees||[]).length>0&&<div style={{ marginTop:14,display:"flex",gap:6,flexWrap:"wrap" }}>{meeting.attendees.map((a,i)=><Badge key={i} color="gray" T={T}>{a}</Badge>)}</div>}
          </div>
          <button onClick={()=>setShowPrint(true)} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:980,background:T.surfaceHigh,border:`1px solid ${T.border}`,color:T.ink2,fontSize:13,fontWeight:500,cursor:"pointer",flexShrink:0,transition:"all .15s",whiteSpace:"nowrap" }}
            onMouseOver={e=>{e.currentTarget.style.background=T.blueLight;e.currentTarget.style.color=T.blue;e.currentTarget.style.borderColor=T.blue;}}
            onMouseOut={e=>{e.currentTarget.style.background=T.surfaceHigh;e.currentTarget.style.color=T.ink2;e.currentTarget.style.borderColor=T.border;}}>
            <Icon name="print" size={14} color="currentColor"/> Export PDF
          </button>
        </div>
      </div>

      {/* Decisions + Follow-ups */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
        <SectionCard label="Decisions Made"   dot={T.green}  items={meeting.decisions||[]}  icon="check" iconBg={T.greenLight}  iconColor={T.greenText}/>
        <SectionCard label="Follow-ups Needed" dot={T.orange} items={meeting.follow_ups||[]} icon="arrow" iconBg={T.orangeLight} iconColor={T.orangeText}/>
      </div>

      {/* Action items */}
      <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"20px 22px",marginBottom:14 }}>
        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:18 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:T.blue }}/>
          <span style={{ fontSize:11,fontWeight:600,color:T.ink3,letterSpacing:0.3,textTransform:"uppercase" }}>Action Items</span>
          <span style={{ marginLeft:"auto" }}><Badge color={actions.filter(a=>!a.done).length>0?"orange":"green"} T={T}>{actions.filter(a=>!a.done).length} pending</Badge></span>
        </div>
        {actions.length===0?<p style={{ fontSize:13,color:T.ink4,fontStyle:"italic" }}>No action items recorded</p>
          :actions.map((a,i)=>(
          <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start",padding:"11px 0",borderBottom:i<actions.length-1?`1px solid ${T.border}`:"none" }}>
            <button className="chk" onClick={()=>toggle(i)} style={{ width:22,height:22,borderRadius:"50%",border:`1.5px solid ${a.done?T.green:T.borderStrong}`,background:a.done?T.green:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
              {a.done&&<Icon name="check" size={11} color="#fff"/>}
            </button>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:14,color:a.done?T.ink4:T.ink,textDecoration:a.done?"line-through":"none",lineHeight:1.55,marginBottom:6,letterSpacing:-0.1 }}>{a.task}</div>
              <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                <Badge color="gray" T={T}>{a.owner||"Team"}</Badge>
                <Badge color={a.done?"green":"orange"} T={T}>{a.done?"Done":(a.due||"TBD")}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Send Summary */}
      <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"20px 22px",marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:T.ink3 }}/>
            <span style={{ fontSize:11,fontWeight:600,color:T.ink3,letterSpacing:0.3,textTransform:"uppercase" }}>Send Summary</span>
          </div>
          {allEmails.length>0 && <Badge color="blue" T={T}>{allEmails.length} recipient{allEmails.length!==1?"s":""}</Badge>}
        </div>

        {/* Team member picker */}
        {team.length > 0 ? (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <span style={{ fontSize:12,color:T.ink3,fontWeight:500 }}>Pick who to send to:</span>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={selectAll} style={{ background:"none",border:"none",color:T.blue,fontSize:11,fontWeight:500,cursor:"pointer",padding:0 }}>Select all</button>
                <span style={{ color:T.border }}>·</span>
                <button onClick={clearAll} style={{ background:"none",border:"none",color:T.ink4,fontSize:11,fontWeight:500,cursor:"pointer",padding:0 }}>Clear</button>
              </div>
            </div>

            <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
              {team.map((m,i)=>{
                const isSelected = selected.includes(m.id);
                return (
                  <button key={m.id} onClick={()=>toggleMember(m.id)}
                    style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,border:`1.5px solid ${isSelected?T.blue:T.border}`,background:isSelected?T.blueLight:"none",cursor:"pointer",transition:"all .15s",textAlign:"left",width:"100%" }}>
                    {/* Avatar */}
                    <div style={{ width:32,height:32,borderRadius:"50%",background:avatarColor(m)+"22",border:`1.5px solid ${avatarColor(m)}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:avatarColor(m) }}>
                      {initials(m.name)}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:T.ink,marginBottom:1 }}>{m.name}</div>
                      <div style={{ fontSize:11,color:T.ink4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.role} · {m.email}</div>
                    </div>
                    {/* Checkmark */}
                    <div style={{ width:20,height:20,borderRadius:"50%",border:`1.5px solid ${isSelected?T.blue:T.border}`,background:isSelected?T.blue:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s" }}>
                      {isSelected&&<Icon name="check" size={11} color="#fff"/>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider with "or add more" */}
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
              <div style={{ flex:1,height:1,background:T.border }}/>
              <span style={{ fontSize:11,color:T.ink4,whiteSpace:"nowrap" }}>or add more emails manually</span>
              <div style={{ flex:1,height:1,background:T.border }}/>
            </div>
          </>
        ) : (
          <div style={{ background:T.blueLight,borderRadius:9,padding:"10px 13px",marginBottom:12,fontSize:12,color:T.blue,display:"flex",alignItems:"center",gap:8 }}>
            <Icon name="team" size={14} color={T.blue}/>
            <span>Add your team members in <strong>Team</strong> to quickly pick recipients here.</span>
          </div>
        )}

        {/* Manual email input */}
        <input value={emailInput} onChange={e=>setEmailInput(e.target.value)} placeholder="Extra emails, comma-separated (optional)"
          style={{ width:"100%",background:T.inputBg,border:`1.5px solid ${T.border}`,borderRadius:10,padding:"10px 13px",fontSize:13,color:T.ink,outline:"none",marginBottom:12,transition:"border-color .2s" }}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>

        {/* Preview of recipients */}
        {allEmails.length>0 && (
          <div style={{ background:T.surfaceHigh,borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:12,color:T.ink3,lineHeight:1.6 }}>
            <span style={{ fontWeight:600,color:T.ink2 }}>To: </span>{allEmails.join(", ")}
          </div>
        )}

        <div style={{ display:"flex",gap:8 }}>
          <button onClick={openMail} disabled={allEmails.length===0}
            style={{ flex:1,padding:"11px",borderRadius:980,background:allEmails.length>0?T.blue:T.surfaceHigh,color:allEmails.length>0?"#fff":T.ink4,border:"none",fontSize:13,fontWeight:500,cursor:allEmails.length>0?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s" }}>
            <Icon name="mail" size={13} color={allEmails.length>0?"#fff":T.ink4}/> Open in Mail
          </button>
          <button onClick={copyEmail}
            style={{ flex:1,padding:"11px",borderRadius:980,background:copied?T.greenLight:T.surfaceHigh,color:copied?T.greenText:T.ink,border:"none",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .2s" }}>
            {copied?<><Icon name="check" size={13} color={T.greenText}/> Copied!</>:<><Icon name="copy" size={13} color={T.ink}/> Copy Text</>}
          </button>
        </div>
      </div>

      {/* Save */}
      {!saved
        ? <button onClick={()=>onSave(actions)} style={{ width:"100%",padding:"14px",borderRadius:12,background:T.ink,color:T.bg,border:"none",fontSize:15,fontWeight:500,cursor:"pointer",transition:"opacity .15s" }} onMouseOver={e=>e.currentTarget.style.opacity=".82"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>Save to History</button>
        : <div style={{ textAlign:"center",padding:"14px",background:T.greenLight,borderRadius:12,fontSize:14,fontWeight:500,color:T.greenText,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}><Icon name="check" size={15} color={T.greenText}/> Saved — changes auto-persist</div>}
    </div>
  );
}

// ── ACTION ITEMS ──────────────────────────────────────────────────────────────
function ActionItems({ meetings, onUpdate, T }) {
  const [filter,setFilter] = useState("pending");
  const all = meetings.flatMap(m=>(m.action_items||[]).map((a,idx)=>({...a,meetingTitle:m.title,meetingId:m.id,idx})));
  // FIX 3: correct ternary (was `a.done?.65:1` — invalid JS)
  const filtered = filter==="all"?all:filter==="pending"?all.filter(a=>!a.done):all.filter(a=>a.done);
  return (
    <div className="fu">
      <div style={{ display:"inline-flex",background:"rgba(128,128,128,0.1)",borderRadius:10,padding:3,marginBottom:22,gap:2 }}>
        {[{k:"pending",l:`Pending (${all.filter(a=>!a.done).length})`},{k:"done",l:`Done (${all.filter(a=>a.done).length})`},{k:"all",l:"All"}].map(({k,l})=>(
          <button key={k} onClick={()=>setFilter(k)} style={{ padding:"6px 18px",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:500,transition:"all .2s ease",background:filter===k?T.surface:"transparent",color:filter===k?T.ink:T.ink3,boxShadow:filter===k?T.shadow:"none" }}>{l}</button>
        ))}
      </div>
      {filtered.length===0?(
        <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:48,textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:10 }}>{filter==="pending"?"✅":"📭"}</div>
          <div style={{ fontSize:15,fontWeight:500,color:T.ink,marginBottom:5 }}>{filter==="pending"?"All caught up!":"Nothing here yet"}</div>
          <div style={{ fontSize:13,color:T.ink3 }}>{filter==="pending"?"No pending action items":"Completed items will appear here"}</div>
        </div>
      ):filtered.map((a,i)=>(
        <div key={`${a.meetingId}-${a.idx}`} style={{ background:T.surface,borderRadius:12,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"14px 18px",marginBottom:8,opacity:a.done?0.65:1,animation:`fadeUp .3s ${i*.03}s cubic-bezier(.16,1,.3,1) both` }}>
          <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
            <button className="chk" onClick={()=>onUpdate(a.meetingId,a.idx)} style={{ width:22,height:22,borderRadius:"50%",border:`1.5px solid ${a.done?T.green:T.borderStrong}`,background:a.done?T.green:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
              {a.done&&<Icon name="check" size={11} color="#fff"/>}
            </button>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontSize:14,color:T.ink,textDecoration:a.done?"line-through":"none",lineHeight:1.55,marginBottom:6,letterSpacing:-0.1 }}>{a.task}</div>
              <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                <Badge color="gray" T={T}>{a.owner||"Team"}</Badge>
                <Badge color={a.done?"green":"orange"} T={T}>{a.done?"Done":(a.due||"TBD")}</Badge>
                <span style={{ fontSize:11,color:T.ink4,alignSelf:"center" }}>· {a.meetingTitle}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── HISTORY ───────────────────────────────────────────────────────────────────
function History({ meetings, onView, onDelete, T }) {
  const [printMeeting,setPrintMeeting] = useState(null);
  return (
    <div className="fu">
      {printMeeting&&<PrintModal meeting={printMeeting} onClose={()=>setPrintMeeting(null)} T={T}/>}
      {meetings.length===0?(
        <div style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:56,textAlign:"center" }}>
          <div style={{ width:52,height:52,borderRadius:"50%",background:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}><Icon name="clock" size={22} color={T.blue}/></div>
          <div style={{ fontSize:16,fontWeight:500,color:T.ink,marginBottom:6 }}>No meetings yet</div>
          <div style={{ fontSize:13,color:T.ink3 }}>Analyzed meetings will appear here</div>
        </div>
      ):[...meetings].sort((a,b)=>b.createdAt-a.createdAt).map((m,i)=>(
        <div key={m.id} style={{ background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,boxShadow:T.shadow,padding:"18px 22px",marginBottom:10,animation:`fadeUp .32s ${i*.04}s cubic-bezier(.16,1,.3,1) both` }}>
          <div style={{ display:"flex",alignItems:"flex-start",gap:14 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Icon name="clock" size={16} color={T.blue}/></div>
            <div style={{ flex:1,cursor:"pointer",minWidth:0 }} onClick={()=>onView(m)}>
              <div style={{ fontSize:15,fontWeight:600,color:T.ink,letterSpacing:-0.3,marginBottom:4 }}>{m.title}</div>
              <div style={{ fontSize:12,color:T.ink3,lineHeight:1.6,marginBottom:8,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{m.summary}</div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                <span style={{ fontSize:11,color:T.ink4 }}>{new Date(m.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</span>
                <span style={{ color:T.border }}>·</span>
                <Badge color={(m.action_items||[]).filter(a=>!a.done).length>0?"orange":"green"} T={T}>{(m.action_items||[]).filter(a=>!a.done).length} pending</Badge>
                {(m.attendees||[]).slice(0,3).map((a,j)=><Badge key={j} color="gray" T={T}>{a}</Badge>)}
              </div>
            </div>
            <div style={{ display:"flex",gap:6,flexShrink:0 }}>
              <button onClick={()=>setPrintMeeting(m)} title="Export PDF"
                style={{ display:"flex",alignItems:"center",gap:5,padding:"7px 12px",borderRadius:980,background:T.surfaceHigh,border:"none",color:T.ink3,fontSize:12,fontWeight:500,cursor:"pointer",transition:"all .15s" }}
                onMouseOver={e=>{e.currentTarget.style.color=T.blue;e.currentTarget.style.background=T.blueLight;}}
                onMouseOut={e=>{e.currentTarget.style.color=T.ink3;e.currentTarget.style.background=T.surfaceHigh;}}>
                <Icon name="print" size={13} color="currentColor"/>
              </button>
              <button onClick={()=>onView(m)} style={{ padding:"7px 14px",borderRadius:980,background:T.surfaceHigh,border:"none",color:T.ink,fontSize:13,fontWeight:500,cursor:"pointer" }}>Open</button>
              <button onClick={()=>onDelete(m.id)} title="Delete"
                style={{ width:34,height:34,borderRadius:9,border:`1px solid ${T.border}`,background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}
                onMouseOver={e=>{e.currentTarget.style.background=T.redLight;e.currentTarget.style.borderColor=T.red+"44";}}
                onMouseOut={e=>{e.currentTarget.style.background="none";e.currentTarget.style.borderColor=T.border;}}>
                <Icon name="trash" size={14} color={T.red}/>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TEAM PAGE — Org Chart ─────────────────────────────────────────────────────
const LEVEL_COLORS  = (T) => [T.blue, T.green, T.orange];
const ROLE_PRESETS  = ["Team Lead","Manager","Developer","Designer","Marketing","Product","QA","Analyst","Other"];

// Defined outside TeamPage so React never remounts them on re-render
function ConnectorLine({ color }) {
  return <div style={{ width:2, height:32, background:`linear-gradient(to bottom, ${color}88, ${color}22)`, margin:"0 auto", borderRadius:2 }}/>;
}
function HorizBar({ count, color }) {
  if (count <= 1) return null;
  // Needs explicit height so the gradient bar is visible
  return (
    <div style={{ position:"relative", width:"100%", height:16, marginBottom:0 }}>
      <div style={{ position:"absolute", top:"50%", left:"8%", right:"8%", height:2, transform:"translateY(-50%)", background:`linear-gradient(to right, transparent, ${color}55 20%, ${color}55 80%, transparent)`, borderRadius:2 }}/>
    </div>
  );
}

function OrgNode({ member, index, level, isEditing, onEdit, onRemove, T }) {
  const [hovered, setHovered] = useState(false);
  const cols   = LEVEL_COLORS(T);
  const col    = cols[Math.min(level, cols.length - 1)];
  const init   = member.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const sz     = level === 0 ? 80 : level === 1 ? 66 : 56;
  const fSz    = level === 0 ? 22 : level === 1 ? 18 : 15;

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", animation:`fadeUp .4s ${index * .07}s cubic-bezier(.16,1,.3,1) both` }}>
      {/* Avatar ring */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ position:"relative", cursor:"pointer" }}
        onClick={() => onEdit(member)}
      >
        {/* Outer glow ring */}
        <div style={{
          width: sz + 12, height: sz + 12, borderRadius:"50%",
          background: `radial-gradient(circle, ${col}22 0%, transparent 70%)`,
          border: `2px solid ${isEditing ? col : hovered ? col+"88" : col+"33"}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .2s ease",
          boxShadow: isEditing ? `0 0 0 3px ${col}33, 0 4px 20px ${col}44` : hovered ? `0 4px 16px ${col}33` : "none",
        }}>
          {/* Inner avatar */}
          <div style={{
            width: sz, height: sz, borderRadius:"50%",
            background: `linear-gradient(135deg, ${col}44, ${col}22)`,
            border: `2px solid ${col}66`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: fSz, fontWeight:700, color: col,
            transition:"all .2s",
          }}>
            {init}
          </div>
        </div>

        {/* Edit / Remove buttons on hover */}
        {hovered && (
          <div style={{ position:"absolute", top:-6, right:-6, display:"flex", flexDirection:"column", gap:4 }}>
            <button onClick={e=>{ e.stopPropagation(); onEdit(member); }}
              style={{ width:22, height:22, borderRadius:"50%", background:T.blue, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
              <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><path d="M4 16l2-6L14 2l4 4-8 8-6 2z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={e=>{ e.stopPropagation(); onRemove(member.id); }}
              style={{ width:22, height:22, borderRadius:"50%", background:T.red, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.2)" }}>
              <Icon name="close" size={9} color="#fff"/>
            </button>
          </div>
        )}
      </div>

      {/* Name + role */}
      <div style={{ textAlign:"center", marginTop:10, maxWidth:100 }}>
        <div style={{ fontSize: level===0?14:13, fontWeight:700, color:T.ink, letterSpacing:-0.3, lineHeight:1.2, marginBottom:3 }}>{member.name}</div>
        <div style={{ fontSize:10, color:col, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5 }}>{member.role}</div>
        <div style={{ fontSize:10, color:T.ink4, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:90 }}>{member.email}</div>
      </div>
    </div>
  );
}

function TeamPage({ team, onSave, T }) {
  const [members, setMembers] = useState(team);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]   = useState({ name:"", role:"Team Member", email:"", level:2 });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Sync local state whenever parent team actually changes
  useEffect(() => { setMembers(team); }, [JSON.stringify(team)]);

  const validate = () => {
    if (!form.name.trim())  return "Name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) return "Enter a valid email address.";
    return "";
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name:"", role:"Team Member", email:"", level:2 });
    setError("");
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({ name:m.name, role:m.role, email:m.email, level:m.level ?? 2 });
    setError("");
    setShowForm(true);
  };

  const addOrUpdate = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    const entry = { id: editingId || Date.now().toString(), name:form.name.trim(), role:form.role.trim()||"Team Member", email:form.email.trim().toLowerCase(), level:form.level };
    const updated = editingId ? members.map(m=>m.id===editingId?entry:m) : [...members, entry];
    setMembers(updated);
    setShowForm(false);
    setEditingId(null);
    setSaved(false);
  };

  const remove = (id) => { setMembers(prev=>prev.filter(m=>m.id!==id)); setSaved(false); if(editingId===id){setShowForm(false);setEditingId(null);} };
  const saveTeam = () => { onSave(members); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const leads    = members.filter(m => m.level === 0);
  const managers = members.filter(m => m.level === 1);
  const baseMembers = members.filter(m => (m.level ?? 2) === 2);

  const cols = LEVEL_COLORS(T);

  return (
    <div className="fu">
      {/* Header bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:13, color:T.ink3 }}>{members.length} member{members.length!==1?"s":""} across {[leads,managers,baseMembers].filter(g=>g.length>0).length} level{[leads,managers,baseMembers].filter(g=>g.length>0).length!==1?"s":""}</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={openAdd}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:980, background:T.blue, color:"#fff", border:"none", fontSize:13, fontWeight:500, cursor:"pointer", transition:"opacity .15s" }}
            onMouseOver={e=>e.currentTarget.style.opacity=".85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>
            <Icon name="plus" size={13} color="#fff"/> Add Member
          </button>
          <button onClick={saveTeam}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:980, background:saved?T.greenLight:T.surfaceHigh, color:saved?T.greenText:T.ink, border:`1px solid ${saved?T.green+"44":T.border}`, fontSize:13, fontWeight:500, cursor:"pointer", transition:"all .2s" }}>
            {saved ? <><Icon name="check" size={13} color={T.greenText}/> Saved!</> : "Save Team"}
          </button>
        </div>
      </div>

      {/* Org chart area */}
      {members.length === 0 ? (
        <div style={{ background:T.surface, borderRadius:16, border:`2px dashed ${T.border}`, padding:"60px 40px", textAlign:"center" }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:T.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <Icon name="team" size={26} color={T.blue}/>
          </div>
          <div style={{ fontSize:16, fontWeight:600, color:T.ink, marginBottom:8 }}>Build your org chart</div>
          <div style={{ fontSize:13, color:T.ink3, marginBottom:24, maxWidth:320, margin:"0 auto 24px" }}>Add your team lead, managers and members. They'll appear here as a visual org chart.</div>
          <button onClick={openAdd} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"11px 24px", borderRadius:980, background:T.blue, color:"#fff", border:"none", fontSize:14, fontWeight:500, cursor:"pointer" }}>
            <Icon name="plus" size={14} color="#fff"/> Add First Member
          </button>
        </div>
      ) : (
        <div style={{ background:T.surface, borderRadius:16, border:`1px solid ${T.border}`, boxShadow:T.shadow, padding:"40px 24px 48px", overflow:"auto" }}>

          {/* Level legend */}
          <div style={{ display:"flex", justifyContent:"center", gap:20, marginBottom:36, flexWrap:"wrap" }}>
            {[{l:"Team Lead",c:cols[0]},{l:"Manager",c:cols[1]},{l:"Member",c:cols[2]}].map(({l,c})=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c }}/>
                <span style={{ fontSize:11, color:T.ink3, fontWeight:500 }}>{l}</span>
              </div>
            ))}
          </div>

          {/* TIER 1 — Lead(s) */}
          {leads.length > 0 && (
            <>
              <div style={{ display:"flex", justifyContent:"center", gap:48, flexWrap:"wrap" }}>
                {leads.map((m,i)=><OrgNode key={m.id} member={m} index={i} level={0} isEditing={editingId===m.id} onEdit={openEdit} onRemove={remove} T={T}/>)}
              </div>
              {(managers.length > 0 || baseMembers.length > 0) && <ConnectorLine color={cols[0]}/>}
            </>
          )}

          {/* TIER 2 — Managers */}
          {managers.length > 0 && (
            <>
              {managers.length > 1 && <HorizBar count={managers.length} color={cols[1]}/>}
              <div style={{ display:"flex", justifyContent:"center", gap:40, flexWrap:"wrap" }}>
                {managers.map((m,i)=>(
                  <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    {managers.length > 1 && <ConnectorLine color={cols[1]}/>}
                    <OrgNode member={m} index={leads.length+i} level={1} isEditing={editingId===m.id} onEdit={openEdit} onRemove={remove} T={T}/>
                  </div>
                ))}
              </div>
              {baseMembers.length > 0 && <ConnectorLine color={cols[1]}/>}
            </>
          )}

          {/* TIER 3 — Members */}
          {baseMembers.length > 0 && (
            <>
              {baseMembers.length > 1 && <HorizBar count={baseMembers.length} color={cols[2]}/>}
              <div style={{ display:"flex", justifyContent:"center", gap:28, flexWrap:"wrap" }}>
                {baseMembers.map((m,i)=>(
                  <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    {baseMembers.length > 1 && <ConnectorLine color={cols[2]}/>}
                    <OrgNode member={m} index={leads.length+managers.length+i} level={2} isEditing={editingId===m.id} onEdit={openEdit} onRemove={remove} T={T}/>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add / Edit drawer modal */}
      {showForm && (
        <div onClick={()=>{setShowForm(false);setEditingId(null);setError("");}} style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .18s ease" }}>
          <div onClick={e=>e.stopPropagation()} style={{ width:440,background:T.surface,borderRadius:18,boxShadow:"0 24px 80px rgba(0,0,0,0.28)",border:`1px solid ${T.border}`,overflow:"hidden" }}>
            {/* Modal header */}
            <div style={{ padding:"18px 24px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <div style={{ fontSize:15,fontWeight:700,color:T.ink }}>
                {editingId ? "Edit Team Member" : "Add Team Member"}
              </div>
              <button onClick={()=>{setShowForm(false);setEditingId(null);}} style={{ width:28,height:28,borderRadius:"50%",background:T.surfaceHigh,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Icon name="close" size={13} color={T.ink3}/>
              </button>
            </div>

            <div style={{ padding:"22px 24px" }}>
              {/* Level selector */}
              <label style={{ fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5 }}>Level in hierarchy</label>
              <div style={{ display:"flex",gap:8,marginBottom:18 }}>
                {[{v:0,l:"Team Lead",c:cols[0]},{v:1,l:"Manager",c:cols[1]},{v:2,l:"Member",c:cols[2]}].map(({v,l,c})=>(
                  <button key={v} onClick={()=>setForm({...form,level:v})}
                    style={{ flex:1,padding:"9px 4px",borderRadius:10,border:`1.5px solid ${form.level===v?c:T.border}`,background:form.level===v?c+"22":"none",color:form.level===v?c:T.ink3,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s",textAlign:"center" }}>
                    <div style={{ width:10,height:10,borderRadius:"50%",background:c,margin:"0 auto 5px" }}/>
                    {l}
                  </button>
                ))}
              </div>

              {/* Name */}
              <label style={{ fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5 }}>Full Name *</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Sarah Chen"
                style={{ width:"100%",background:T.inputBg,border:`1.5px solid ${T.border}`,borderRadius:9,padding:"10px 13px",fontSize:14,color:T.ink,outline:"none",marginBottom:14,transition:"border-color .2s" }}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>

              {/* Role */}
              <label style={{ fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:0.5 }}>Role</label>
              <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
                {ROLE_PRESETS.map(r=>(
                  <button key={r} onClick={()=>setForm({...form,role:r})}
                    style={{ padding:"4px 10px",borderRadius:980,border:`1.5px solid ${form.role===r?T.blue:T.border}`,background:form.role===r?T.blueLight:"none",color:form.role===r?T.blue:T.ink3,fontSize:11,fontWeight:500,cursor:"pointer",transition:"all .15s" }}>
                    {r}
                  </button>
                ))}
              </div>
              <input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="Or type a custom role…"
                style={{ width:"100%",background:T.inputBg,border:`1.5px solid ${T.border}`,borderRadius:9,padding:"10px 13px",fontSize:14,color:T.ink,outline:"none",marginBottom:14,transition:"border-color .2s" }}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}/>

              {/* Email */}
              <label style={{ fontSize:11,fontWeight:600,color:T.ink3,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:0.5 }}>Email Address *</label>
              <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="e.g. sarah@company.com" type="email"
                style={{ width:"100%",background:T.inputBg,border:`1.5px solid ${error?T.red:T.border}`,borderRadius:9,padding:"10px 13px",fontSize:14,color:T.ink,outline:"none",marginBottom:error?6:18,transition:"border-color .2s" }}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border}
                onKeyDown={e=>e.key==="Enter"&&addOrUpdate()}/>
              {error && <div style={{ fontSize:12,color:T.red,marginBottom:14 }}>{error}</div>}

              <div style={{ display:"flex",gap:8 }}>
                <button onClick={addOrUpdate}
                  style={{ flex:1,padding:"12px",borderRadius:980,background:T.blue,color:"#fff",border:"none",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                  {editingId?<><Icon name="check" size={13} color="#fff"/>Update</>:<><Icon name="plus" size={13} color="#fff"/>Add to Chart</>}
                </button>
                <button onClick={()=>{setShowForm(false);setEditingId(null);}}
                  style={{ padding:"12px 18px",borderRadius:980,background:T.surfaceHigh,border:"none",color:T.ink,fontSize:13,fontWeight:500,cursor:"pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view,setView]           = useState("dashboard");
  const [dark,setDark]           = useState(false);
  const [meetings,setMeetings]   = useState([]);
  const [team,setTeam]           = useState([]);
  const [pending,setPending]     = useState(null);
  const [resultSaved,setResultSaved] = useState(false);
  const [loaded,setLoaded]       = useState(false);
  const [showSearch,setShowSearch] = useState(false);
  const T = makeTheme(dark);

  useEffect(()=>{
    (async()=>{
      try {
        const mr=localStorage.getItem("mc3_meetings"); if(mr)setMeetings(JSON.parse(mr));
        const dr=localStorage.getItem("mc3_dark"); if(dr)setDark(JSON.parse(dr));
        const tr=localStorage.getItem("mc3_team"); if(tr)setTeam(JSON.parse(tr));
      } catch(_){}
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{
    const h=e=>{if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();setShowSearch(true);}};
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[]);

  const persist = useCallback(async(updated)=>{
    setMeetings(updated);
    try{localStorage.setItem("mc3_meetings", JSON.stringify(updated));}catch(_){}
  },[]);

  const toggleDark = useCallback(async()=>{
    const nd=!dark; setDark(nd);
    try{localStorage.setItem("mc3_dark", JSON.stringify(nd));}catch(_){}
  },[dark]);

  const handleResult = useCallback(r=>{setPending(r);setResultSaved(false);setView("result");},[]);

  const handleSave = useCallback((ua)=>{
    const saved={...pending,action_items:ua,id:Date.now().toString(),createdAt:Date.now()};
    persist([...meetings,saved]);
    setPending(saved);
    setResultSaved(true);
  },[pending,meetings,persist]);

  const handleView = useCallback(m=>{setPending(m);setResultSaved(true);setView("result");},[]);
  const handleDelete = useCallback(id=>persist(meetings.filter(m=>m.id!==id)),[meetings,persist]);

  const handleToggle = useCallback((mid,idx)=>{
    const updated=meetings.map(m=>m.id!==mid?m:{...m,action_items:m.action_items.map((a,i)=>i===idx?{...a,done:!a.done}:a)});
    persist(updated);
    if(pending?.id===mid) setPending(updated.find(m=>m.id===mid)||pending);
  },[meetings,persist,pending]);

  // FIX: persist action changes from result view for already-saved meetings
  const handleResultActionToggle = useCallback((ua)=>{
    if(!pending?.id)return;
    const updated=meetings.map(m=>m.id!==pending.id?m:{...m,action_items:ua});
    setMeetings(updated);
    try{localStorage.setItem("mc3_meetings",JSON.stringify(updated));}catch(_){}
  },[meetings,pending]);

  const saveTeam = useCallback(async(updated)=>{
    setTeam(updated);
    try{localStorage.setItem("mc3_team", JSON.stringify(updated));}catch(_){}
  },[]);

  const pendingCount = meetings.flatMap(m=>(m.action_items||[]).filter(a=>!a.done)).length;
  const NAV = [
    {id:"dashboard",label:"Overview",   icon:"home"},
    {id:"new",      label:"New Meeting",icon:"plus"},
    {id:"actions",  label:"Actions",    icon:"list",badge:pendingCount},
    {id:"history",  label:"History",    icon:"clock"},
    {id:"team",     label:"Team",       icon:"team"},
  ];
  const TITLES = {dashboard:"Good day.",new:"New Meeting",result:pending?.title||"Meeting",actions:"Action Items",history:"History",team:"My Team"};
  const SUBS   = {dashboard:"Here's your workspace overview.",new:"Paste notes or record your meeting.",result:"Review your AI-generated summary.",actions:"Track tasks across all meetings.",history:"All your past meeting summaries.",team:`${team.length} member${team.length!==1?"s":""} · pick who to notify each meeting`};
  const activeNav = view==="result"?"new":view;
  const goNew = ()=>{setPending(null);setResultSaved(false);setView("new");};

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",transition:"background .3s" }}>
      <style>{CSS}</style>

      {showSearch&&<SearchModal meetings={meetings} onClose={()=>setShowSearch(false)} onView={m=>{handleView(m);setShowSearch(false);}} T={T}/>}

      {/* Sidebar */}
      <aside style={{ width:236,flexShrink:0,background:T.sidebar,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",padding:"0 10px 20px",position:"sticky",top:0,height:"100vh",transition:"background .3s,border-color .3s" }}>
        {/* Logo */}
        <div style={{ padding:"20px 10px 18px",borderBottom:`1px solid ${T.border}`,marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#0071e3,#34aadc)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(0,113,227,.35)",flexShrink:0 }}><Icon name="spark" size={16} color="#fff"/></div>
            <div><div style={{ fontSize:14,fontWeight:700,color:T.ink,letterSpacing:-0.5,lineHeight:1 }}>MeetingClarity</div><div style={{ fontSize:10,color:T.ink4,marginTop:2 }}>Workspace</div></div>
          </div>
        </div>
        {/* Search bar */}
        <button onClick={()=>setShowSearch(true)} style={{ display:"flex",alignItems:"center",gap:9,width:"100%",background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:9,padding:"8px 12px",marginBottom:16,cursor:"pointer",transition:"border-color .15s",outline:"none" }}
          onMouseOver={e=>e.currentTarget.style.borderColor=T.blue} onMouseOut={e=>e.currentTarget.style.borderColor=T.border}>
          <Icon name="search" size={13} color={T.ink4}/>
          <span style={{ fontSize:13,color:T.ink4,flex:1,textAlign:"left" }}>Search…</span>
          <span style={{ fontSize:10,color:T.ink4,background:T.surfaceHigh,padding:"2px 5px",borderRadius:4 }}>⌘K</span>
        </button>
        {/* Nav items */}
        <div style={{ fontSize:10,fontWeight:600,color:T.ink4,letterSpacing:0.8,textTransform:"uppercase",padding:"0 10px 8px" }}>Menu</div>
        <nav style={{ flex:1 }}>
          {NAV.map(n=>{
            const active=activeNav===n.id;
            return (
              <button key={n.id} onClick={()=>n.id==="new"?goNew():setView(n.id)}
                style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",border:"none",background:active?T.blueLight:"transparent",color:active?T.blue:T.ink2,borderRadius:10,cursor:"pointer",fontSize:14,fontWeight:active?500:400,transition:"all .15s",marginBottom:2,outline:"none" }}
                onMouseOver={e=>{if(!active)e.currentTarget.style.background="rgba(128,128,128,0.08)";}}
                onMouseOut={e=>{if(!active)e.currentTarget.style.background="transparent";}}>
                <Icon name={n.icon} size={16} color={active?T.blue:T.ink3}/>
                <span style={{ flex:1 }}>{n.label}</span>
                {n.badge>0&&<span style={{ background:T.orange,color:"#fff",fontSize:10,fontWeight:700,borderRadius:980,padding:"2px 6px",minWidth:18,textAlign:"center" }}>{n.badge}</span>}
              </button>
            );
          })}
        </nav>
        {/* Dark mode */}
        <div style={{ paddingTop:14,borderTop:`1px solid ${T.border}` }}>
          <button onClick={toggleDark} style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",border:"none",background:"transparent",color:T.ink3,borderRadius:10,cursor:"pointer",fontSize:14,transition:"background .15s",outline:"none" }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(128,128,128,0.08)"} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
            <Icon name={dark?"sun":"moon"} size={16} color={T.ink3}/>{dark?"Light Mode":"Dark Mode"}
          </button>
          <div style={{ padding:"6px 12px 0",fontSize:11,color:T.ink4 }}>{meetings.length} meeting{meetings.length!==1?"s":""} · {pendingCount} pending</div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1,overflowY:"auto",minHeight:"100vh",transition:"background .3s" }}>
        {/* Topbar */}
        <div style={{ position:"sticky",top:0,zIndex:50,background:dark?"rgba(28,28,30,0.88)":"rgba(245,245,247,0.88)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderBottom:`1px solid ${T.border}`,padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"background .3s" }}>
          <div>
            <div style={{ fontSize:22,fontWeight:700,color:T.ink,letterSpacing:-0.7,lineHeight:1.1 }}>{TITLES[view]||pending?.title||"Meeting"}</div>
            <div style={{ fontSize:13,color:T.ink3,marginTop:2 }}>{SUBS[view]||SUBS.result}</div>
          </div>
          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
            {view==="result"&&<button onClick={()=>setView("history")} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:980,background:T.surfaceHigh,border:"none",color:T.ink,fontSize:13,fontWeight:500,cursor:"pointer" }}>← Back</button>}
            {view!=="new"&&view!=="result"&&(
              <button onClick={goNew} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:980,background:T.blue,color:"#fff",border:"none",fontSize:14,fontWeight:500,cursor:"pointer",transition:"opacity .15s" }}
                onMouseOver={e=>e.currentTarget.style.opacity=".85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}>
                <Icon name="plus" size={13} color="#fff"/> New Meeting
              </button>
            )}
          </div>
        </div>

        {/* Page body */}
        <div style={{ padding:"32px 40px",maxWidth:920 }}>
          {!loaded
            ? <div style={{ display:"flex",justifyContent:"center",padding:80 }}><Spinner size={28} color={T.blue}/></div>
            : <>
                {view==="dashboard" && <Dashboard meetings={meetings} onNew={goNew} onView={handleView} onGoActions={()=>setView("actions")} T={T}/>}
                {view==="new"       && <NewMeeting onResult={handleResult} T={T}/>}
                {view==="result"    && pending && <MeetingResult meeting={pending} onSave={handleSave} saved={resultSaved} onActionToggle={handleResultActionToggle} team={team} T={T}/>}
                {view==="actions"   && <ActionItems meetings={meetings} onUpdate={handleToggle} T={T}/>}
                {view==="history"   && <History meetings={meetings} onView={handleView} onDelete={handleDelete} T={T}/>}
                {view==="team"      && <TeamPage team={team} onSave={saveTeam} T={T}/>}
              </>}
        </div>
      </main>
    </div>
  );
}
