(() => {
 const cfg=window.MX_CONFIG||{};
 const configured=cfg.SUPABASE_URL&&!cfg.SUPABASE_URL.includes("YOUR-PROJECT")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
 const client=configured&&window.supabase?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
 const $=id=>document.getElementById(id);
 const show=(id,msg,error=false)=>{const el=$(id);el.textContent=msg;el.classList.remove("hidden","error");if(error)el.classList.add("error")};
 const hide=id=>$(id).classList.add("hidden");
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let currentUser=null;
 if(!client){$("setup-warning").classList.remove("hidden");return;}
 $("setup-warning").classList.add("hidden");
 async function refresh(){
   const {data:{session}}=await client.auth.getSession();
   currentUser=session?.user||null;
   if(!currentUser){$("login-panel").classList.remove("hidden");$("dashboard").classList.add("hidden");$("signout").classList.add("hidden");return;}
   if(currentUser.app_metadata?.role!=="admin"){
     $("login-panel").classList.remove("hidden");$("dashboard").classList.add("hidden");$("signout").classList.remove("hidden");
     show("login-message","Signed in, but this account does not have admin permission. Ask the project owner to assign the admin role.",true);return;
   }
   $("login-panel").classList.add("hidden");$("dashboard").classList.remove("hidden");$("signout").classList.remove("hidden");await loadAdmin();
 }
 $("login-form").addEventListener("submit",async e=>{
   e.preventDefault();hide("login-message");
   const {error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});
   if(error){show("login-message",error.message,true);return;}await refresh();
 });
 $("signout").addEventListener("click",async()=>{await client.auth.signOut();await refresh();});
 async function loadAdmin(){
   const [downloads,settings]=await Promise.all([client.from("downloads").select("*").order("created_at",{ascending:false}),client.from("site_settings").select("key,value")]);
   if(downloads.error)show("download-message","Could not read downloads: "+downloads.error.message,true);else renderAdminDownloads(downloads.data||[]);
   if(!settings.error){const map=Object.fromEntries((settings.data||[]).map(x=>[x.key,x.value]));$("discord").value=map.discord_url||"";$("telegram").value=map.telegram_url||"";}
 }
 function renderAdminDownloads(items){
   const box=$("admin-downloads");
   if(!items.length){box.innerHTML='<p class="muted">No resources added yet.</p>';return;}
   box.innerHTML=items.map(x=>`<div class="admin-item"><div><strong>${esc(x.title)}</strong><p>${esc(x.category)} · ${x.published?"Published":"Draft"}</p><p>${esc(x.url)}</p></div><button class="button small danger" data-delete="${esc(x.id)}">Delete</button></div>`).join("");
   box.querySelectorAll("[data-delete]").forEach(btn=>btn.addEventListener("click",async()=>{if(!confirm("Delete this resource?"))return;const {error}=await client.from("downloads").delete().eq("id",btn.dataset.delete);if(error)show("download-message","Delete failed: "+error.message,true);else{show("download-message","Resource deleted.");await loadAdmin();}}));
 }
 $("download-form").addEventListener("submit",async e=>{
   e.preventDefault();hide("download-message");
   const url=$("url").value.trim();try{if(!["https:","http:"].includes(new URL(url).protocol))throw new Error();}catch{show("download-message","Enter a valid http:// or https:// URL.",true);return;}
   const row={title:$("title").value.trim(),description:$("description").value.trim(),category:$("category").value,url,version:$("version").value.trim(),file_size:$("file-size").value.trim(),published:$("published").checked};
   const {error}=await client.from("downloads").insert(row);
   if(error){show("download-message","Could not save: "+error.message,true);return;}
   $("download-form").reset();$("published").checked=true;show("download-message","Resource saved.");await loadAdmin();
 });
 $("links-form").addEventListener("submit",async e=>{
   e.preventDefault();hide("links-message");
   const entries=[["discord_url",$("discord").value.trim()],["telegram_url",$("telegram").value.trim()]];
   for(const [key,value] of entries){if(value){try{if(!["https:","http:"].includes(new URL(value).protocol))throw new Error();}catch{show("links-message","Please enter valid HTTPS/HTTP links.",true);return;}}}
   const {error}=await client.from("site_settings").upsert(entries.map(([key,value])=>({key,value})),{onConflict:"key"});
   if(error){show("links-message","Could not save links: "+error.message,true);return;}show("links-message","Community links saved.");
 });
 client.auth.onAuthStateChange(()=>{setTimeout(refresh,0);});
 refresh();
})();