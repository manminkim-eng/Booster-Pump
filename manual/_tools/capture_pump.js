// 설비펌프 용량 자동선정 시스템 매뉴얼 화면 캡처 — usage: node capture_pump.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값 — 앱에서 읽음)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8898;
/* 예제 A = 업무시설 10층 사옥 — 8종 모두 산정
   난방 350,000 kcal/h · ΔT 10 / 냉방 300,000 kcal/h · ΔT 5 (왕복 200 m · 0.02 mAq/m · 코일 2 m · 보일러 5 / 냉동기 3 m · 안전율 10 % · η 0.40 · 여유율 10 %)
   PIT 유입 100 LPM · 집수조 3,000 ℓ / 우수 100 mm/h × 260 ㎡ · 2대 (층고 6 m · 20 m · 0.05 · 10 % · η 0.40 · 10 %)
   급탕 순환 200 m × 30 W/m · Δt 5 / 재순환 225,000 kcal/h · Δt 10 (R 20 · I 120 · K 1.0 · η 0.35 · 10 %)
   양수 6,000 ℓ/h · hₐ 45 m · 60 m · 0.03 · hₒ 5.6 m / 부스터 400 LPM ÷ 2대 · hₐ 40 m · 80 m · hₒ 10.2 m (안전율 10 % · η 0.55 · 10 %)
   예제 B = 부스터 hₐ 25 m (토출압 550 kPa 미만) */
const FREEZE=`(()=>{const T=new Date(2026,9,14,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();['pwa-dismissed','pwa-banner-dismissed','pwa-welcome','pump-pwa-dismissed'].forEach(k=>localStorage.setItem(k,'1'))}catch(e){}})()`;
const HIDE='#pwaBanner,.pwa-banner,#iosModal,.ios-modal,#toastEl,.toast,#netToast,.net-toast,.pwa-update-bar{display:none!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__card=t=>{const h=[...document.querySelectorAll('.card-tit')].find(e=>__vis(e)&&e.textContent.trim().startsWith(t));return h?h.closest('.card'):null;};
window.__find=sel=>{if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('up:')){const [a,b]=sel.slice(3).split('|');const e=[...document.querySelectorAll(a)].find(__vis);return e?e.closest(b):null;}
 if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(__vis)[+i]||null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__S=(o)=>{for(const [k,v] of Object.entries(o)){const e=document.getElementById(k);e.value=v;}};
window.__tab=i=>{const b=document.querySelectorAll('.tab-bar-inner .tb')[i];b.click();};
window.__proj=()=>{proj.name='만민 건축사 사옥 신축공사';proj.author='김만민';proj.date='2026-10-14';
 document.getElementById('projNameDisplay').textContent=proj.name;document.getElementById('projAuthorDisplay').textContent=proj.author;document.getElementById('projDateDisplay').textContent=proj.date;};
window.__F={
 heat:()=>{goPump('pumpHeat',0);__S({h_type:'line',h_load:350000,h_extra:10,h_dt:10,h_pipelen:200,h_friction:0.02,h_coil:2,h_boiler:5,h_safety:10,h_eta:0.4,h_emg:10,h_ctrl:'inverter',h_ks:'KS B 6318',h_cert:'none',h_eff_a:'',h_eff_b:''});calcHeat();},
 cool:()=>{goPump('pumpHeat',1);__S({h_type:'line',h_load:300000,h_extra:10,h_dt:5,h_pipelen:200,h_friction:0.02,h_coil:2,h_boiler:3,h_safety:10,h_eta:0.4,h_emg:10,h_ctrl:'inverter',h_ks:'KS B 6318'});calcHeat();},
 pit:()=>{goPump('pumpDrain',0);__S({d_q_pit:100,d_sump_vol:3000,d_solid_type:'50',d_height:6,d_pipelen:20,d_friction:0.05,d_safety:10,d_eta:0.4,d_emg:10});calcDrain();},
 rain:()=>{goPump('pumpDrain',1);__S({d_rain_rate:100,d_floor_area:260,d_pump_count:2,d_solid_type:'25',d_height:6,d_pipelen:20,d_friction:0.05,d_safety:10,d_eta:0.4,d_emg:10});calcDrain();},
 circ:()=>{goPump('pumpHW',0);__S({hw_loss_len:200,hw_loss_q:30,hw_loss_direct:'',hw_dt:5,hw_R:20,hw_I:120,hw_K:1.0,hw_eta:0.35,hw_emg:10,hw_ctrl:'inverter'});calcHW();},
 recirc:()=>{goPump('pumpHW',1);__S({hw_heat_cap:225000,hw_dt2:10,hw_R:20,hw_I:120,hw_K:1.0,hw_eta:0.35,hw_emg:10});calcHW();},
 ws_hoist:()=>{goPump('pumpWS',0);__S({ws_h_q:6000,ws_ha:45,ws_pipelen:60,ws_friction:0.03,ws_ho:5.6,ws_safety:10,ws_eta:0.55,ws_emg:10});calcWS();},
 ws_boost:()=>{goPump('pumpWS',1);__S({ws_b_q:400,ws_b_cnt:2,ws_ha:40,ws_pipelen:80,ws_friction:0.03,ws_ho:10.2,ws_safety:10,ws_eta:0.55,ws_emg:10});calcWS();},
 ws_boost_b:()=>{goPump('pumpWS',1);__S({ws_b_q:400,ws_b_cnt:2,ws_ha:25,ws_pipelen:80,ws_friction:0.03,ws_ho:10.2,ws_safety:10,ws_eta:0.55,ws_emg:10});calcWS();},
};
window.__quiet=f=>{const si=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(){};try{f();}finally{setTimeout(()=>{Element.prototype.scrollIntoView=si;},300);}};
window.__A=()=>__quiet(()=>{resetAll();__tab(0);__proj();['ws_boost','ws_hoist','recirc','circ','rain','pit','cool','heat'].forEach(k=>__F[k]());window.scrollTo(0,0);});
window.__show=k=>__quiet(()=>{__F[k]();window.scrollTo(0,0);});
window.__ex=()=>{const o={};for(const [k,r] of Object.entries(RESULTS)){if(!r)continue;o[k]={Q:+r.Q_lpm.toFixed(6),H:+r.H.toFixed(6),kW:+r.P_kW.toFixed(6),hp:+r.P_calc.toFixed(6),sel:r.hpStr,pipe:r.pipe,pipeMain:r.pipeMain||null,qty:r.qty,w550:r.warn550===undefined?null:r.warn550,rows:r.calcRows.map(c=>c.k+' = '+c.v)};}
 o.sum=[...document.querySelectorAll('.sum-bar .sum-item')].map(e=>e.textContent.trim());o.done=Object.values(RESULTS).filter(Boolean).length;return o;};`;
const SHOTS=[
 {id:'s01_overview',pre:"__A()",clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar','요약 스트립'],['.proj-banner','프로젝트 배너'],['#pumpStatusBar','8종 진행 상태'],['.pump-tabs','펌프 분류 탭'],['nth:.sub-tabs|0','서브탭'],['card:난방 순환펌프 입력','입력'],['card:산정 기준','산정 기준'],['card:산정 결과','산정 결과'],['.fab-wrap','초기화 · 사용방법']]},
 {id:'s02_tabs',clip:'.hdr-shell',m:[['nth:.tab-bar-inner .tb|0','펌프 용량 산정'],['nth:.tab-bar-inner .tb|1','기준표'],['nth:.tab-bar-inner .tb|2','A4 미리보기'],['.tb-manual','매뉴얼'],['.hdr-right','근거 기준']]},
 {id:'s03_status',clip:'#pumpStatusBar',union:'.pump-tabs',m:[['#psb_heat','난방'],['#psb_cool','냉방'],['#psb_pit','PIT 배수'],['#psb_rain','우수 배수'],['#psb_circ','급탕 순환'],['#psb_recirc','급탕 재순환'],['#psb_ws_hoist','급수 양수'],['#psb_ws_boost','자동부스터'],['.pump-tabs','펌프 분류 탭']]},
 {id:'s04_heat_input',pre:"__show('heat')",clip:'card:난방 순환펌프 입력',m:[['#h_type','① 펌프 형식'],['#h_load','② 난방 부하'],['up:#h_extra|.frow','여유율 · ΔT'],['up:#h_pipelen|.frow','왕복배관 · 단위손실'],['up:#h_coil|.frow','코일 · 보일러 저항'],['up:#h_safety|.frow','안전율 · 효율'],['up:#h_emg|.frow','전동기 여유율 · 제어방식'],['up:#h_ks|.frow','④ KS · 고효율 인증'],['up:#h_eff_a|.frow','A · B특성 효율'],['nth:#pumpHeat .calc-btn|0','산정 버튼']]},
 {id:'s05_heat_basis',clip:'card:산정 기준 (별표 1)',m:[]},
 {id:'s06_heat_result',clip:'card:산정 결과',m:[['nth:.drh-grid|0','유량 · 양정 · 동력'],['nth:.cbox|0','계산 과정'],['nth:.spec-box|0','펌프 선정 사양'],['nth:.cbox|1','제어방식 · KS · 효율']]},
 {id:'s07_cool_result',pre:"__show('cool')",clip:'card:산정 결과',m:[['nth:.drh-grid|0','냉방 결과'],['nth:.spec-box|0','선정 사양']]},
 {id:'s08_pit_input',pre:"__show('pit')",clip:'card:PIT 배수펌프 입력',m:[['#d_q_pit','시간 최대 유입량'],['up:#d_q_pit|div>>','—'],['#d_sump_vol','집수조 용량(30분 검증)'],['#d_solid_type','고형물 기준'],['up:#d_height|.frow','층고 · 배관 길이'],['up:#d_friction|.frow','단위손실 · 안전율'],['up:#d_eta|.frow','효율 · 여유율']]},
 {id:'s09_pit_result',clip:'card:산정 결과',m:[['nth:.drh-grid|0','PIT 결과'],['nth:.cbox|0','계산 과정'],['nth:.spec-box|0','고형물 · 집수정 규격']]},
 {id:'s10_rain_result',pre:"__show('rain')",clip:'card:우수 배수펌프 입력',union:'card:산정 결과',m:[['#d_rain_rate','시간 최대 강수량'],['up:#d_floor_area|.frow','면적 · 대수'],['nth:.drh-grid|0','우수 결과']]},
 {id:'s11_circ_input',pre:"__show('circ')",clip:'card:급탕 순환펌프 입력',m:[['up:#hw_loss_len|.frow','배관 길이 · 단위 열손실'],['up:#hw_loss_direct|.frow','직접 입력 · Δt'],['nth:#hw_circ_block .nb|0','순환 Q 근거'],['#hw_scale_seg','건물 규모'],['up:#hw_R|.frow','R · 왕복 길이 I'],['#hw_K','국부저항 K'],['up:#hw_eta|.frow','효율 · 여유율']]},
 {id:'s12_circ_result',clip:'card:산정 결과',m:[['nth:.drh-grid|0','급탕 순환 결과'],['nth:.cbox|0','열손실 → 유량']]},
 {id:'s13_recirc',pre:"__show('recirc')",clip:'card:급탕 재순환펌프 입력',union:'card:산정 결과',m:[['up:#hw_heat_cap|.frow','가열장치 출력 · Δt'],['nth:.drh-grid|0','재순환 결과']]},
 {id:'s14_ws_input',pre:"__show('ws_boost')",clip:'card:자동부스터 급수펌프 입력',m:[['#ws_b_q','순간최대 예상급수량'],['#ws_b_cnt','병렬 운전 대수'],['nth:#ws_boost_block .nb|0','별표 5 2.1.3(2)'],['#ws_ha','실양정 hₐ'],['up:#ws_pipelen|.frow','배관 길이 · R'],['#ws_ho','최저필요수압 hₒ'],['up:#ws_eta|.frow','효율 · 여유율'],['#ws_550_warn','550 kPa 경고']]},
 {id:'s15_ws_result',clip:'card:산정 결과',m:[['nth:.drh-grid|0','부스터 결과'],['nth:.cbox|0','계산 과정 · 토출압 판정'],['nth:#wsResult .nb.red|0','감압밸브 · 조닝']]},
 {id:'s16_ws_b',pre:"__show('ws_boost_b')",wait:700,clip:'card:산정 결과',post:"__show('ws_boost')",m:[['nth:.drh-grid|0','hₐ 25 m 결과']]},
 {id:'s17_ref',pre:"__tab(1);switchRef('rWS',document.querySelectorAll('.rt-btn')[4]);scrollTo(0,0)",wait:700,clip:'#rWS',union:'.ref-tabs',m:[['.ref-tabs','기준표 5종'],['nth:#rWS .card|0','방식별 유량 기준'],['nth:#rWS .card|1','최저필요수압 표']]},
 {id:'s18_formula',pre:"__tab(0);openBsTab('bs-formula')",wait:900,fixed:true,post:"closeBS()",clip:'#bottomSheet',m:[]},
 {id:'s19_a4',pre:"__A();__tab(2);scrollTo(0,0)",wait:1500,clip:'viewport',m:[['#a4SummaryGrid','8종 요약 카드'],['.mm-btn-print','인쇄 / PDF'],['.mm-btn-jpg','JPG 저장'],['#a4Page','A4 산출서']]},
 {id:'s20_a4page',clip:'#a4Page',crop:2400,m:[['.a4-meta-table','공사명 · 법령 근거'],['nth:.a4-pump-sec|0','펌프별 결과표'],['nth:#a4Page .a4-calc-box|0','계산 과정']]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(2500);
 await pg.addStyleTag({content:HIDE});
 await pg.evaluate(HELP);
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||600);
  if(S.id==='s01_overview'){ex.A=await pg.evaluate('__ex()');}
  if(S.id==='s16_ws_b')ex.B=await pg.evaluate('__ex()').then(o=>o.ws_boost);
  if(S.id==='s20_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('a4Page').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};
     if(S.crop&&clip.height>S.crop)clip.height=S.crop;}
   const marks=[];(S.m||[]).filter(([sel])=>!sel.endsWith('>>')).forEach(([sel,label],i)=>{const e=__find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:c.x-sx,y:c.y-sy,width:Math.min(c.width,VW),height:Math.min(c.height,VH)}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 await pg.evaluate('__A()');await pg.waitForTimeout(500);ex.after=await pg.evaluate('__ex()');
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(2500);
 await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);await mp.evaluate('__A()');await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s21_mobile_main.png')});meta['s21_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{const e=document.getElementById('heatResult').closest('.card');const y=e.getBoundingClientRect().top+window.scrollY-12;window.scrollTo(0,y);document.scrollingElement.scrollTop=y;});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s22_mobile_result.png')});meta['s22_mobile_result']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{__tab(2);window.scrollTo(0,0);});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s23_mobile_a4.png')});meta['s23_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,tabbar:document.querySelector('.tab-bar-inner').scrollWidth,vw:innerWidth,tabRows:new Set([...document.querySelectorAll('.tab-bar-inner .tb')].map(e=>Math.round(e.getBoundingClientRect().top))).size,manualVisible:(()=>{const r=document.querySelector('.tb-manual').getBoundingClientRect();return r.right<=innerWidth&&r.width>0;})()}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const pick=o=>o&&Object.fromEntries(Object.entries(o).filter(([k])=>!['sum','done'].includes(k)).map(([k,v])=>[k,[v.Q,v.H,+v.kW.toFixed(3),v.sel]]));
 const strip=o=>JSON.stringify(Object.fromEntries(Object.entries(o).filter(([k])=>k!=='sum')));
 console.log(JSON.stringify({A:pick(ex.A),B:ex.B&&[ex.B.H,ex.B.w550,ex.B.sel],done:ex.A.done,same:strip(ex.A)===strip(ex.after),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
