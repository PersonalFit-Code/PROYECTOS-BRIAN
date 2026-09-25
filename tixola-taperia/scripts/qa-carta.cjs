const path=require("path"),fs=require("fs"),{spawn}=require("child_process"),{chromium}=require("playwright");
const OUT=path.join(__dirname,"..","screenshots","sections"),PORT=3125,BASE=`http://127.0.0.1:${PORT}`;
const wait=(u,n=60)=>new Promise((res,rej)=>{const t=async k=>{try{const r=await fetch(u);if(r.ok)return res()}catch{}
 if(k<=0)return rej(new Error("no server"));setTimeout(()=>t(k-1),500)};t(n)});
(async()=>{
 fs.mkdirSync(OUT,{recursive:true});
 const srv=spawn("npx",["next","start","-p",String(PORT)],{cwd:path.join(__dirname,".."),stdio:"pipe"});
 try{
  await wait(BASE);
  const b=await chromium.launch({args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  for(const dev of [{n:"desktop",vp:{width:1440,height:900},m:false},{n:"mobile",vp:{width:390,height:844},m:true}]){
   const ctx=await b.newContext({viewport:dev.vp,isMobile:dev.m,hasTouch:dev.m,deviceScaleFactor:1});
   const p=await ctx.newPage(); const errs=[];
   p.on("pageerror",e=>errs.push("pageerror: "+e.message));
   p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text())});
   await p.goto(BASE+"/carta",{waitUntil:"networkidle",timeout:60000});
   await p.waitForTimeout(1500);
   for(const cat of ["tixolas","mar"]){
     const ok=await p.evaluate(c=>{const el=document.getElementById("cat-"+c)||document.querySelector(`[id*="${c}"]`);
       if(!el)return false; el.scrollIntoView({block:"start"}); return true},cat);
     await p.waitForTimeout(1500);
     if(ok) await p.screenshot({path:path.join(OUT,`carta-${dev.n}-${cat}.png`)});
     process.stdout.write(`${dev.n}/${cat}: ${ok?"found":"NOT FOUND"}\n`);
   }
   // filtro: excluir gluten y comprobar que el recuento baja
   const before=await p.evaluate(()=>document.body.innerText.match(/(\d+)\s*PLATOS/i)?.[1]||"?");
   await p.evaluate(()=>{const b=[...document.querySelectorAll("button")].find(x=>/gluten/i.test(x.textContent||"")&&/excluir|gluten/i.test(x.closest("section,div")?.textContent||"")); b&&b.click()});
   await p.waitForTimeout(900);
   const after=await p.evaluate(()=>document.body.innerText.match(/(\d+)\s*PLATOS/i)?.[1]||"?");
   const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   process.stdout.write(`${dev.n}: platos ${before} -> ${after} tras excluir gluten | overflow=${ov}px | JS errors=${errs.length}\n`);
   errs.slice(0,6).forEach(e=>process.stdout.write("    "+e+"\n"));
   await ctx.close();
  }
  await b.close();
 } finally { srv.kill("SIGTERM") }
})().catch(e=>{console.error(e);process.exit(1)});
