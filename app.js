(() => {
  const cfg = window.MX_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-PROJECT") &&
    cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
  const client = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  document.getElementById("year").textContent = new Date().getFullYear();
  const list = document.getElementById("download-list");
  const status = document.getElementById("download-status");
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let allDownloads = [];
  function renderDownloads(items) {
    list.innerHTML = "";
    if (!items.length) {
      list.innerHTML = '<div class="empty">No downloads published yet. Add resources from the admin dashboard.</div>';
      return;
    }
    for (const item of items) {
      const card = document.createElement("article");
      card.className = "card";
      const safeUrl = (() => { try { const u = new URL(item.url); return ["https:","http:"].includes(u.protocol) ? u.href : null; } catch { return null; } })();
      card.innerHTML = `<div class="icon">↓</div><span class="tag">${esc((item.category || "RESOURCE").toUpperCase())}</span><h3>${esc(item.title)}</h3><p>${esc(item.description || "")}</p><div class="download-meta">${item.version ? `<span>Version ${esc(item.version)}</span>` : ""}${item.file_size ? `<span>${esc(item.file_size)}</span>` : ""}</div>${safeUrl ? `<a class="button small" href="${esc(safeUrl)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>` : '<span class="muted">Link not available</span>'}`;
      list.appendChild(card);
    }
  }
  document.getElementById("search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase().trim();
    renderDownloads(allDownloads.filter(x => [x.title,x.description,x.category,x.version].join(" ").toLowerCase().includes(q)));
  });
  async function loadSiteSettings() {
    if (!client) {
      status.textContent = "Demo mode: connect Supabase in config.js to load admin-managed downloads and community links.";
      document.getElementById("community-status").textContent = "Add your invite links from the admin dashboard after configuring Supabase.";
      renderDownloads([
        {title:"PC Optimization Guide",category:"PC GUIDE",description:"Add your tested Windows gaming tips and trusted resource link in the admin dashboard.",url:"https://support.microsoft.com/windows"},
        {title:"Mobile Gaming Guide",category:"MOBILE GUIDE",description:"Add your own device setup guide or trusted download.",url:"https://www.android.com/"},
        {title:"Emulator Resources",category:"EMULATOR",description:"Use official software sources and review files before sharing.",url:"https://www.bluestacks.com/"}
      ]);
      return;
    }
    const [d,s] = await Promise.all([
      client.from("downloads").select("id,title,description,category,url,version,file_size,created_at").eq("published",true).order("created_at",{ascending:false}),
      client.from("site_settings").select("key,value")
    ]);
    if (d.error) { status.textContent = "Could not load downloads. Check Supabase setup and database policies."; renderDownloads([]); }
    else { allDownloads = d.data || []; renderDownloads(allDownloads); status.textContent = ""; }
    if (s.error) return;
    const settings = Object.fromEntries((s.data || []).map(x => [x.key,x.value]));
    setCommunityLink("discord-link", settings.discord_url, "Discord invite");
    setCommunityLink("telegram-link", settings.telegram_url, "Telegram channel");
  }
  function setCommunityLink(id, url, label) {
    const a = document.getElementById(id);
    try {
      const parsed = new URL(url || "");
      if (!["https:","http:"].includes(parsed.protocol)) throw new Error();
      a.href = parsed.href; a.textContent = label + " ↗"; a.classList.remove("disabled");
    } catch { a.href = "#community"; a.textContent = label + " (not set)"; a.addEventListener("click", e => { e.preventDefault(); document.getElementById("community-status").textContent = "The site owner has not configured this community link yet."; }, {once:true}); }
  }
  loadSiteSettings();
})();