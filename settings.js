/* Shared Settings sheet for Data desk, Lab and Card.
   A page provides <button id="open-settings" class="st-gear"> and calls:
     Settings.onTheme = name => setTheme(name, true);   // when a theme is picked
     Settings.sync(name);                                // whenever the page theme changes */
(() => {
  const THEMES = {
    ink: ["Ink", "#0c1929", "#e8b24a"],
    ledger: ["Ledger", "#edf0ee", "#2540d9"],
    terminal: ["Terminal", "#0b0c0c", "#ffa028"],
    pink: ["Pink paper", "#fff1e5", "#990f3d"],
    weekly: ["Weekly", "#dde8ee", "#e3120b"],
    phosphor: ["Phosphor", "#040b06", "#3dff7a"],
    blueprint: ["Blueprint", "#1436c9", "#ffd84d"]
  };
  const PAGES = [
    ["index.html", "./", "Original page", "Yield, inflation and jobs lines"],
    ["desk.html", "desk.html", "Data desk", "US rates, inflation and jobs"],
    ["lab.html", "lab.html", "Lab", "Exploded layers and a yield-curve terrain"],
    ["card.html", "card.html", "Card", "Digital business card"]
  ];
  const here = location.pathname.split("/").pop() || "index.html";
  const X = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12"/></svg>';

  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="st-dialog" id="st-settings" aria-labelledby="st-title">
      <div class="st-sheet">
        <div class="st-head"><h2 id="st-title">Settings</h2><button type="button" class="st-x" id="st-close" aria-label="Close settings">${X}</button></div>

        <section class="st-group" aria-labelledby="st-g1">
          <h3 id="st-g1">Preferences</h3>
          <div class="st-setting">
            <span class="st-label" id="st-country-label">Country</span>
            <div class="st-control">
              <div class="st-country" role="group" aria-labelledby="st-country-label">
                <button type="button" id="st-us" aria-pressed="true">US</button>
                <button type="button" id="st-tr" aria-pressed="false" aria-describedby="st-soon">TR</button>
              </div>
              <span class="st-soon" id="st-soon" role="status"></span>
            </div>
          </div>
          <div class="st-setting">
            <span class="st-label" id="st-theme-label">Theme</span>
            <div class="st-control">
              <button type="button" class="st-tbtn" id="st-theme-btn" aria-haspopup="dialog" aria-labelledby="st-theme-label st-theme-name"><i id="st-swatch"></i><span id="st-theme-name">Ink</span></button>
            </div>
          </div>
        </section>

        <section class="st-group" aria-labelledby="st-g2">
          <h3 id="st-g2">Pages</h3>
          <ul class="st-pages">${PAGES.map(([f, href, name, note]) => f === here
            ? `<li><a href="${href}" aria-current="page"><span class="st-pn"><b>${name}</b><small>${note}</small></span><em class="st-here">You are here</em></a></li>`
            : `<li><a href="${href}"><span class="st-pn"><b>${name}</b><small>${note}</small></span><i class="st-arrow" aria-hidden="true"></i></a></li>`).join("")}</ul>
        </section>
      </div>
    </dialog>
    <dialog class="st-dialog st-picker" id="st-picker" aria-labelledby="st-picker-title">
      <div class="st-sheet">
        <div class="st-head"><h2 id="st-picker-title">Themes</h2><button type="button" class="st-x" id="st-picker-close" aria-label="Close themes">${X}</button></div>
        <div class="st-opts" id="st-opts" role="radiogroup" aria-labelledby="st-picker-title">${Object.entries(THEMES).map(([k, [label, bg, ac]]) =>
          `<button type="button" class="st-opt" role="radio" aria-checked="false" data-look="${k}" style="--sw-bg:${bg};--sw-ac:${ac}"><i></i><span>${label}</span><b class="st-dot" aria-hidden="true"></b></button>`).join("")}</div>
      </div>
    </dialog>`);

  const $ = id => document.getElementById(id);
  const dlg = $("st-settings"), picker = $("st-picker");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  function closeSheet(d) {
    if (!d.open || d.classList.contains("st-closing")) return;
    if (reduce.matches) { d.close(); return; }
    d.classList.add("st-closing");
    let done = false;
    d.addEventListener("animationend", function end(e) {
      if (e.target !== d || done) return;
      done = true;
      d.removeEventListener("animationend", end);
      d.classList.remove("st-closing");
      d.close();
    });
  }
  for (const d of [dlg, picker]) {
    d.addEventListener("cancel", e => { e.preventDefault(); closeSheet(d); });
    d.addEventListener("click", e => { if (e.target === d) closeSheet(d); });
  }
  $("open-settings").addEventListener("click", () => dlg.showModal());
  $("st-theme-btn").addEventListener("click", () => picker.showModal());
  $("st-close").addEventListener("click", () => closeSheet(dlg));
  $("st-picker-close").addEventListener("click", () => closeSheet(picker));

  // Country: US is the data; TR answers with a note that replays its animation on every press
  const soon = $("st-soon");
  let soonTimer;
  $("st-tr").addEventListener("click", () => {
    clearTimeout(soonTimer);
    soon.classList.remove("st-show", "st-first");
    void soon.offsetWidth;
    soon.textContent = "Coming soon";
    soon.classList.add("st-first", "st-show");
    soonTimer = setTimeout(() => { soon.classList.remove("st-show"); soon.textContent = ""; }, 3200);
  });

  // Theme picking
  const all = { ...THEMES };
  const optHtml = (k, label, bg, ac) => `<button type="button" class="st-opt" role="radio" aria-checked="false" data-look="${k}" style="--sw-bg:${bg};--sw-ac:${ac}"><i></i><span>${label}</span><b class="st-dot" aria-hidden="true"></b></button>`;
  const api = {
    onTheme: null,
    // a page can offer a look of its own (the Data desk's "Desk"), listed first
    addTheme(key, label, bg, ac) {
      all[key] = [label, bg, ac];
      $("st-opts").insertAdjacentHTML("afterbegin", optHtml(key, label, bg, ac));
    },
    sync(name) {
      const t = all[name] || all.ink;
      $("st-theme-name").textContent = t[0];
      $("st-swatch").style.setProperty("--sw-bg", t[1]);
      $("st-swatch").style.setProperty("--sw-ac", t[2]);
      $("st-opts").querySelectorAll(".st-opt").forEach(o => o.setAttribute("aria-checked", String(o.dataset.look === name)));
    }
  };
  $("st-opts").addEventListener("click", e => {
    const b = e.target.closest(".st-opt");
    if (!b) return;
    if (api.onTheme) api.onTheme(b.dataset.look);
    setTimeout(() => closeSheet(picker), 200);
  });
  window.Settings = api;
})();
