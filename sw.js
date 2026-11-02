const V='drv-v1';
const SHELL=['./','./icons/icon-192.png','./icons/badge-96.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==location.origin) return;
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(ca=>ca.put('./',c));return x}).catch(()=>caches.match('./'))); return; }
  if(u.pathname.includes('/icons/')) e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});
self.addEventListener('push',e=>{
  let d={}; try{d=e.data?e.data.json():{}}catch(x){}
  const title=d.title||'طلب توصيل جديد';
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const focused=cl.some(c=>c.visibilityState==='visible'&&c.focused);
    if(focused){ cl.forEach(c=>c.postMessage({type:'push',data:d})); return; }
    await self.registration.showNotification(title,{body:d.body||'',tag:d.tag||'drv',renotify:true,icon:'./icons/icon-192.png',badge:'./icons/badge-96.png',dir:'rtl',lang:'ar',vibrate:[250,120,250,120,400],requireInteraction:true,data:{url:d.url||'./'}});
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil((async()=>{
    const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    if(cl.length){ const c=cl[0]; try{await c.focus();}catch(x){} c.postMessage({type:'refresh'}); return; }
    let t=''; try{ t=(await (await caches.open(V)).match('./token'))?.text?.() ; t=await t; }catch(x){}
    await self.clients.openWindow('./'+(t?('?t='+t):''));
  })());
});
