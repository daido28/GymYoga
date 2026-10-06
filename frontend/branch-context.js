// Carry the chosen branch only to this application's API.
(() => {
 const original=window.fetch.bind(window);
 window.fetch=(resource,init={})=>{
  const url=new URL(resource instanceof Request?resource.url:resource,location.href);
  if(url.origin===location.origin&&url.pathname.startsWith('/api/')){
   const headers=new Headers(resource instanceof Request?resource.headers:undefined);
   new Headers(init.headers).forEach((v,k)=>headers.set(k,v));
   const branch=localStorage.getItem('branchId');
   if(branch)headers.set('X-Branch-Id',branch);
   init={...init,headers};
  }
  return original(resource,init);
 };
})();
