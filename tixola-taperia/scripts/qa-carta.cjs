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

   /* ── Sondas de RESPUESTA (paquete D) ────────────────────────────────────────────────────────
      Este contenedor solo tiene WebGL por software, así que NO se miden FPS de GPU: se mide lo que sí
      es real en cualquier máquina —trabajo de hilo principal y número de capas caras—. Todo va en un
      try/catch: si una sonda falla, las comprobaciones de arriba siguen valiendo. */
   try{
    // 1 · Censo de superficies caras: desenfoques reales, cristal real y `transition-all`.
    const census=await p.evaluate(()=>{let blur=0,backdrop=0,all=0;
      for(const el of document.querySelectorAll("*")){const cs=getComputedStyle(el);
        if((cs.filter||"").includes("blur("))blur++;
        const bf=cs.backdropFilter||cs.webkitBackdropFilter||"none"; if(bf!=="none")backdrop++;
        if((cs.transitionProperty||"")==="all")all++;}
      return {blur,backdrop,all}});
    process.stdout.write(`${dev.n}: capas caras → filter:blur=${census.blur} backdrop-filter=${census.backdrop} transition-all=${census.all}\n`);

    // 2 · El panel de filtros no debe DESPLAZAR la rejilla de resultados al abrirse.
    const shift=await p.evaluate(async()=>{
      const grid=document.getElementById("carta-resultados"); if(!grid)return null;
      /* El botón "Filtros" por lo que CONTROLA, no por su texto (la carta habla cuatro idiomas) y no
         por ser el primero con aria-expanded (ese es la hamburguesa del navbar). */
      const toggle=[...document.querySelectorAll("button[aria-expanded][aria-controls]")]
        .find(b=>document.getElementById(b.getAttribute("aria-controls"))?.querySelector('input[type="search"]'));
      if(!toggle)return null;
      const y0=grid.getBoundingClientRect().top;
      toggle.click();
      await new Promise(r=>setTimeout(r,320));
      const y1=grid.getBoundingClientRect().top;
      return Math.round(Math.abs(y1-y0))});
    process.stdout.write(`${dev.n}: desplazamiento de la rejilla al abrir filtros = ${shift===null?"n/d":shift+"px"} (objetivo 0)\n`);

    // 3 · Fotograma más largo mientras se escribe en el buscador: la tecla no puede bloquear el hilo.
    const typing=await (async()=>{
      const box=await p.$('input[type="search"]:visible');
      if(!box)return null;
      await box.click();
      await p.evaluate(()=>{window.__gaps=[];let last=performance.now();
        const tick=(now)=>{window.__gaps.push(now-last);last=now;window.__raf=requestAnimationFrame(tick)};
        window.__raf=requestAnimationFrame(tick)});
      await p.keyboard.type("pulpo",{delay:70});
      await p.waitForTimeout(500);
      const gaps=await p.evaluate(()=>{cancelAnimationFrame(window.__raf);return window.__gaps.slice(2)});
      await box.fill("");
      if(!gaps.length)return null;
      return {worst:Math.round(Math.max(...gaps)),avg:Math.round(gaps.reduce((a,b)=>a+b,0)/gaps.length)}})();
    process.stdout.write(`${dev.n}: fotogramas al teclear → peor=${typing?typing.worst+"ms":"n/d"} medio=${typing?typing.avg+"ms":"n/d"}\n`);
   }catch(e){process.stdout.write("    (aviso: sonda de respuesta no concluyó: "+e.message+")\n")}

   await ctx.close();
  }
  await b.close();
 } finally { srv.kill("SIGTERM") }
})().catch(e=>{console.error(e);process.exit(1)});
