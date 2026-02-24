/* ============================================================
   GitLens — script.js
   GitHub REST API integration (no auth required for public data)
   ============================================================ */

const API = "https://api.github.com";

// ── Language colour map ──────────────────────────────────────
const LANG_COLORS = {
  JavaScript:  { dot: "dot-yellow",  hex: "#f0c56b" },
  TypeScript:  { dot: "dot-blue",    hex: "#3d8bff" },
  Python:      { dot: "dot-green",   hex: "#5be7a9" },
  CSS:         { dot: "dot-purple",  hex: "#a78bfa" },
  HTML:        { dot: "dot-red",     hex: "#f06b6b" },
  Rust:        { dot: "dot-orange",  hex: "#fb923c" },
  Go:          { dot: "dot-blue",    hex: "#3d8bff" },
  Java:        { dot: "dot-red",     hex: "#f06b6b" },
  "C++":       { dot: "dot-purple",  hex: "#a78bfa" },
  "C#":        { dot: "dot-green",   hex: "#5be7a9" },
  Ruby:        { dot: "dot-red",     hex: "#f06b6b" },
  Swift:       { dot: "dot-orange",  hex: "#fb923c" },
  Kotlin:      { dot: "dot-purple",  hex: "#a78bfa" },
  Shell:       { dot: "dot-green",   hex: "#5be7a9" },
  Vue:         { dot: "dot-green",   hex: "#5be7a9" },
  Svelte:      { dot: "dot-orange",  hex: "#fb923c" },
  PHP:         { dot: "dot-purple",  hex: "#a78bfa" },
  Dart:        { dot: "dot-blue",    hex: "#3d8bff" },
};

function langColor(lang) {
  return LANG_COLORS[lang] || { dot: "dot-green", hex: "#5be7a9" };
}

// ── Helpers ──────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "0";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

function joinedDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ── DOM references ───────────────────────────────────────────
const form        = document.getElementById("search-form");
const input       = document.getElementById("search-input");
const resultSec   = document.getElementById("result-section");
const errorBox    = document.getElementById("error-box");
const errorMsg    = document.getElementById("error-msg");
const loader      = document.getElementById("loader");
const suggestions = document.querySelectorAll(".suggest-username");

// ── Quick-fill suggestion links ──────────────────────────────
suggestions.forEach(el => {
  el.addEventListener("click", () => {
    input.value = el.textContent.trim();
    form.dispatchEvent(new Event("submit"));
  });
});

// ── Form submit ──────────────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = input.value.trim();
  if (!username) return;
  await loadProfile(username);
});

// ── Main loader ──────────────────────────────────────────────
async function loadProfile(username) {
  showLoader(true);
  hideError();
  hideResult();

  try {
    // Parallel: user + repos + orgs
    const [user, repos, orgs] = await Promise.all([
      fetchJSON(`${API}/users/${username}`),
      fetchJSON(`${API}/users/${username}/repos?per_page=100&sort=updated`),
      fetchJSON(`${API}/users/${username}/orgs?per_page=10`),
    ]);

    // Language tally across all repos
    const langCounts = {};
    repos.forEach(r => {
      if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + (r.size || 1);
    });

    renderProfile(user);
    renderStats(user, repos);
    renderRepos(repos);
    renderLanguages(langCounts);
    renderOrgs(orgs);
    renderActivity(repos);

    showResult();
  } catch (err) {
    const msg = err.message.includes("404")
      ? `No GitHub user found for "<strong>${username}</strong>". Check the spelling and try again.`
      : `Something went wrong: ${err.message}`;
    showError(msg);
  } finally {
    showLoader(false);
  }
}

// ── Render: Profile header ───────────────────────────────────
function renderProfile(u) {
  // Avatar
  document.getElementById("avatar-img").src = u.avatar_url;

  // Name / login
  document.getElementById("profile-name").textContent = u.name || u.login;
  document.getElementById("profile-login").textContent = `@${u.login}`;

  // PRO badge visibility
  document.getElementById("pro-badge").style.display = u.plan?.name === "pro" ? "inline" : "none";

  // Bio
  const bioEl = document.getElementById("profile-bio");
  bioEl.innerHTML = u.bio
    ? u.bio.replace(/@(\w+)/g, '<span style="color:var(--accent)">@$1</span>')
    : '<span style="color:var(--text-dim); font-style:italic;">No bio provided.</span>';

  // Meta
  document.getElementById("meta-location").textContent = u.location || "—";
  document.getElementById("meta-location-wrap").style.display = "flex";

  const blogEl = document.getElementById("meta-blog");
  const blogWrap = document.getElementById("meta-blog-wrap");
  if (u.blog) {
    blogEl.textContent = u.blog.replace(/^https?:\/\//, "");
    blogEl.href = u.blog.startsWith("http") ? u.blog : `https://${u.blog}`;
    blogWrap.style.display = "flex";
  } else {
    blogWrap.style.display = "none";
  }

  document.getElementById("meta-joined").textContent = `Joined ${joinedDate(u.created_at)}`;

  const twitterWrap = document.getElementById("meta-twitter-wrap");
  if (u.twitter_username) {
    document.getElementById("meta-twitter").textContent = `@${u.twitter_username}`;
    twitterWrap.style.display = "flex";
  } else {
    twitterWrap.style.display = "none";
  }

  // Followers / following
  document.getElementById("followers-count").textContent = fmt(u.followers);
  document.getElementById("following-count").textContent = fmt(u.following);
}

// ── Render: Stat cards ───────────────────────────────────────
function renderStats(u, repos) {
  document.getElementById("stat-repos").textContent   = fmt(u.public_repos);
  document.getElementById("stat-gists").textContent   = fmt(u.public_gists);
  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  document.getElementById("stat-stars").textContent   = fmt(totalStars);
  document.getElementById("stat-forks").textContent   = fmt(repos.reduce((s, r) => s + (r.forks_count || 0), 0));
}

// ── Render: Repositories ─────────────────────────────────────
function renderRepos(repos) {
  // Sort by stars, take top 6
  const top = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
  const container = document.getElementById("repos-list");
  document.getElementById("repos-total").textContent = `${repos.length} total`;

  container.innerHTML = top.map(r => {
    const lc = langColor(r.language);
    const langDot = r.language
      ? `<span class="flex items-center gap-1.5 text-xs font-mono text-dim">
           <span class="w-2.5 h-2.5 rounded-full ${lc.dot} inline-block"></span>${r.language}
         </span>`
      : "";

    const desc = r.description
      ? r.description.substring(0, 80) + (r.description.length > 80 ? "…" : "")
      : '<span style="color:var(--muted);font-style:italic">No description</span>';

    const isForked = r.fork ? `<span class="badge px-2 py-0.5 rounded-md text-xs" style="font-size:0.65rem;">Fork</span>` : "";

    return `
      <div class="repo-card rounded-xl p-5">
        <div class="flex items-start justify-between mb-2">
          <div class="min-w-0 flex-1 pr-3">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <a href="${r.html_url}" target="_blank" rel="noopener"
                 class="font-display font-600 text-sm text-accent2 hover:underline truncate">${r.name}</a>
              ${isForked}
            </div>
            <p class="text-xs font-mono" style="color:var(--text-dim); line-height:1.6">${desc}</p>
          </div>
          <div class="flex items-center gap-1 text-xs font-mono text-dim flex-shrink-0">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            ${fmt(r.stargazers_count)}
          </div>
        </div>
        <div class="flex items-center gap-4 mt-3">
          ${langDot}
          <span class="flex items-center gap-1 text-xs font-mono text-dim">
            <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 3H3v18l4-4h14V3z"/>
            </svg>
            ${fmt(r.forks_count)}
          </span>
          <span class="text-xs font-mono text-dim">${r.updated_at ? "Updated " + timeAgo(r.updated_at) : ""}</span>
        </div>
      </div>`;
  }).join("");
}

// ── Render: Languages ────────────────────────────────────────
function renderLanguages(langCounts) {
  const container = document.getElementById("languages-list");
  const total = Object.values(langCounts).reduce((s, v) => s + v, 0);

  if (total === 0) {
    container.innerHTML = `<p class="text-xs text-dim font-mono">No language data available.</p>`;
    return;
  }

  const sorted = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Recalculate percentage from top-6 only
  const topTotal = sorted.reduce((s, [, v]) => s + v, 0);

  container.innerHTML = sorted.map(([lang, count]) => {
    const pct = Math.round((count / topTotal) * 100);
    const lc = langColor(lang);
    return `
      <div>
        <div class="flex justify-between text-xs font-mono text-dim mb-1.5">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${lc.dot} inline-block"></span>${lang}
          </span>
          <span>${pct}%</span>
        </div>
        <div class="w-full rounded-full h-1" style="background:var(--border);">
          <div class="h-1 rounded-full ${lc.dot}" style="width:${pct}%; transition: width 0.8s ease;"></div>
        </div>
      </div>`;
  }).join("");
}

// ── Render: Organizations ────────────────────────────────────
function renderOrgs(orgs) {
  const container = document.getElementById("orgs-list");
  const wrap      = document.getElementById("orgs-card");

  if (!orgs.length) {
    wrap.style.display = "none";
    return;
  }

  wrap.style.display = "block";
  container.innerHTML = orgs.map(o =>
    `<a href="https://github.com/${o.login}" target="_blank" rel="noopener"
        title="${o.login}"
        class="badge px-2.5 py-1 rounded-md hover:opacity-80 transition-opacity">${o.login}</a>`
  ).join("");
}

// ── Render: Recent Activity (from repos update times) ────────
function renderActivity(repos) {
  const container = document.getElementById("activity-list");

  // Sort by pushed_at, take last 5
  const recent = [...repos]
    .filter(r => r.pushed_at)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5);

  if (!recent.length) {
    container.innerHTML = `<p class="text-xs text-dim font-mono">No recent activity found.</p>`;
    return;
  }

  const icons = [
    /* push */ `<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="#5be7a9" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    /* commit */ `<svg width="9" height="9" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#3d8bff" stroke-width="2.5"/><line x1="2" y1="12" x2="9" y2="12" stroke="#3d8bff" stroke-width="2"/><line x1="15" y1="12" x2="22" y2="12" stroke="#3d8bff" stroke-width="2"/></svg>`,
    /* star */   `<svg width="9" height="9" viewBox="0 0 24 24" fill="#f0c56b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  ];
  const iconBgs = [
    "rgba(91,231,169,0.1)",
    "rgba(61,139,255,0.1)",
    "rgba(240,197,107,0.1)",
  ];
  const labels = ["Pushed to", "Updated", "Activity in"];

  container.innerHTML = recent.map((r, i) => {
    const idx = i % 3;
    return `
      <div class="flex gap-3 items-start">
        <div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
             style="background:${iconBgs[idx]};">
          ${icons[idx]}
        </div>
        <div>
          <p class="text-xs font-mono" style="color:var(--text);">
            ${labels[idx]} <a href="${r.html_url}" target="_blank" rel="noopener"
              class="text-accent2 hover:underline">${r.full_name}</a>
          </p>
          <p class="text-xs text-dim mt-0.5">${timeAgo(r.pushed_at)}</p>
        </div>
      </div>`;
  }).join("");
}

// ── UI state helpers ─────────────────────────────────────────
function showLoader(on) {
  loader.style.display = on ? "flex" : "none";
}

function showResult() {
  resultSec.style.display = "block";
  // Re-trigger animations
  resultSec.querySelectorAll(".animate-fadeup").forEach(el => {
    el.style.animation = "none";
    void el.offsetWidth; // reflow
    el.style.animation = "";
  });
}

function hideResult() {
  resultSec.style.display = "none";
}

function showError(html) {
  errorMsg.innerHTML = html;
  errorBox.style.display = "flex";
}

function hideError() {
  errorBox.style.display = "none";
}
