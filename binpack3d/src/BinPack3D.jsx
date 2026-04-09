import { useState, useRef, useEffect, useCallback } from "react";

const COLS = ["#3b82f6","#ef4444","#22c55e","#f59e0b","#a855f7","#06b6d4","#f97316","#ec4899","#84cc16","#14b8a6","#f43f5e","#0ea5e9","#8b5cf6"];

const CONTAINERS = {
  c20ft:  { label: "20ft standard",  L:590,  W:235, H:236 },
  c40hc:  { label: "40ft high cube", L:1203, W:235, H:269 },
  custom: { label: "Custom",         L:590,  W:235, H:236 },
};

// Company carton catalogue — dimensions in cm (converted from metres)
const CATALOGUE = [
  { code:"A",     desc:"15L Tubes",            l:65.6, w:29.6, h:65.6 },
  { code:"GTX20", desc:"20L GTX Tube",         l:68.6, w:16.6, h:77.6 },
  { code:"B",     desc:"25L Tubes",            l:87.0, w:47.0, h:62.0 },
  { code:"C",     desc:"34L Tubes",            l:86.6, w:46.6, h:81.6 },
  { code:"D",     desc:"45L Tubes",            l:86.6, w:24.6, h:106.0 },
  { code:"E",     desc:"600 Series End Caps",  l:63.6, w:54.6, h:54.6 },
  { code:"F",     desc:"GTX End Cap",          l:63.6, w:55.6, h:38.6 },
  { code:"G",     desc:"800 Series End Caps",  l:72.6, w:42.6, h:54.6 },
  { code:"H",     desc:"GTX End Cap w/ Door",  l:63.6, w:55.6, h:60.6 },
  { code:"I",     desc:"Accessories",          l:39.0, w:33.0, h:42.0 },
  { code:"J",     desc:"GTX Accessories",      l:40.0, w:33.0, h:44.6 },
  { code:"K",     desc:"REVO Float Half",      l:92.2, w:39.5, h:33.2 },
  { code:"M",     desc:"Locking Bar",          l:68.0, w:33.6, h:29.4 },
];

function solve(cL, cW, cH, items) {
  const placed = [], pts = [{x:0,z:0}];
  const orients = (l,w,h) => { const s=new Set(),o=[]; for(const r of[[l,w,h],[l,h,w],[w,l,h],[w,h,l],[h,l,w],[h,w,l]]){const k=r.join();if(!s.has(k)){s.add(k);o.push(r);}} return o; };
  const groundY = (x,z,lx,lz) => { if(x<0||z<0||x+lx>cL+.01||z+lz>cW+.01)return null; let y=0; for(const p of placed)if(p.x<x+lx-.01&&p.x+p.lx>x+.01&&p.z<z+lz-.01&&p.z+p.lz>z+.01)y=Math.max(y,p.y+p.ly); return y; };
  const addPt = (x,z) => { if(x<cL&&z<cW&&x>=0&&z>=0&&!pts.find(p=>Math.abs(p.x-x)<.01&&Math.abs(p.z-z)<.01))pts.push({x,z}); };
  const unpacked = [];
  for(const item of [...items].sort((a,b)=>b.eL*b.eW*b.eH-a.eL*a.eW*a.eH)){
    let best=null,bs=Infinity;
    for(const pt of pts) for(const [lx,ly,lz] of orients(item.eL,item.eW,item.eH)){ const y=groundY(pt.x,pt.z,lx,lz); if(y===null||y+ly>cH+.01)continue; const sc=y*1e8+pt.x*1e4+pt.z; if(sc<bs){bs=sc;best={x:pt.x,y,z:pt.z,lx,ly,lz};} }
    if(best){ placed.push({...item,...best}); addPt(best.x+best.lx,best.z); addPt(best.x,best.z+best.lz); addPt(best.x+best.lx,best.z+best.lz); }
    else unpacked.push(item);
  }
  return {placed,unpacked};
}

const rgb=(h,a=1)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const mix=(h,d)=>{const r=Math.min(255,Math.max(0,parseInt(h.slice(1,3),16)+d)),g=Math.min(255,Math.max(0,parseInt(h.slice(3,5),16)+d)),b=Math.min(255,Math.max(0,parseInt(h.slice(5,7),16)+d));return`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;};

function proj(x,y,z,cL,cW,cH,rY,rX,zoom,W,H,pX,pY){
  const cx=x-cL/2,cy=y-cH/2,cz=z-cW/2;
  const rx=cx*Math.cos(rY)+cz*Math.sin(rY),rz=-cx*Math.sin(rY)+cz*Math.cos(rY);
  const ry2=cy*Math.cos(rX)-rz*Math.sin(rX),rz2=cy*Math.sin(rX)+rz*Math.cos(rX);
  const sc=400*zoom/(rz2+Math.max(cL,cW,cH)*2.5);
  return{sx:W/2+rx*sc+pX,sy:H/2-ry2*sc+pY,depth:rz2};
}

function draw(ctx,W,H,placed,cL,cW,cH,rY,rX,zoom,pX,pY){
  ctx.clearRect(0,0,W,H);
  const p=(x,y,z)=>proj(x,y,z,cL,cW,cH,rY,rX,zoom,W,H,pX,pY);
  const verts=[[0,0,0],[cL,0,0],[cL,0,cW],[0,0,cW],[0,cH,0],[cL,cH,0],[cL,cH,cW],[0,cH,cW]].map(([a,b,c])=>p(a,b,c));
  [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(verts[a].sx,verts[a].sy);ctx.lineTo(verts[b].sx,verts[b].sy);ctx.strokeStyle="rgba(60,150,255,0.4)";ctx.lineWidth=1;ctx.stroke();});
  ctx.beginPath();[0,1,2,3].forEach((i,j)=>j?ctx.lineTo(verts[i].sx,verts[i].sy):ctx.moveTo(verts[i].sx,verts[i].sy));ctx.closePath();ctx.fillStyle="rgba(0,20,50,0.3)";ctx.fill();
  [...placed].map(b=>({...b,d:p(b.x+b.lx/2,b.y+b.ly/2,b.z+b.lz/2).depth})).sort((a,b)=>a.d-b.d).forEach(b=>{
    const{x,y,z,lx,ly,lz,col}=b;
    const c=[[x,y,z],[x+lx,y,z],[x+lx,y,z+lz],[x,y,z+lz],[x,y+ly,z],[x+lx,y+ly,z],[x+lx,y+ly,z+lz],[x,y+ly,z+lz]].map(([a,b2,c2])=>p(a,b2,c2));
    [{i:[4,5,6,7],d:70},{i:[0,1,5,4],d:10},{i:[1,2,6,5],d:-40},{i:[3,2,6,7],d:10},{i:[0,3,7,4],d:-40}]
      .map(f=>({...f,depth:f.i.reduce((s,i)=>s+c[i].depth,0)/4})).sort((a,b)=>a.depth-b.depth)
      .forEach(f=>{const ps=f.i.map(i=>c[i]);ctx.beginPath();ctx.moveTo(ps[0].sx,ps[0].sy);ps.slice(1).forEach(p=>ctx.lineTo(p.sx,p.sy));ctx.closePath();ctx.fillStyle=rgb(mix(col,f.d),0.88);ctx.fill();ctx.strokeStyle="rgba(0,0,0,0.15)";ctx.lineWidth=0.5;ctx.stroke();});
  });
}

const pad=(v,pct)=>parseFloat((v*(1+pct/100)).toFixed(1));

function makeBoxes(){
  return CATALOGUE.map((c,i)=>({
    id: c.code,
    code: c.code,
    name: c.desc,
    l: c.l, w: c.w, h: c.h,
    qty: 0,
    col: COLS[i % COLS.length],
    lwy: null,
  }));
}

export default function BinPack3D(){
  const[contType,setContType]=useState("c20ft");
  const[cont,setCont]=useState({L:590,W:235,H:236});
  const[gl,setGl]=useState(5);
  const[boxes,setBoxes]=useState(makeBoxes());
  const[result,setResult]=useState(null);
  const[busy,setBusy]=useState(false);
  const[tab,setTab]=useState("boxes");
  const cvRef=useRef(),vpRef=useRef();
  const cam=useRef({rY:.5,rX:.4,zoom:5,pX:0,pY:0});
  const drag=useRef(null),pRef=useRef([]),cRef=useRef([590,235,236]);

  const redraw=useCallback(()=>{
    const cv=cvRef.current;if(!cv)return;
    const{rY,rX,zoom,pX,pY}=cam.current,[L,W,H]=cRef.current;
    draw(cv.getContext("2d"),cv.width,cv.height,pRef.current,L,W,H,rY,rX,zoom,pX,pY);
  },[]);

  useEffect(()=>{
    const vp=vpRef.current;if(!vp)return;
    const ro=new ResizeObserver(()=>{const cv=cvRef.current;if(!cv)return;cv.width=vp.clientWidth;cv.height=vp.clientHeight;redraw();});
    ro.observe(vp);return()=>ro.disconnect();
  },[redraw]);

  const onDown=e=>{drag.current={mx:e.clientX,my:e.clientY,btn:e.button};};
  const onMove=useCallback(e=>{
    if(!drag.current)return;
    const dx=e.clientX-drag.current.mx,dy=e.clientY-drag.current.my;
    drag.current.mx=e.clientX;drag.current.my=e.clientY;
    if(drag.current.btn===0){cam.current.rY+=dx*.008;cam.current.rX=Math.max(-.5,Math.min(1.4,cam.current.rX-dy*.008));}
    else{cam.current.pX+=dx;cam.current.pY+=dy;}
    redraw();
  },[redraw]);
  const onUp=()=>drag.current=null;
  const onWheel=useCallback(e=>{cam.current.zoom=Math.max(.15,Math.min(6,cam.current.zoom*(1-e.deltaY*.001)));redraw();},[redraw]);

  function handleContType(key){setContType(key);if(key!=="custom")setCont({L:CONTAINERS[key].L,W:CONTAINERS[key].W,H:CONTAINERS[key].H});}
  function handleContDim(k,v){setContType("custom");setCont(c=>({...c,[k]:+v}));}
  const eff=b=>{const lwy=b.lwy??gl;return{el:pad(b.l,lwy),ew:pad(b.w,lwy),eh:pad(b.h,lwy),lwy};};
  const upBox=(id,f,v)=>setBoxes(bs=>bs.map(b=>b.id!==id?b:{...b,[f]:f==="name"?v:(v===""||v===null?null:Math.max(0,+v))}));
  const resetQty=()=>setBoxes(bs=>bs.map(b=>({...b,qty:0})));

  const activeBoxes=boxes.filter(b=>b.qty>0);

  const runPack=()=>{
    if(!activeBoxes.length)return;
    setBusy(true);
    setTimeout(()=>{
      const items=[];
      activeBoxes.forEach(b=>{const{el,ew,eh}=eff(b);for(let i=0;i<Math.min(b.qty,500);i++)items.push({...b,eL:el,eW:ew,eH:eh});});
      const{placed,unpacked}=solve(cont.L,cont.W,cont.H,items);
      const usedV=placed.reduce((s,p)=>s+p.lx*p.ly*p.lz,0);
      const pct=usedV/(cont.L*cont.W*cont.H)*100;
      setResult({placed:placed.length,total:items.length,unpacked:unpacked.length,pct});
      pRef.current=placed;cRef.current=[cont.L,cont.W,cont.H];
      redraw();setBusy(false);
    },10);
  };

  const lcol=gl<=5?"#22c55e":gl<=15?"#f59e0b":"#ef4444";
  const ts=a=>({padding:"5px 14px",fontSize:12,fontWeight:a?600:400,background:"none",border:"none",borderBottom:a?"2px solid var(--color-text-primary)":"2px solid transparent",cursor:"pointer",color:a?"var(--color-text-primary)":"var(--color-text-secondary)"});
  const contVolM3=((cont.L*cont.W*cont.H)/1e6).toFixed(1);

  const cellIn=(extra={})=>({fontFamily:"var(--font-mono)",fontSize:11,padding:"2px 3px",border:"none",borderRadius:3,width:"100%",textAlign:"center",background:"transparent",color:"var(--color-text-primary)",outline:"none",...extra});

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Space Mono', monospace", border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden",fontFamily:"var(--font-mono)",fontSize:12}}>

      {/* ── Sidebar ── */}
      <div style={{width:380,flexShrink:0,background:"var(--color-background-secondary)",borderRight:"0.5px solid var(--color-border-tertiary)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div style={{padding:"10px 14px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>BinPack 3D</div>
          <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2}}>container loading optimizer</div>
        </div>

        {/* Container selector */}
        <div style={{padding:"9px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
          <div style={{fontSize:15,color:"var(--color-text-secondary)",marginBottom:6,letterSpacing:.5}}>CONTAINER TYPE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8}}>
            {Object.entries(CONTAINERS).map(([key,ct])=>{
              const active=contType===key;
              return(
                <button key={key} onClick={()=>handleContType(key)}
                  style={{padding:"5px 4px",fontSize:11,fontFamily:"var(--font-mono)",fontWeight:active?600:400,
                    background:active?"var(--color-text-primary)":"var(--color-background-secondary)",
                    color:active?"var(--color-background-primary)":"var(--color-text-secondary)",
                    border:"0.5px solid var(--color-border-secondary)",borderRadius:6,cursor:"pointer",lineHeight:1.3,textAlign:"center"}}>
                  {ct.label}
                </button>
              );
            })}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
            {[["L","Length"],["W","Width"],["H","Height"]].map(([k,lbl])=>(
              <div key={k} style={{display:"flex",flexDirection:"column",gap:2}}>
                <label style={{fontSize:9,color:"var(--color-text-secondary)"}}>{lbl} (cm)</label>
                <input type="number" min="1" value={cont[k]} onChange={e=>handleContDim(k,e.target.value)}
                  style={{fontFamily:"var(--font-mono)",fontSize:13,padding:"3px 4px",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,width:"100%",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}/>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex", fontSize:12, borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
          <button style={ts(tab==="boxes")} onClick={()=>setTab("boxes")}>Cartons</button>
          <button style={ts(tab==="leeway")} onClick={()=>setTab("leeway")}>Leeway %</button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"8px 12px",display:"flex",flexDirection:"column",gap:8}}>

          {/* ── CARTONS TAB ── */}
          {tab==="boxes"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:12,color:"var(--color-text-secondary)",letterSpacing:.5}}>
                  SET QTY — {activeBoxes.length} type{activeBoxes.length!==1?"s":""} active
                </span>
                <button onClick={resetQty}
                  style={{fontSize:9,color:"var(--color-text-secondary)",background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,padding:"2px 7px",cursor:"pointer"}}>
                  clear all
                </button>
              </div>

              {/* Header row */}
              <div style={{display:"grid",gridTemplateColumns:"36px minmax(0,1fr) 72px",gap:4,padding:"0 2px 4px",borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:2}}>
                <span style={{fontSize:12,color:"var(--color-text-secondary)",textAlign:"center"}}>Code</span>
                <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Description</span>
                <span style={{fontSize:12,color:"var(--color-text-secondary)",textAlign:"center"}}>Qty    </span>
              </div>

              {/* One compact row per carton type */}
              {boxes.map(b=>{
                const active=b.qty>0;
                return(
                  <div key={b.id}
                    style={{display:"grid",gridTemplateColumns:"36px minmax(0,1fr) 72px",gap:4,alignItems:"center",
                      padding:"3px 2px",borderRadius:4,
                      borderLeft:`2px solid ${active?b.col:"var(--color-border-tertiary)"}`,
                      background:active?"var(--color-background-primary)":"transparent",
                      transition:"border-color .15s,background .15s"}}>

                    {/* Code badge */}
                    <div style={{textAlign:"center",fontSize:11,fontWeight:600,
                      color:active?b.col:"var(--color-text-secondary)",
                      background:active?`${b.col}18`:"transparent",
                      borderRadius:3,padding:"1px 0"}}>
                      {b.code}
                    </div>

                    {/* Description + dims */}
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:active?600:400,color:active?"var(--color-text-primary)":"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {b.name}
                      </div>
                      <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:1}}>
                        {b.l}×{b.w}×{b.h} cm
                      </div>
                    </div>

                    {/* Qty spinner */}
                    <div style={{display:"flex",alignItems:"center",gap:2}}>
                      <input type="number" min="0" max="500" value={b.qty}
                        onChange={e=>upBox(b.id,"qty",e.target.value)}
                        style={{...cellIn({fontSize:13,fontWeight:active?600:400,background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:3,padding:"1px 2px",color:active?b.col:"var(--color-text-secondary)"})}}/>
                    </div>
                  </div>
                );
              })}

              {/* Active summary */}
              {activeBoxes.length>0&&(
                <div style={{marginTop:8,padding:"6px 8px",background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:6}}>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>Active cartons — effective dims (+{gl}% leeway)</div>
                  {activeBoxes.map(b=>{const{el,ew,eh}=eff(b);return(
                    <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1px 0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:5,height:5,borderRadius:1,background:b.col,flexShrink:0}}/>
                        <span style={{fontSize:11,color:"var(--color-text-secondary)"}}>{b.code} · {b.qty}×</span>
                      </div>
                      <span style={{fontSize:9,fontWeight:600,color:b.col}}>{el}×{ew}×{eh}</span>
                    </div>
                  );})}
                </div>
              )}
            </div>
          )}

          {/* ── LEEWAY TAB ── */}
          {tab==="leeway"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontWeight:600,fontSize:12,color:"var(--color-text-primary)",marginBottom:4}}>Global leeway</div>
                <div style={{fontSize:10,color:"var(--color-text-secondary)",lineHeight:1.6,marginBottom:10}}>
                  Expands all carton dims before packing — accounts for wrapping, movement and mispacking tolerance.
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <input type="range" min="0" max="30" step="0.5" value={gl} onChange={e=>setGl(+e.target.value)} style={{flex:1}}/>
                  <input type="number" min="0" max="30" step="0.5" value={gl} onChange={e=>setGl(Math.min(30,Math.max(0,+e.target.value)))}
                    style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,width:46,padding:"3px 5px",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,textAlign:"center",color:"var(--color-text-primary)",background:"var(--color-background-primary)"}}/>
                  <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>%</span>
                </div>
                <div style={{height:4,background:"var(--color-background-tertiary)",borderRadius:2,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${(gl/30)*100}%`,background:lcol,transition:"width .2s,background .2s"}}/>
                </div>
                <div style={{fontSize:10,color:"var(--color-text-secondary)"}}>
                  {gl===0?"No buffer — exact fit only.":gl<=5?"Minimal — good for rigid, uniform cartons.":gl<=12?"Standard — recommended for most shipments.":gl<=20?"Generous — ideal for fragile or irregular items.":"Large buffer — significant safety margin."}
                </div>
              </div>

              <div style={{fontSize:10,color:"var(--color-text-secondary)",letterSpacing:.5}}>PER-CARTON OVERRIDES</div>
              <div style={{fontSize:10,color:"var(--color-text-secondary)",lineHeight:1.5,marginTop:-4}}>Active cartons only. Leave blank to use global.</div>

              {activeBoxes.length===0&&(
                <div style={{fontSize:10,color:"var(--color-text-secondary)",padding:"8px",background:"var(--color-background-primary)",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)"}}>
                  No active cartons — set qty &gt; 0 in the Cartons tab first.
                </div>
              )}

              {activeBoxes.map(b=>{
                const{el,ew,eh,lwy}=eff(b);
                const nV=(b.l*b.w*b.h/1e6).toFixed(4),eV=(el*ew*eh/1e6).toFixed(4);
                const vp=(((+eV/+nV)-1)*100).toFixed(1);
                return(
                  <div key={b.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderLeft:`2px solid ${b.col}`,borderRadius:8,padding:"8px 10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                      <span style={{fontSize:13,fontWeight:700,color:b.col,background:`${b.col}18`,borderRadius:3,padding:"1px 5px"}}>{b.code}</span>
                      <span style={{fontWeight:600,fontSize:11,flex:1,color:"var(--color-text-primary)"}}>{b.name}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <input type="range" min="0" max="30" step="0.5" value={b.lwy??gl} onChange={e=>upBox(b.id,"lwy",+e.target.value)} style={{flex:1}}/>
                      <input type="number" min="0" max="30" step="0.5" placeholder={gl} value={b.lwy??""}
                        onChange={e=>upBox(b.id,"lwy",e.target.value===""?null:+e.target.value)}
                        style={{fontFamily:"var(--font-mono)",fontSize:11,width:40,padding:"3px 4px",border:"0.5px solid var(--color-border-secondary)",borderRadius:5,textAlign:"center",color:"var(--color-text-primary)",background:"var(--color-background-primary)"}}/>
                      <span style={{fontSize:11,color:"var(--color-text-secondary)"}}>%</span>
                    </div>
                    {b.lwy!==null&&(
                      <button onClick={()=>upBox(b.id,"lwy",null)}
                        style={{fontSize:9,color:"var(--color-text-secondary)",background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,padding:"2px 7px",cursor:"pointer",marginBottom:7,display:"block"}}>
                        ↺ reset to global ({gl}%)
                      </button>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:4,alignItems:"center"}}>
                      <div style={{background:"var(--color-background-secondary)",borderRadius:6,padding:"4px 7px",textAlign:"center"}}>
                        <div style={{fontSize:8,color:"var(--color-text-secondary)",marginBottom:1}}>nominal</div>
                        <div style={{fontSize:10,fontWeight:600,color:"var(--color-text-primary)"}}>{b.l}×{b.w}×{b.h}</div>
                      </div>
                      <div style={{fontSize:14,color:"var(--color-text-secondary)",textAlign:"center"}}>→</div>
                      <div style={{background:"var(--color-background-info)",border:`0.5px solid ${b.col}55`,borderRadius:6,padding:"4px 7px",textAlign:"center"}}>
                        <div style={{fontSize:8,color:"var(--color-text-secondary)",marginBottom:1}}>+{lwy}% effective</div>
                        <div style={{fontSize:10,fontWeight:600,color:b.col}}>{el}×{ew}×{eh}</div>
                        <div style={{fontSize:8,color:"var(--color-text-secondary)",marginTop:1}}>+{vp}% vol</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Run */}
        <button onClick={runPack} disabled={busy||activeBoxes.length===0}
          style={{margin:"8px 12px 0",padding:"20px",background:"var(--color-text-primary)",color:"var(--color-background-primary)",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:activeBoxes.length===0?"not-allowed":"pointer",opacity:(busy||activeBoxes.length===0)?.45:1}}>
          {busy?"Computing...":activeBoxes.length===0?"Set carton quantities first":"▶  Calculate packing"}
        </button>

        {/* Stats */}
        <div style={{padding:"8px 12px 10px",flexShrink:0}}>
          {[["Packed",result?`${result.placed} / ${result.total}`:"—","var(--color-text-primary)"],
            ["Not fitted",result?result.unpacked:"—","var(--color-text-danger,#e24b4a)"],
            ["Utilization",result?`${result.pct.toFixed(1)}%`:"—","var(--color-text-success,#15803d)"]
          ].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:11}}>
              <span style={{color:"var(--color-text-secondary)"}}>{l}</span>
              <span style={{fontWeight:600,color:c}}>{v}</span>
            </div>
          ))}
          <div style={{height:3,background:"var(--color-background-tertiary)",borderRadius:2,overflow:"hidden",marginTop:6}}>
            <div style={{height:"100%",width:`${Math.min(result?.pct||0,100)}%`,background:"#22c55e",transition:"width .5s"}}/>
          </div>
        </div>
      </div>

      {/* ── 3D Viewport ── */}
      <div ref={vpRef} style={{flex:1,position:"relative",background:"#07090d",overflow:"hidden",cursor:"grab"}}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onWheel={onWheel} onContextMenu={e=>e.preventDefault()}>
        <canvas ref={cvRef} style={{display:"block",width:"100%",height:"100%"}}/>

        <div style={{position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.55)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"5px 10px",fontSize:20,color:"rgba(180,200,220,0.7)",fontFamily:"var(--font-mono)"}}>
          {CONTAINERS[contType]?.label??"Custom"} &nbsp;·&nbsp; {cont.L}×{cont.W}×{cont.H} cm &nbsp;·&nbsp; {contVolM3} m³
        </div>

        {!result&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{fontSize:56,color:"rgba(255,255,255,0.04)"}}>▣</div>
            <div style={{fontSize:11,color:"rgba(160,180,200,0.2)",marginTop:10,letterSpacing:3}}>SET QUANTITIES · CALCULATE</div>
          </div>
        )}
        {result&&(
          <div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.6)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 13px",display:"flex",flexDirection:"column",gap:5}}>
            {activeBoxes.map(b=>{const n=pRef.current.filter(p=>p.id===b.id).length;const{lwy}=eff(b);return(
              <div key={b.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"rgba(200,220,240,0.85)"}}>
                <div style={{width:9,height:9,borderRadius:2,background:b.col,flexShrink:0}}/>
                <span style={{fontSize:12,fontWeight:700,color:b.col}}>{b.code}</span>
                <span>{n}/{b.qty}</span>
                <span style={{fontSize:11,color:"rgba(160,180,200,0.5)"}}>+{lwy}%</span>
              </div>
            );})}
          </div>
        )}
        <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"rgba(140,160,180,0.25)",letterSpacing:1,whiteSpace:"nowrap",pointerEvents:"none"}}>
          left drag · rotate &nbsp;|&nbsp; right drag · pan &nbsp;|&nbsp; scroll · zoom
        </div>
      </div>
    </div>
  );
}
