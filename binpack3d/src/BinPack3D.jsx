import { useState, useRef, useEffect, useCallback, useMemo } from "react";

const TYPE_COLS = {
  A:"#3b82f6", GTX20:"#ef4444", B:"#22c55e", C:"#f59e0b",
  D:"#a855f7", E:"#06b6d4",    F:"#f97316", G:"#ec4899",
  H:"#84cc16", I:"#14b8a6",    J:"#f43f5e", K:"#0ea5e9", M:"#8b5cf6",
};

const CARTON_TYPES = {
  A:{l:65.6,w:29.6,h:65.6}, GTX20:{l:68.6,w:16.6,h:77.6},
  B:{l:87.0,w:47.0,h:62.0}, C:{l:86.6,w:46.6,h:81.6},
  D:{l:86.6,w:24.6,h:106.0},E:{l:63.6,w:54.6,h:54.6},
  F:{l:63.6,w:55.6,h:38.6}, G:{l:72.6,w:42.6,h:54.6},
  H:{l:63.6,w:55.6,h:60.6}, I:{l:39.0,w:33.0,h:42.0},
  J:{l:40.0,w:33.0,h:44.6}, K:{l:92.2,w:39.5,h:33.2},
  M:{l:68.0,w:33.6,h:29.4},
};

const CATALOGUE = [
  {code:"A",    desc:"15L Tubes",           l:65.6,w:29.6,h:65.6},
  {code:"GTX20",desc:"20L GTX Tube",        l:68.6,w:16.6,h:77.6},
  {code:"B",    desc:"25L Tubes",           l:87.0,w:47.0,h:62.0},
  {code:"C",    desc:"34L Tubes",           l:86.6,w:46.6,h:81.6},
  {code:"D",    desc:"45L Tubes",           l:86.6,w:24.6,h:106.0},
  {code:"E",    desc:"600 Series End Caps", l:63.6,w:54.6,h:54.6},
  {code:"F",    desc:"GTX End Cap",         l:63.6,w:55.6,h:38.6},
  {code:"G",    desc:"800 Series End Caps", l:72.6,w:42.6,h:54.6},
  {code:"H",    desc:"GTX End Cap w/ Door", l:63.6,w:55.6,h:60.6},
  {code:"I",    desc:"Accessories",         l:39.0,w:33.0,h:42.0},
  {code:"J",    desc:"GTX Accessories",     l:40.0,w:33.0,h:44.6},
  {code:"K",    desc:"REVO Float Half",     l:92.2,w:39.5,h:33.2},
  {code:"M",    desc:"Locking Bar",         l:68.0,w:33.6,h:29.4},
];

const CONTAINERS = {
  c20ft: {label:"20ft Standard",  L:590,  W:235, H:236},
  c40hc: {label:"40ft High Cube", L:1203, W:235, H:269},
  custom:{label:"Custom",         L:590,  W:235, H:236},
};

const PALLETS = {
  au:    {label:"AU 116×116", L:116, W:116, maxH:180, maxWt:1000, palletWt:25},
  eur:   {label:"EUR 120×80", L:120, W:80,  maxH:180, maxWt:800, palletWt:20},
  us:    {label:"US 122×102", L:122, W:102, maxH:180, maxWt:1000, palletWt:27},
  custom:{label:"Custom",     L:116, W:116, maxH:180, maxWt:1000, palletWt:25},
};

const SKUS = [
  {sku:"1011",desc:"15L Tube 3mm",       cat:"Basket Tubes",    packSize:25,   cartonType:"A",    cartonWt:15.60,cpp:24},
  {sku:"1012",desc:"15L Tube 6mm",       cat:"Basket Tubes",    packSize:25,   cartonType:"A",    cartonWt:14.80,cpp:24},
  {sku:"1013",desc:"15L Tube 12mm",      cat:"Basket Tubes",    packSize:25,   cartonType:"A",    cartonWt:12.10,cpp:24},
  {sku:"1014",desc:"15L Tube 20mm",      cat:"Basket Tubes",    packSize:25,   cartonType:"A",    cartonWt:10.90,cpp:24},
  {sku:"1022",desc:"GTX Tube 6mm",       cat:"Basket Tubes",    packSize:20,   cartonType:"GTX20",cartonWt:17.60,cpp:24},
  {sku:"1023",desc:"GTX Tube 12mm",      cat:"Basket Tubes",    packSize:20,   cartonType:"GTX20",cartonWt:15.70,cpp:24},
  {sku:"1033",desc:"25L Tube 12mm",      cat:"Basket Tubes",    packSize:20,   cartonType:"B",    cartonWt:14.37,cpp:12},
  {sku:"1034",desc:"25L Tube 20mm",      cat:"Basket Tubes",    packSize:20,   cartonType:"B",    cartonWt:15.20,cpp:12},
  {sku:"1043",desc:"34L Tube 12mm",      cat:"Basket Tubes",    packSize:20,   cartonType:"C",    cartonWt:17.70,cpp:10},
  {sku:"1044",desc:"34L Tube 20mm",      cat:"Basket Tubes",    packSize:20,   cartonType:"C",    cartonWt:18.40,cpp:10},
  {sku:"1053",desc:"45L Tube 12mm",      cat:"Basket Tubes",    packSize:10,   cartonType:"D",    cartonWt:10.50,cpp:8},
  {sku:"1054",desc:"45L Tube 20mm",      cat:"Basket Tubes",    packSize:10,   cartonType:"D",    cartonWt:12.30,cpp:8},
  {sku:"2112",desc:"SL 600 EC 6mm",      cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:10.70,cpp:12},
  {sku:"2113",desc:"SL 600 EC 12mm",     cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:10.50,cpp:12},
  {sku:"2114",desc:"SL 600 EC 20mm",     cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:10.20,cpp:12},
  {sku:"2122",desc:"GTX 600 EC 6mm",     cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:11.20,cpp:20},
  {sku:"2123",desc:"GTX 600 EC 12mm",    cat:"End Caps",        packSize:100,  cartonType:"F",    cartonWt:9.60, cpp:20},
  {sku:"2411",desc:"Prem 600 EC 3mm",    cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:19.60,cpp:12},
  {sku:"2412",desc:"Prem 600 EC 6mm",    cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:20.50,cpp:12},
  {sku:"2413",desc:"Prem 600 EC 12mm",   cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:19.30,cpp:12},
  {sku:"2414",desc:"Prem 600 EC 20mm",   cat:"End Caps",        packSize:100,  cartonType:"E",    cartonWt:19.50,cpp:12},
  {sku:"2513",desc:"SL 800 EC 12mm",     cat:"End Caps",        packSize:40,   cartonType:"G",    cartonWt:9.90, cpp:12},
  {sku:"2514",desc:"SL 800 EC 20mm",     cat:"End Caps",        packSize:40,   cartonType:"G",    cartonWt:9.40, cpp:12},
  {sku:"2533",desc:"Prem 800 EC 12mm",   cat:"End Caps",        packSize:40,   cartonType:"G",    cartonWt:12.50,cpp:12},
  {sku:"2534",desc:"Prem 800 EC 20mm",   cat:"End Caps",        packSize:40,   cartonType:"G",    cartonWt:12.60,cpp:12},
  {sku:"3110",desc:"SL 600 Blank",       cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:18.40,cpp:12},
  {sku:"3112",desc:"SL 600 w/Door 6mm",  cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:16.50,cpp:12},
  {sku:"3113",desc:"SL 600 w/Door 12mm", cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:15.70,cpp:12},
  {sku:"3114",desc:"SL 600 w/Door 20mm", cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:16.10,cpp:12},
  {sku:"3122",desc:"GTX 600 w/Door 6mm", cat:"End Caps (Door)", packSize:100,  cartonType:"H",    cartonWt:19.40,cpp:12},
  {sku:"3123",desc:"GTX 600 w/Door 12mm",cat:"End Caps (Door)", packSize:100,  cartonType:"H",    cartonWt:17.70,cpp:12},
  {sku:"3312",desc:"SL IL 600 w/D 6mm",  cat:"End Caps (Door)", packSize:90,   cartonType:"E",    cartonWt:16.60,cpp:10},
  {sku:"3313",desc:"SL IL 600 w/D 12mm", cat:"End Caps (Door)", packSize:90,   cartonType:"E",    cartonWt:16.40,cpp:10},
  {sku:"3314",desc:"SL IL 600 w/D 20mm", cat:"End Caps (Door)", packSize:90,   cartonType:"E",    cartonWt:15.70,cpp:10},
  {sku:"3322",desc:"SL Float EC 6mm",    cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:17.30,cpp:12},
  {sku:"3323",desc:"SL Float EC 12mm",   cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:16.70,cpp:12},
  {sku:"3324",desc:"SL Float EC 20mm",   cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:16.90,cpp:12},
  {sku:"3411",desc:"Prem 600 w/D 3mm",   cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:25.60,cpp:12},
  {sku:"3412",desc:"Prem 600 w/D 6mm",   cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:24.80,cpp:12},
  {sku:"3413",desc:"Prem 600 w/D 12mm",  cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:23.80,cpp:12},
  {sku:"3414",desc:"Prem 600 w/D 20mm",  cat:"End Caps (Door)", packSize:100,  cartonType:"E",    cartonWt:23.90,cpp:12},
  {sku:"3513",desc:"SL 800 w/D 12mm",    cat:"End Caps (Door)", packSize:40,   cartonType:"G",    cartonWt:14.50,cpp:12},
  {sku:"3514",desc:"SL 800 w/D 20mm",    cat:"End Caps (Door)", packSize:40,   cartonType:"G",    cartonWt:14.10,cpp:12},
  {sku:"3533",desc:"Prem 800 w/D 12mm",  cat:"End Caps (Door)", packSize:40,   cartonType:"G",    cartonWt:16.10,cpp:12},
  {sku:"3534",desc:"Prem 800 w/D 20mm",  cat:"End Caps (Door)", packSize:40,   cartonType:"G",    cartonWt:15.80,cpp:12},
  {sku:"5001",desc:"Standard Post Riser",cat:"Post Risers",     packSize:1000, cartonType:"I",    cartonWt:12.80,cpp:48},
  {sku:"5100",desc:"Wide Body Riser 11mm",cat:"Post Risers",    packSize:800,  cartonType:"I",    cartonWt:15.70,cpp:48},
  {sku:"5101",desc:"Wide Body Riser 13mm",cat:"Post Risers",    packSize:800,  cartonType:"I",    cartonWt:13.90,cpp:48},
  {sku:"4101",desc:"Basket Clip 10.8mm",  cat:"Basket Clips",   packSize:500,  cartonType:"I",    cartonWt:13.50,cpp:48},
  {sku:"4121",desc:"30mm Solid 600 Rot",  cat:"Basket Clips",   packSize:120,  cartonType:"I",    cartonWt:8.00, cpp:48},
  {sku:"4123",desc:"30mm Solid 800 Rot",  cat:"Basket Clips",   packSize:120,  cartonType:"I",    cartonWt:8.10, cpp:48},
  {sku:"4210",desc:"Ext Clip 9mm",        cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:11.10,cpp:48},
  {sku:"4211",desc:"Ext Clip 10.8mm",     cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:11.20,cpp:48},
  {sku:"4310",desc:"Univ Clip 0° 9mm",    cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:13.30,cpp:48},
  {sku:"4311",desc:"Univ Clip 0° 10.8mm", cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:11.40,cpp:48},
  {sku:"4410",desc:"Univ Clip 90° 9mm",   cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:13.70,cpp:48},
  {sku:"4411",desc:"Univ Clip 90° 10.8mm",cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:13.70,cpp:48},
  {sku:"4510",desc:"Flexi Clip 9mm",      cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:12.40,cpp:48},
  {sku:"4511",desc:"Flexi Clip 10.8mm",   cat:"Basket Clips",   packSize:400,  cartonType:"I",    cartonWt:12.70,cpp:48},
  {sku:"4514",desc:"Flexi Clip 20mm 600F",cat:"Basket Clips",   packSize:200,  cartonType:"I",    cartonWt:10.40,cpp:48},
  {sku:"4515",desc:"Flexi Clip 20mm 600R",cat:"Basket Clips",   packSize:200,  cartonType:"I",    cartonWt:10.30,cpp:48},
  {sku:"4516",desc:"Flexi Clip 20mm 800R",cat:"Basket Clips",   packSize:200,  cartonType:"I",    cartonWt:10.22,cpp:48},
  {sku:"4517",desc:"Flexi Clip 20mm 800F",cat:"Basket Clips",   packSize:200,  cartonType:"I",    cartonWt:10.00,cpp:48},
  {sku:"4519",desc:"Flexi Clip 20mm 600HD",cat:"Basket Clips",  packSize:200,  cartonType:"I",    cartonWt:10.00,cpp:60},
  {sku:"4521",desc:"Broad Flexi 10.8mm",  cat:"Basket Clips",   packSize:200,  cartonType:"I",    cartonWt:10.00,cpp:48},
  {sku:"4524",desc:"Flexi Clip 30mm 600F",cat:"Basket Clips",   packSize:120,  cartonType:"I",    cartonWt:8.30, cpp:48},
  {sku:"4525",desc:"Flexi Clip 30mm 600R",cat:"Basket Clips",   packSize:120,  cartonType:"I",    cartonWt:8.30, cpp:48},
  {sku:"4526",desc:"Flexi Clip 30mm 800R",cat:"Basket Clips",   packSize:120,  cartonType:"I",    cartonWt:8.10, cpp:48},
  {sku:"4600",desc:"GTX Clip 9mm",        cat:"Basket Clips",   packSize:200,  cartonType:"J",    cartonWt:12.80,cpp:48},
  {sku:"4601",desc:"GTX Clip 11mm",       cat:"Basket Clips",   packSize:200,  cartonType:"J",    cartonWt:12.90,cpp:48},
  {sku:"4610",desc:"GTX Clip 20mm",       cat:"Basket Clips",   packSize:150,  cartonType:"J",    cartonWt:11.70,cpp:48},
  {sku:"6000",desc:"Clamp Bearing 11mm",  cat:"Accessories",    packSize:200,  cartonType:"I",    cartonWt:9.50, cpp:48},
  {sku:"6001",desc:"Clamp Bearing 1/4\"", cat:"Accessories",    packSize:200,  cartonType:"I",    cartonWt:10.60,cpp:48},
  {sku:"6002",desc:"Clamp Bearing 10.8mm",cat:"Accessories",    packSize:200,  cartonType:"I",    cartonWt:9.20, cpp:48},
  {sku:"6003",desc:"Clamp Bearing 13mm",  cat:"Accessories",    packSize:200,  cartonType:"I",    cartonWt:9.10, cpp:48},
  {sku:"6010",desc:"16mm Reo Bar Clamp",  cat:"Accessories",    packSize:120,  cartonType:"I",    cartonWt:9.00, cpp:48},
  {sku:"6011",desc:"16mm Solid Spike",    cat:"Accessories",    packSize:120,  cartonType:"I",    cartonWt:4.30, cpp:48},
  {sku:"6100",desc:"Quick Release Pin",   cat:"Accessories",    packSize:1000, cartonType:"I",    cartonWt:15.50,cpp:48},
  {sku:"6150",desc:"Universal Axle Pin",  cat:"Accessories",    packSize:1000, cartonType:"I",    cartonWt:11.50,cpp:48},
  {sku:"6200",desc:"Clip Retainer",       cat:"Accessories",    packSize:4000, cartonType:"I",    cartonWt:14.60,cpp:48},
  {sku:"6250",desc:"Premium EC Clip",     cat:"Accessories",    packSize:1000, cartonType:"I",    cartonWt:11.50,cpp:48},
  {sku:"6500",desc:"Trestle Clamp",       cat:"Accessories",    packSize:300,  cartonType:"I",    cartonWt:8.70, cpp:48},
  {sku:"6600",desc:"Locking Bar",         cat:"Accessories",    packSize:100,  cartonType:"M",    cartonWt:14.60,cpp:24},
  {sku:"6601",desc:"GTX Clip Lock",       cat:"Accessories",    packSize:200,  cartonType:"J",    cartonWt:9.80, cpp:48},
  {sku:"6602",desc:"GTX ID Plate",        cat:"Accessories",    packSize:2000, cartonType:"J",    cartonWt:8.10, cpp:48},
  {sku:"6603",desc:"GTX T-Piece Lock",    cat:"Accessories",    packSize:400,  cartonType:"J",    cartonWt:15.20,cpp:48},
  {sku:"6911",desc:"Do-Nut Tensioner",    cat:"Accessories",    packSize:8,    cartonType:"I",    cartonWt:8.40, cpp:250},
  {sku:"9101",desc:"3.3L Float Cover",    cat:"Float/REVO",     packSize:22,   cartonType:"A",    cartonWt:7.90, cpp:24},
  {sku:"9103",desc:"3.3L Float Pin",      cat:"Float/REVO",     packSize:2000, cartonType:"I",    cartonWt:10.80,cpp:48},
  {sku:"9210",desc:"REVO Float Half (2)", cat:"Float/REVO",     packSize:10,   cartonType:"K",    cartonWt:11.40,cpp:20},
  {sku:"9221",desc:"REVO Pivot Chassis",  cat:"Float/REVO",     packSize:25,   cartonType:"H",    cartonWt:14.50,cpp:12},
  {sku:"9240",desc:"REVO Latch Bracket",  cat:"Float/REVO",     packSize:200,  cartonType:"I",    cartonWt:7.00, cpp:48},
  {sku:"9251",desc:"REVO Spacer Assembly",cat:"Float/REVO",     packSize:100,  cartonType:"F",    cartonWt:16.70,cpp:20},
  {sku:"9260",desc:"REVO Latch Handle",   cat:"Float/REVO",     packSize:200,  cartonType:"J",    cartonWt:8.80, cpp:48},
  {sku:"9280",desc:"REVO Float Lock Blk", cat:"Float/REVO",     packSize:4000, cartonType:"I",    cartonWt:12.30,cpp:48},
];

const CATEGORIES = ["All",...[...new Set(SKUS.map(s=>s.cat))]];
const makeBoxes = ()=>CATALOGUE.map(c=>({id:c.code,code:c.code,name:c.desc,l:c.l,w:c.w,h:c.h,qty:0,col:TYPE_COLS[c.code]||"#888",lwy:null}));

function solve(cL,cW,cH,items){
  const placed=[],pts=[{x:0,z:0}];
  const orients=(l,w,h)=>{const s=new Set(),o=[];for(const r of[[l,w,h],[l,h,w],[w,l,h],[w,h,l],[h,l,w],[h,w,l]]){const k=r.join();if(!s.has(k)){s.add(k);o.push(r);}}return o;};
  const groundY=(x,z,lx,lz)=>{if(x<0||z<0||x+lx>cL+.01||z+lz>cW+.01)return null;let y=0;for(const p of placed)if(p.x<x+lx-.01&&p.x+p.lx>x+.01&&p.z<z+lz-.01&&p.z+p.lz>z+.01)y=Math.max(y,p.y+p.ly);return y;};
  const addPt=(x,z)=>{if(x<cL&&z<cW&&x>=0&&z>=0&&!pts.find(p=>Math.abs(p.x-x)<.01&&Math.abs(p.z-z)<.01))pts.push({x,z});};
  const unpacked=[];
  for(const item of [...items].sort((a,b)=>b.eL*b.eW*b.eH-a.eL*a.eW*a.eH)){
    let best=null,bs=Infinity;
    for(const pt of pts)for(const [lx,ly,lz] of orients(item.eL,item.eW,item.eH)){const y=groundY(pt.x,pt.z,lx,lz);if(y===null||y+ly>cH+.01)continue;const sc=y*1e8+pt.x*1e4+pt.z;if(sc<bs){bs=sc;best={x:pt.x,y,z:pt.z,lx,ly,lz};}}
    if(best){placed.push({...item,...best});addPt(best.x+best.lx,best.z);addPt(best.x,best.z+best.lz);addPt(best.x+best.lx,best.z+best.lz);}
    else unpacked.push(item);
  }
  return{placed,unpacked};
}

function solvePallets(pL,pW,pH,maxWt,items){
  const pallets=[];let remaining=[...items];
  while(remaining.length>0&&pallets.length<60){
    let wt=0;const batch=[],leftover=[];
    for(const item of remaining){if(wt+item.wt<=maxWt){batch.push(item);wt+=item.wt;}else leftover.push(item);}
    if(batch.length===0){batch.push(remaining[0]);leftover.push(...remaining.slice(1));}
    const{placed,unpacked}=solve(pL,pW,pH,batch);
    if(placed.length===0)break;
    pallets.push({placed,weight:placed.reduce((s,p)=>s+p.wt,0)});
    remaining=[...unpacked,...leftover];
  }
  return{pallets,unplaced:remaining.length};
}

const rgb=(h,a=1)=>{const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const mix=(h,d)=>{const r=Math.min(255,Math.max(0,parseInt(h.slice(1,3),16)+d)),g=Math.min(255,Math.max(0,parseInt(h.slice(3,5),16)+d)),b=Math.min(255,Math.max(0,parseInt(h.slice(5,7),16)+d));return`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;};

function projFn(cx,cy,cz,rY,rX,zoom,W,H,pX,pY,sz){
  return(x,y,z)=>{const dx=x-cx,dy=y-cy,dz=z-cz;const rx=dx*Math.cos(rY)+dz*Math.sin(rY),rz=-dx*Math.sin(rY)+dz*Math.cos(rY);const ry2=dy*Math.cos(rX)-rz*Math.sin(rX),rz2=dy*Math.sin(rX)+rz*Math.cos(rX);const sc=400*zoom/(rz2+sz*2.5);return{sx:W/2+rx*sc+pX,sy:H/2-ry2*sc+pY,depth:rz2};};
}

function drawBoxes(ctx,p,placed){
  [...placed].map(b=>({...b,d:p(b.x+b.lx/2,b.y+b.ly/2,b.z+b.lz/2).depth})).sort((a,b)=>a.d-b.d).forEach(b=>{
    const{x,y,z,lx,ly,lz,col}=b;
    const c=[[x,y,z],[x+lx,y,z],[x+lx,y,z+lz],[x,y,z+lz],[x,y+ly,z],[x+lx,y+ly,z],[x+lx,y+ly,z+lz],[x,y+ly,z+lz]].map(([a,b2,c2])=>p(a,b2,c2));
    [{i:[4,5,6,7],d:70},{i:[0,1,5,4],d:10},{i:[1,2,6,5],d:-40},{i:[3,2,6,7],d:10},{i:[0,3,7,4],d:-40}]
      .map(f=>({...f,depth:f.i.reduce((s,i)=>s+c[i].depth,0)/4})).sort((a,b)=>a.depth-b.depth)
      .forEach(f=>{const ps=f.i.map(i=>c[i]);ctx.beginPath();ctx.moveTo(ps[0].sx,ps[0].sy);ps.slice(1).forEach(v=>ctx.lineTo(v.sx,v.sy));ctx.closePath();ctx.fillStyle=rgb(mix(col,f.d),0.88);ctx.fill();ctx.strokeStyle="rgba(0,0,0,0.15)";ctx.lineWidth=0.5;ctx.stroke();});
  });
}

function drawContainer(ctx,W,H,placed,cL,cW,cH,rY,rX,zoom,pX,pY){
  ctx.clearRect(0,0,W,H);
  const p=projFn(cL/2,cH/2,cW/2,rY,rX,zoom,W,H,pX,pY,Math.max(cL,cW,cH));
  const v=[[0,0,0],[cL,0,0],[cL,0,cW],[0,0,cW],[0,cH,0],[cL,cH,0],[cL,cH,cW],[0,cH,cW]].map(([a,b,c])=>p(a,b,c));
  [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(v[a].sx,v[a].sy);ctx.lineTo(v[b].sx,v[b].sy);ctx.strokeStyle="rgba(60,150,255,0.4)";ctx.lineWidth=1;ctx.stroke();});
  ctx.beginPath();[0,1,2,3].forEach((i,j)=>j?ctx.lineTo(v[i].sx,v[i].sy):ctx.moveTo(v[i].sx,v[i].sy));ctx.closePath();ctx.fillStyle="rgba(0,20,50,0.3)";ctx.fill();
  drawBoxes(ctx,p,placed);
}

function drawPallets(ctx,W,H,pallets,pL,pW,pH,rY,rX,zoom,pX,pY){
  ctx.clearRect(0,0,W,H);if(!pallets.length)return;
  const BASE=12,GAP=25,totalX=pallets.length*(pL+GAP)-GAP;
  const p=projFn(totalX/2,(BASE+pH)/2,pW/2,rY,rX,zoom,W,H,pX,pY,Math.max(totalX,pW,BASE+pH));
  pallets.forEach(({placed},pi)=>{
    const ox=pi*(pL+GAP);
    const bv=[[ox,0,0],[ox+pL,0,0],[ox+pL,0,pW],[ox,0,pW],[ox,BASE,0],[ox+pL,BASE,0],[ox+pL,BASE,pW],[ox,BASE,pW]].map(([x,y,z])=>p(x,y,z));
    [[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].forEach((face,fi)=>{const ps=face.map(i=>bv[i]);ctx.beginPath();ctx.moveTo(ps[0].sx,ps[0].sy);ps.slice(1).forEach(v=>ctx.lineTo(v.sx,v.sy));ctx.closePath();ctx.fillStyle=`rgba(160,110,50,${[0.75,0.5,0.5,0.35,0.35][fi]})`;ctx.fill();ctx.strokeStyle="rgba(100,60,20,0.6)";ctx.lineWidth=0.5;ctx.stroke();});
    const wv=[[ox,BASE,0],[ox+pL,BASE,0],[ox+pL,BASE,pW],[ox,BASE,pW],[ox,BASE+pH,0],[ox+pL,BASE+pH,0],[ox+pL,BASE+pH,pW],[ox,BASE+pH,pW]].map(([x,y,z])=>p(x,y,z));
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(wv[a].sx,wv[a].sy);ctx.lineTo(wv[b].sx,wv[b].sy);ctx.strokeStyle="rgba(60,150,255,0.2)";ctx.lineWidth=0.7;ctx.stroke();});
    const top=wv[4];ctx.fillStyle="rgba(180,200,220,0.5)";ctx.font="bold 11px monospace";ctx.textAlign="center";ctx.fillText(`P${pi+1}`,top.sx,top.sy-6);
    drawBoxes(ctx,p,placed.map(b=>({...b,x:ox+b.x,y:BASE+b.y})));
  });
}

const pad=(v,pct)=>parseFloat((v*(1+pct/100)).toFixed(1));

export default function BinPack3D(){
  const[mode,      setMode]      = useState("container");
  const[inputMode, setInputMode] = useState("skus");
  const[contType,  setContType]  = useState("c20ft");
  const[cont,      setCont]      = useState({L:590,W:235,H:236});
  const[palletType,setPalletType]= useState("au");
  const[pallet,    setPallet]    = useState({L:116,W:116,maxH:180,maxWt:1000,palletWt:25});
  const[gl,        setGl]        = useState(5);
  const[skuOrders, setSkuOrders] = useState({});
  const[boxes,     setBoxes]     = useState(makeBoxes());
  const[result,    setResult]    = useState(null);
  const[busy,      setBusy]      = useState(false);
  const[catFilter, setCatFilter] = useState("All");
  const[search,    setSearch]    = useState("");

  const cvRef=useRef(),vpRef=useRef();
  const cam=useRef({rY:.5,rX:.4,zoom:5,pX:0,pY:0});
  const drag=useRef(null),modeRef=useRef(mode);
  const pRef=useRef([]),palletsRef=useRef([]);
  const cRef=useRef([590,235,236]),palletRef=useRef([116,116,180]);

  useEffect(()=>{modeRef.current=mode;},[mode]);

  const eff=b=>{const lwy=b.lwy??gl;return{el:pad(b.l,lwy),ew:pad(b.w,lwy),eh:pad(b.h,lwy),lwy};};

  const cartonItems=useMemo(()=>{
    if(inputMode==="skus"){
      const items=[];
      for(const[sku,units] of Object.entries(skuOrders)){
        if(!units||units<=0)continue;
        const s=SKUS.find(x=>x.sku===sku);if(!s)continue;
        const dims=CARTON_TYPES[s.cartonType];if(!dims)continue;
        const cartons=Math.ceil(units/s.packSize);
        const eL=pad(dims.l,gl),eW=pad(dims.w,gl),eH=pad(dims.h,gl);
        for(let i=0;i<Math.min(cartons,300);i++)
          items.push({id:sku,sku:s.sku,name:s.desc,cartonType:s.cartonType,col:TYPE_COLS[s.cartonType]||"#888",eL,eW,eH,wt:s.cartonWt});
      }
      return items;
    } else {
      const items=[];
      boxes.filter(b=>b.qty>0).forEach(b=>{
        const{el,ew,eh}=eff(b);
        for(let i=0;i<Math.min(b.qty,500);i++)
          items.push({id:b.code,sku:b.code,name:b.name,cartonType:b.code,col:b.col,eL:el,eW:ew,eH:eh,wt:0});
      });
      return items;
    }
  },[inputMode,skuOrders,boxes,gl]);

  const activeSkus  = useMemo(()=>SKUS.filter(s=>(skuOrders[s.sku]||0)>0),[skuOrders]);
  const activeBoxes = useMemo(()=>boxes.filter(b=>b.qty>0),[boxes]);
  const hasInput    = inputMode==="skus"?activeSkus.length>0:activeBoxes.length>0;
  const totalWtInput = useMemo(()=>cartonItems.reduce((s,i)=>s+i.wt,0),[cartonItems]);

  const activeTypes=useMemo(()=>{const seen=new Set(),list=[];for(const i of cartonItems)if(!seen.has(i.cartonType)){seen.add(i.cartonType);list.push(i.cartonType);}return list;},[cartonItems]);
  const filteredSkus=useMemo(()=>SKUS.filter(s=>{const inCat=catFilter==="All"||s.cat===catFilter;const q=search.toLowerCase();return inCat&&(!q||s.sku.toLowerCase().includes(q)||s.desc.toLowerCase().includes(q));}),[catFilter,search]);

  const redraw=useCallback(()=>{
    const cv=cvRef.current;if(!cv)return;
    const{rY,rX,zoom,pX,pY}=cam.current;
    if(modeRef.current==="container"){const[L,W,H]=cRef.current;drawContainer(cv.getContext("2d"),cv.width,cv.height,pRef.current,L,W,H,rY,rX,zoom,pX,pY);}
    else{const[pL,pW,pH]=palletRef.current;drawPallets(cv.getContext("2d"),cv.width,cv.height,palletsRef.current,pL,pW,pH,rY,rX,zoom,pX,pY);}
  },[]);

  useEffect(()=>{
    const vp=vpRef.current;if(!vp)return;
    const ro=new ResizeObserver(()=>{const cv=cvRef.current;if(!cv)return;cv.width=vp.clientWidth;cv.height=vp.clientHeight;redraw();});
    ro.observe(vp);return()=>ro.disconnect();
  },[redraw]);

  useEffect(()=>{cam.current={rY:.5,rX:.4,zoom:5,pX:0,pY:0};redraw();},[mode,redraw]);

  const onDown=e=>{drag.current={mx:e.clientX,my:e.clientY,btn:e.button};};
  const onMove=useCallback(e=>{if(!drag.current)return;const dx=e.clientX-drag.current.mx,dy=e.clientY-drag.current.my;drag.current.mx=e.clientX;drag.current.my=e.clientY;if(drag.current.btn===0){cam.current.rY+=dx*.008;cam.current.rX=Math.max(-.5,Math.min(1.4,cam.current.rX-dy*.008));}else{cam.current.pX+=dx;cam.current.pY+=dy;}redraw();},[redraw]);
  const onUp=()=>drag.current=null;
  const onWheel=useCallback(e=>{cam.current.zoom=Math.max(.05,Math.min(8,cam.current.zoom*(1-e.deltaY*.001)));redraw();},[redraw]);

  const handleContType=key=>{setContType(key);if(key!=="custom")setCont({L:CONTAINERS[key].L,W:CONTAINERS[key].W,H:CONTAINERS[key].H});};
  const handleContDim=(k,v)=>{setContType("custom");setCont(c=>({...c,[k]:+v}));};
  const handlePalletType=key=>{setPalletType(key);if(key!=="custom")setPallet({L:PALLETS[key].L,W:PALLETS[key].W,maxH:PALLETS[key].maxH,maxWt:PALLETS[key].maxWt,palletWt:PALLETS[key].palletWt});};
  const handlePalletDim=(k,v)=>{setPalletType("custom");setPallet(p=>({...p,[k]:+v}));};
  const setOrder=(sku,val)=>{const n=val===""?0:Math.max(0,parseInt(val)||0);setSkuOrders(prev=>n===0?Object.fromEntries(Object.entries(prev).filter(([k])=>k!==sku)):{...prev,[sku]:n});};
  const upBox=(id,f,v)=>setBoxes(bs=>bs.map(b=>b.id!==id?b:{...b,[f]:f==="name"?v:(v===""||v===null?null:Math.max(0,+v))}));
  const clearAll=()=>inputMode==="skus"?setSkuOrders({}):setBoxes(makeBoxes());

  const runPack=()=>{
    if(!cartonItems.length)return;setBusy(true);
    setTimeout(()=>{
      if(mode==="container"){
        const{placed,unpacked}=solve(cont.L,cont.W,cont.H,cartonItems);
        const usedV=placed.reduce((s,p)=>s+p.lx*p.ly*p.lz,0);
        setResult({type:"container",placed:placed.length,total:cartonItems.length,unpacked:unpacked.length,pct:usedV/(cont.L*cont.W*cont.H)*100,totalWt:placed.reduce((s,p)=>s+p.wt,0)});
        pRef.current=placed;cRef.current=[cont.L,cont.W,cont.H];palletsRef.current=[];
      } else {
        const{pallets,unplaced}=solvePallets(pallet.L,pallet.W,pallet.maxH,pallet.maxWt,cartonItems);
        const itemWt=pallets.reduce((s,p)=>s+p.weight,0);
        setResult({type:"pallet",palletCount:pallets.length,totalCartons:cartonItems.length,
          totalItemWt:itemWt,
          totalWt:itemWt+(pallets.length*pallet.palletWt),
          totalVol:cartonItems.reduce((s,i)=>s+i.eL*i.eW*i.eH,0)/1e6,unplaced});
        pRef.current       = [];     
        palletsRef.current = pallets;
        palletRef.current  = [pallet.L, pallet.W, pallet.maxH];
      }
      redraw();setBusy(false);
    },10);
  };

  const lcol=gl<=5?"#22c55e":gl<=15?"#f59e0b":"#ef4444";
  const contVolM3=((cont.L*cont.W*cont.H)/1e6).toFixed(1);
  const modeBtn=a=>({flex:1,padding:"7px 4px",fontSize:11,fontFamily:"var(--font-mono)",fontWeight:a?600:400,background:a?"#3b82f6":"var(--color-background-secondary)",color:a?"#fff":"var(--color-text-secondary)",border:`0.5px solid ${a?"#3b82f6":"var(--color-border-secondary)"}`,borderRadius:6,cursor:"pointer",transition:"all .15s"});
  const inputBtn=a=>({flex:1,padding:"5px 4px",fontSize:11,fontFamily:"var(--font-mono)",fontWeight:a?600:400, background:a?"#3b82f6":"var(--color-background-secondary)", color:a?"#fff":"var(--color-text-secondary)", border:`0.5px solid ${a?"#3b82f6":"var(--color-border-secondary)"}`, borderRadius:6,cursor:"pointer",transition:"all .15s"});

  return(
    <div style={{display:"flex",height:"100vh",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden",fontFamily:"var(--font-mono)",fontSize:12}}>

      {/* ── Sidebar ── */}
      <div style={{width:400,flexShrink:0,background:"var(--color-background-secondary)",borderRight:"0.5px solid var(--color-border-tertiary)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Header */}
        <div style={{padding:"8px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>BinPack 3D</div>
          <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:2}}>SEAPA container &amp; pallet loading optimizer</div>
        </div>

        {/* Shipping mode */}
        <div style={{padding:"6px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
          <div style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:5,letterSpacing:.5}}>SHIPPING MODE</div>
          <div style={{display:"flex",gap:4}}>
            <button style={modeBtn(mode==="container")} onClick={()=>setMode("container")}>📦 Container (FCL)</button>
            <button style={modeBtn(mode==="pallet")}    onClick={()=>setMode("pallet")}>🪵 Pallet (LCL/LTL)</button>
          </div>
        </div>

        {/* Container / Pallet config */}
        {mode==="container"?(
          <div style={{padding:"6px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
            <div style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:6,letterSpacing:.5}}>CONTAINER TYPE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8}}>
              {Object.entries(CONTAINERS).map(([key,ct])=>{const a=contType===key;return(<button key={key} onClick={()=>handleContType(key)} style={{padding:"5px 4px",fontSize:11,fontFamily:"var(--font-mono)",fontWeight:a?600:400,background:a?"#3b82f6":"var(--color-background-secondary)",color:a?"#fff":"var(--color-text-secondary)",border:`0.5px solid ${a?"#3b82f6":"var(--color-border-secondary)"}`,borderRadius:6,cursor:"pointer",lineHeight:1.3}}>{ct.label}</button>);})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
              {[["L","Length"],["W","Width"],["H","Height"]].map(([k,lbl])=>(
                <div key={k}><label style={{fontSize:9,color:"var(--color-text-secondary)",display:"block",marginBottom:2}}>{lbl} (cm)</label>
                  <input type="number" min="1" value={cont[k]} onChange={e=>handleContDim(k,e.target.value)} style={{fontFamily:"var(--font-mono)",fontSize:12,padding:"3px 4px",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,width:"100%",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}/>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div style={{padding:"6px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
            <div style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:6,letterSpacing:.5}}>PALLET TYPE</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:4,marginBottom:8}}>
              {Object.entries(PALLETS).map(([key,pt])=>{const a=palletType===key;return(<button key={key} onClick={()=>handlePalletType(key)} style={{padding:"5px 3px",fontSize:10,fontFamily:"var(--font-mono)",fontWeight:a?600:400,background:a?"#3b82f6":"var(--color-background-secondary)",color:a?"#fff":"var(--color-text-secondary)",border:`0.5px solid ${a?"#3b82f6":"var(--color-border-secondary)"}`,borderRadius:6,cursor:"pointer",lineHeight:1.3}}>{pt.label}</button>);})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
              {[["L","L (cm)"],["W","W (cm)"],["maxH","Max H (cm)"],["maxWt","Max Wt (kg)"]].map(([k,lbl])=>(
                <div key={k}><label style={{fontSize:9,color:"var(--color-text-secondary)",display:"block",marginBottom:2}}>{lbl}</label>
                  <input type="number" min="1" value={pallet[k]} onChange={e=>handlePalletDim(k,e.target.value)} style={{fontFamily:"var(--font-mono)",fontSize:11,padding:"3px 4px",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,width:"100%",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input mode */}
        <div style={{padding:"6px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
          <div style={{fontSize:10,color:"var(--color-text-secondary)",marginBottom:5,letterSpacing:.5}}>INPUT MODE</div>
          <div style={{display:"flex",gap:4}}>
            <button style={inputBtn(inputMode==="skus")}    onClick={()=>setInputMode("skus")}>SKUs (by units)</button>
            <button style={inputBtn(inputMode==="cartons")} onClick={()=>setInputMode("cartons")}>Cartons (by qty)</button>
          </div>
        </div>

        {/* ── Scrollable input area ── */}
        <div style={{flex:1,overflowY:"auto",padding:"8px 12px",display:"flex",flexDirection:"column",gap:6}}>

          {/* SKU input */}
          {inputMode==="skus"&&(<>
            <input placeholder="Search SKU or description…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{fontFamily:"var(--font-mono)",fontSize:11,padding:"5px 8px",border:"0.5px solid var(--color-border-secondary)",borderRadius:6,background:"var(--color-background-primary)",color:"var(--color-text-primary)",outline:"none"}}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {CATEGORIES.map(cat=>{const a=catFilter===cat;return(<button key={cat} onClick={()=>setCatFilter(cat)} style={{fontSize:10,padding:"2px 8px",borderRadius:10,border:`0.5px solid ${a?"#3b82f6":"var(--color-border-secondary)"}`,background:a?"rgba(59,130,246,0.15)":"transparent",color:a?"#3b82f6":"var(--color-text-secondary)",cursor:"pointer",fontFamily:"var(--font-mono)"}}>{cat}</button>);})}
              {activeSkus.length>0&&<button onClick={clearAll} style={{fontSize:10,padding:"2px 8px",borderRadius:10,border:"0.5px solid var(--color-border-secondary)",background:"none",color:"var(--color-text-secondary)",cursor:"pointer",marginLeft:"auto",fontFamily:"var(--font-mono)"}}>clear all</button>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"52px minmax(0,1fr) 80px",gap:4,padding:"2px 2px 4px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
              {["SKU","Description","Units"].map(h=><span key={h} style={{fontSize:11,color:"var(--color-text-secondary)"}}>{h}</span>)}
            </div>
            {filteredSkus.map(s=>{
              const units=skuOrders[s.sku]||0,active=units>0,cartons=active?Math.ceil(units/s.packSize):0,col=TYPE_COLS[s.cartonType]||"#888";
              return(<div key={s.sku} style={{display:"grid",gridTemplateColumns:"52px minmax(0,1fr) 80px",gap:4,alignItems:"center",padding:"3px 2px",borderRadius:4,borderLeft:`2px solid ${active?col:"var(--color-border-tertiary)"}`,background:active?"var(--color-background-primary)":"transparent",transition:"all .15s"}}>
                <div style={{fontSize:10,fontWeight:600,color:active?col:"var(--color-text-secondary)",background:active?`${col}18`:"transparent",borderRadius:3,padding:"1px 3px",textAlign:"center",lineHeight:1.4}}>
                  <div>{s.sku}</div><div style={{fontSize:8,opacity:.7}}>{s.cartonType}</div>
                </div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:active?600:400,color:active?"var(--color-text-primary)":"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.desc}</div>
                  {active?<div style={{fontSize:10,color:col,marginTop:1}}>→ {cartons} ctn{cartons!==1?"s":""} · {(cartons*s.cartonWt).toFixed(1)} kg</div>
                        :<div style={{fontSize:9,color:"var(--color-text-secondary)",marginTop:1}}>pack {s.packSize} · {s.cartonWt} kg/ctn</div>}
                </div>
                <input type="number" min="0" value={units||""} placeholder="0" onChange={e=>setOrder(s.sku,e.target.value)}
                  style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:active?600:400,padding:"2px 4px",border:`0.5px solid ${active?col:"var(--color-border-tertiary)"}`,borderRadius:4,background:"var(--color-background-primary)",color:active?col:"var(--color-text-secondary)",textAlign:"center",outline:"none",width:"100%"}}/>
              </div>);
            })}
            {filteredSkus.length===0&&<div style={{fontSize:11,color:"var(--color-text-secondary)",textAlign:"center",padding:16}}>No SKUs match.</div>}
          </>)}

          {/* Carton input */}
          {inputMode==="cartons"&&(<>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
              <span style={{fontSize:14,color:"var(--color-text-secondary)",letterSpacing:.5}}>SET QTY — {activeBoxes.length} type{activeBoxes.length!==1?"s":""} active</span>
              <button onClick={clearAll} style={{fontSize:11,color:"var(--color-text-secondary)",background:"none",border:"0.5px solid var(--color-border-secondary)",borderRadius:4,padding:"2px 7px",cursor:"pointer"}}>clear all</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"36px minmax(0,1fr) 72px",gap:4,padding:"0 2px 4px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
              <span style={{fontSize:14,color:"var(--color-text-secondary)",textAlign:"center"}}>Code</span>
              <span style={{fontSize:14,color:"var(--color-text-secondary)"}}>Description</span>
              <span style={{fontSize:14,color:"var(--color-text-secondary)",textAlign:"center"}}>Qty</span>
            </div>
            {boxes.map(b=>{const active=b.qty>0;return(
              <div key={b.id} style={{display:"grid",gridTemplateColumns:"36px minmax(0,1fr) 72px",gap:4,alignItems:"center",padding:"3px 2px",borderRadius:4,borderLeft:`2px solid ${active?b.col:"var(--color-border-tertiary)"}`,background:active?"var(--color-background-primary)":"transparent",transition:"border-color .15s,background .15s"}}>
                <div style={{textAlign:"center",fontSize:11,fontWeight:600,color:active?b.col:"var(--color-text-secondary)",background:active?`${b.col}18`:"transparent",borderRadius:3,padding:"1px 0"}}>{b.code}</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:active?600:400,color:active?"var(--color-text-primary)":"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</div>
                  <div style={{fontSize:11,color:"var(--color-text-secondary)",marginTop:1}}>{b.l}×{b.w}×{b.h} cm</div>
                </div>
                <input type="number" min="0" max="500" value={b.qty} onChange={e=>upBox(b.id,"qty",e.target.value)}
                  style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:active?600:400,padding:"1px 2px",border:`0.5px solid ${active?b.col:"var(--color-border-tertiary)"}`,borderRadius:3,background:"var(--color-background-primary)",color:active?b.col:"var(--color-text-secondary)",textAlign:"center",outline:"none",width:"100%"}}/>
              </div>
            );})}
          </>)}
        </div>

        {/* ── Bottom panel: Leeway + Summary + Run + Stats ── */}
        <div style={{flexShrink:0,borderTop:"0.5px solid var(--color-border-tertiary)",maxHeight:"45vh",overflowY:"auto"}}>

          {/* Leeway */}
          <div style={{padding:"6px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
              <span style={{fontSize:10,color:"var(--color-text-secondary)",letterSpacing:.5,flex:1}}>CARTON LEEWAY</span>
              <span style={{fontSize:10,color:lcol,fontWeight:600}}>{gl}%</span>
              <span style={{fontSize:10,color:"var(--color-text-secondary)"}}>{gl===0?"exact":gl<=5?"minimal":gl<=12?"standard":gl<=20?"generous":"large"}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input type="range" min="0" max="30" step="0.5" value={gl} onChange={e=>setGl(+e.target.value)} style={{flex:1}}/>
              <input type="number" min="0" max="30" step="0.5" value={gl} onChange={e=>setGl(Math.min(30,Math.max(0,+e.target.value)))}
                style={{fontFamily:"var(--font-mono)",fontSize:13,fontWeight:600,width:42,padding:"2px 4px",border:"0.5px solid var(--color-border-secondary)",borderRadius:5,textAlign:"center",color:lcol,background:"var(--color-background-primary)"}}/>
              <span style={{fontSize:11,color:"var(--color-text-secondary)"}}>%</span>
            </div>
            <div style={{height:2,background:"var(--color-background-tertiary)",borderRadius:2,overflow:"hidden",marginTop:5}}>
              <div style={{height:"100%",width:`${(gl/30)*100}%`,background:lcol,transition:"width .2s,background .2s"}}/>
            </div>
          </div>

          {/* Summary */}
          {hasInput&&(
            <div style={{padding:"6px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {[
                  ["SKUs / Types", inputMode==="skus"?activeSkus.length:activeBoxes.length],
                  ["Cartons",      cartonItems.length],
                  ...(inputMode==="skus"?[
                    ["kg",  totalWtInput.toFixed(1)],
                    ["lbs", (totalWtInput*2.205).toFixed(1)],
                  ]:[["—","—"],["—","—"]]),
                ].map(([l,v])=>(
                  <div key={l} style={{background:"var(--color-background-secondary)",borderRadius:5,padding:"4px 6px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:"var(--color-text-secondary)",marginBottom:1}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--color-text-primary)"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run button */}
          <button onClick={runPack} disabled={busy||!hasInput}
            style={{display:"block",width:"calc(100% - 24px)",margin:"8px 12px 0",padding:"15px",background:!hasInput||busy?"var(--color-background-secondary)":"#3b82f6",color:"#fff",border:`0.5px solid ${!hasInput||busy?"var(--color-border-secondary)":"#3b82f6"}`,boxShadow:hasInput&&!busy?"0 0 12px rgba(59,130,246,0.35)":"none",borderRadius:8,fontSize:17,fontWeight:600,cursor:!hasInput?"not-allowed":"pointer",opacity:(!hasInput||busy)?.45:1,transition:"all .2s"}}>
            {busy?"Computing…":!hasInput?`Enter ${inputMode==="skus"?"SKU quantities":"carton quantities"} first`:`▶  Calculate ${mode==="container"?"container":"pallet"} packing`}
          </button>

          {/* Result stats */}
          <div style={{padding:"8px 12px 10px"}}>
            {mode==="container"?(
              <>
                {[["Packed",      result?.type==="container"?`${result.placed} / ${result.total}`:"—",                                                                                "var(--color-text-primary)"],
                  ["Not fitted",  result?.type==="container"?result.unpacked:"—",                                                                                                    "var(--color-text-danger,#e24b4a)"],
                  ["Utilization", result?.type==="container"?`${result.pct.toFixed(1)}%`:"—",                                                                                        "var(--color-text-success,#15803d)"],
                  ["Total weight",result?.type==="container"&&inputMode==="skus"?`${result.totalWt.toFixed(1)} kg / ${(result.totalWt*2.205).toFixed(1)} lbs`:"—",                  "var(--color-text-secondary)"],
                ].map(([l,v,c])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:11}}>
                    <span style={{color:"var(--color-text-secondary)"}}>{l}</span><span style={{fontWeight:600,color:c}}>{v}</span>
                  </div>
                ))}
                <div style={{height:3,background:"var(--color-background-tertiary)",borderRadius:2,overflow:"hidden",marginTop:6}}>
                  <div style={{height:"100%",width:`${Math.min(result?.type==="container"?result.pct:0,100)}%`,background:"#22c55e",transition:"width .5s"}}/>
                </div>
              </>
            ):(
              [["Pallets needed",   result?.type==="pallet"?result.palletCount:"—",                                                                                                  "#3b82f6"],
               ["Total cartons",    result?.type==="pallet"?result.totalCartons:"—",                                                                                                 "var(--color-text-primary)"],
               ["Item weight",      result?.type==="pallet"&&inputMode==="skus"?`${result.totalItemWt.toFixed(1)} kg / ${(result.totalItemWt*2.205).toFixed(1)} lbs`:"—",           "var(--color-text-secondary)"],
               ["Gross w/pallets",  result?.type==="pallet"&&inputMode==="skus"?`${result.totalWt.toFixed(1)} kg / ${(result.totalWt*2.205).toFixed(1)} lbs`:"—",                  "var(--color-text-secondary)"],
               ["Total volume",     result?.type==="pallet"?`${result.totalVol.toFixed(3)} m³`:"—",                                                                                 "var(--color-text-secondary)"],
               ["Unplaced cartons", result?.type==="pallet"?result.unplaced:"—",                                                                                                     "var(--color-text-danger,#e24b4a)"],
              ].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",fontSize:11}}>
                  <span style={{color:"var(--color-text-secondary)"}}>{l}</span><span style={{fontWeight:600,color:c}}>{v}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── 3D Viewport ── */}
      <div ref={vpRef} style={{flex:1,position:"relative",background:"#07090d",overflow:"hidden",cursor:"grab"}}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onWheel={onWheel} onContextMenu={e=>e.preventDefault()}>
        <canvas ref={cvRef} style={{display:"block",width:"100%",height:"100%"}}/>

        <div style={{position:"absolute",top:10,left:10,background:"rgba(0,0,0,0.55)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"5px 10px",fontSize:15,color:"rgba(180,200,220,0.7)",fontFamily:"var(--font-mono)"}}>
          {mode==="container"?`${CONTAINERS[contType]?.label??"Custom"} · ${cont.L}×${cont.W}×${cont.H} cm · ${contVolM3} m³`:`${PALLETS[palletType]?.label??"Custom"} · wt ${pallet.palletWt} kg · max ${pallet.maxH} cm · max ${pallet.maxWt} kg`}
        </div>

        {!result&&(
          <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{fontSize:56,color:"rgba(255,255,255,0.04)"}}>{mode==="container"?"▣":"⬛"}</div>
            <div style={{fontSize:11,color:"rgba(160,180,200,0.2)",marginTop:10,letterSpacing:3}}>{inputMode==="skus"?"ENTER SKUs · CALCULATE":"SET QUANTITIES · CALCULATE"}</div>
          </div>
        )}

        {result&&activeTypes.length>0&&(
          <div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.6)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 13px",display:"flex",flexDirection:"column",gap:5,maxHeight:"80vh",overflowY:"auto"}}>
            {result.type==="container"&&activeTypes.map(t=>{
              const n=pRef.current.filter(p=>p.cartonType===t).length,total=cartonItems.filter(i=>i.cartonType===t).length,col=TYPE_COLS[t]||"#888",dims=CARTON_TYPES[t];
              return(<div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:15,color:"rgba(200,220,240,0.85)"}}>
                <div style={{width:9,height:9,borderRadius:2,background:col,flexShrink:0}}/>
                <span style={{fontSize:14,fontWeight:700,color:col}}>{t}</span>
                <span>{n}/{total}</span>
                {dims&&<span style={{fontSize:13,color:"rgba(160,180,200,0.4)"}}>{dims.l}×{dims.w}×{dims.h}</span>}
              </div>);
            })}
            {result.type==="pallet"&&(<>
              {activeTypes.map(t=>{const col=TYPE_COLS[t]||"#888",dims=CARTON_TYPES[t];return(
                <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:15,color:"rgba(200,220,240,0.85)"}}>
                  <div style={{width:9,height:9,borderRadius:2,background:col,flexShrink:0}}/>
                  <span style={{fontSize:14,fontWeight:700,color:col}}>{t}</span>
                  {dims&&<span style={{fontSize:13,color:"rgba(160,180,200,0.4)"}}>{dims.l}×{dims.w}×{dims.h}</span>}
                </div>);
              })}
              <div style={{marginTop:4,paddingTop:4,borderTop:"0.5px solid rgba(255,255,255,0.08)",fontSize:15,color:"rgba(60,150,255,0.8)",fontWeight:700}}>{result.palletCount} pallet{result.palletCount!==1?"s":""}</div>
            </>)}
          </div>
        )}

        <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"rgba(140,160,180,0.25)",letterSpacing:1,whiteSpace:"nowrap",pointerEvents:"none"}}>
          left drag · rotate &nbsp;|&nbsp; right drag · pan &nbsp;|&nbsp; scroll · zoom
        </div>
      </div>
    </div>
  );
}
