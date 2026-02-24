<div align="center">

<br/>

```
  ██████╗ ██╗████████╗██╗     ███████╗███╗   ██╗███████╗
 ██╔════╝ ██║╚══██╔══╝██║     ██╔════╝████╗  ██║██╔════╝
 ██║  ███╗██║   ██║   ██║     █████╗  ██╔██╗ ██║███████╗
 ██║   ██║██║   ██║   ██║     ██╔══╝  ██║╚██╗██║╚════██║
 ╚██████╔╝██║   ██║   ███████╗███████╗██║ ╚████║███████║
  ╚═════╝ ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝╚══════╝
```

**A sleek, zero-dependency GitHub profile explorer — built with vanilla JS and Tailwind CSS.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-5be7a9?style=for-the-badge&logo=github)](https://hemant-giri2004.github.io/GitLens---GitHub-Profile-Explorer/)
[![GitHub Stars](https://img.shields.io/github/stars/your-username/gitlens?style=for-the-badge&color=5be7a9)](https://github.com/your-username/gitlens/stargazers)
[![License](https://img.shields.io/badge/License-MIT-3d8bff?style=for-the-badge)](LICENSE)
[![Made with](https://img.shields.io/badge/Made%20with-Vanilla%20JS-f0c56b?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br/>

![GitLens Preview](https://hemant-giri2004.github.io/GitLens---GitHub-Profile-Explorer/)

<br/>

</div>

---

## ✦ What is GitLens?

**GitLens** is a beautiful, dark-themed GitHub profile explorer. Type any GitHub username, hit Search, and instantly see their full profile — stats, repositories, top languages, organizations, and recent activity — all pulled live from the GitHub REST API with no backend, no build step, and no API key required.

---

## ✦ Features

- **🔍 Live Search** — Fetches real data from the GitHub REST API on every search
- **👤 Full Profile Card** — Avatar, bio, location, website, Twitter, join date
- **📊 Dynamic Stats** — Repositories, gists, total stars earned, total forks
- **📁 Top Repositories** — Sorted by stars, with language, forks, and last-updated info
- **🧠 Language Breakdown** — Visual percentage bars calculated across all public repos
- **🏢 Organizations** — Displays all public org memberships as badges
- **⚡ Recent Activity** — Last 5 push events based on repo `pushed_at` timestamps
- **🎨 Premium Design** — Dark UI with grain texture, grid background, CSS animations, and glow effects
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile
- **⚙️ Zero Dependencies** — No npm, no bundler, no framework. Just two files.

---

## ✦ Tech Stack

| Layer | Tech |
|---|---|
| Markup | HTML5 |
| Styling | Tailwind CSS (CDN) + Custom CSS |
| Logic | Vanilla JavaScript (ES2020) |
| Data | GitHub REST API v3 (public, no auth) |
| Fonts | Syne · DM Mono · Fraunces (Google Fonts) |
| Hosting | GitHub Pages |

---

## ✦ Project Structure

```
gitlens/
├── index.html       # Main UI — all layout, styles, and DOM structure
├── script.js        # All logic — API calls, rendering, state management
└── README.md        # You are here
```

That's it. Two files. No `node_modules`. No config. No build pipeline.

---

## ✦ Getting Started

### Run locally

```bash
# 1. Clone the repo
git clone https://github.com/your-username/gitlens.git

# 2. Open in browser — no server needed for basic usage
open index.html
```

> **Note:** Some browsers block `fetch()` on `file://` URLs due to CORS policy. If you see a network error when running locally, use a simple dev server:
>
> ```bash
> # Using Python
> python3 -m http.server 3000
>
> # Using Node.js (npx)
> npx serve .
>
> # Using VS Code
> Install the "Live Server" extension and click "Go Live"
> ```
> Then open `http://localhost:3000` in your browser.

---

## ✦ Deploying to GitHub Pages

This project is designed to be hosted on GitHub Pages with zero configuration.

### Step 1 — Create your repository

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "feat: initial commit — GitLens"
```

### Step 2 — Push to GitHub

```bash
# Create a new repo on github.com first, then:
git remote add origin https://github.com/your-username/gitlens.git
git branch -M main
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → scroll to **Pages** in the left sidebar
3. Under **Source**, select `Deploy from a branch`
4. Choose branch: **`main`** / folder: **`/ (root)`**
5. Click **Save**

GitHub will give you a URL like:
```
https://your-username.github.io/gitlens
```

It typically goes live within **60–90 seconds**. 🎉

### Step 4 — Update the README badges

Replace `your-username` in the badge URLs at the top of this README with your actual GitHub username.

---

## ✦ How It Works

When a user searches for a username, `script.js` fires three parallel API requests:

```
GET https://api.github.com/users/{username}
GET https://api.github.com/users/{username}/repos?per_page=100&sort=updated
GET https://api.github.com/users/{username}/orgs?per_page=10
```

All three resolve simultaneously via `Promise.all()`. The data is then parsed and injected into pre-existing DOM elements using `innerHTML` and `textContent` — no virtual DOM, no diffing, just direct and fast DOM manipulation.

### API Rate Limits

The GitHub REST API allows **60 unauthenticated requests per hour** per IP address. For a profile explorer, this is more than sufficient for personal or demo use. If you need a higher limit, you can add a [personal access token](https://github.com/settings/tokens) to the request headers in `script.js`:

```js
// In the fetchJSON() function inside script.js:
const res = await fetch(url, {
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer YOUR_TOKEN_HERE",   // ← add this line
  }
});
```

> ⚠️ Never commit a real token to a public repository. Use environment variables or a backend proxy if this is a production app.

---

## ✦ Customization

### Change the accent color

Open `index.html` and update the CSS variable at the top of the `<style>` block:

```css
:root {
  --accent:  #5be7a9;   /* ← change this to any color you like */
  --accent2: #3d8bff;   /* ← secondary accent */
}
```

### Add more suggestion usernames

In `index.html`, find the suggestions line and add more:

```html
<span class="suggest-username text-accent cursor-pointer hover:underline">your-favorite-dev</span>
```

### Change the number of repos shown

In `script.js`, find the `renderRepos` function and change `.slice(0, 6)`:

```js
const top = [...repos].sort(...).slice(0, 6);  // ← change 6 to any number
```

---

## ✦ Screenshots

| Search | Profile | Repositories |
|--------|---------|--------------|
| Search bar with suggestions | Full profile card with avatar | Top repos sorted by stars |

---

## ✦ Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Opera 76+ | ✅ Full |

---

## ✦ Roadmap

- [ ] Add GitHub contribution calendar heatmap
- [ ] Shareable profile URLs (`?u=torvalds`)
- [ ] Compare two users side by side
- [ ] Dark / light theme toggle
- [ ] Export profile as PDF card

---

## ✦ Contributing

Contributions are welcome! Here's how:

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/your-username/gitlens.git

# 3. Create a feature branch
git checkout -b feat/your-feature-name

# 4. Make your changes, then commit
git commit -m "feat: add your feature"

# 5. Push and open a Pull Request
git push origin feat/your-feature-name
```

Please keep pull requests focused — one feature or fix per PR.

---

## ✦ License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ♥ and a lot of `fetch()` calls.

**[⭐ Star this repo](https://github.com/your-username/gitlens)** if you found it useful!

</div>
