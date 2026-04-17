const themeToggleBtn = document.getElementById("theme-toggle");

/**
 * Apply and save the given theme.
 * @param {"dark"|"light"} theme
 */
function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem("gh-search-theme", theme);
}

// Restore saved preference on load (default: light)
applyTheme(localStorage.getItem("gh-search-theme") || "light");

// Toggle on click
themeToggleBtn.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  applyTheme(isDark ? "light" : "dark");
});

// ── DOM References ────────────────────────────────────────────────────────────

const usernameInput   = document.getElementById("username-input");
const searchBtn       = document.getElementById("search-btn");
const loadingEl       = document.getElementById("loading");
const errorMsgEl      = document.getElementById("error-msg");
const errorTextEl     = document.getElementById("error-text");
const profileCard     = document.getElementById("profile-card");
const reposSection    = document.getElementById("repos-section");

const avatarEl        = document.getElementById("avatar");
const nameEl          = document.getElementById("name");
const loginEl         = document.getElementById("login");
const loginLinkEl     = document.getElementById("login-link");
const bioEl           = document.getElementById("bio");
const reposCountEl    = document.getElementById("repos-count");
const followersEl     = document.getElementById("followers");
const followingEl     = document.getElementById("following");
const joinedEl        = document.getElementById("joined");
const portfolioLinkEl = document.getElementById("portfolio-link");
const portfolioUrlEl  = document.getElementById("portfolio-url");
const reposListEl     = document.getElementById("repos-list");

// ── GitHub API ────────────────────────────────────────────────────────────────

/**
 * Fetch a GitHub user's profile.
 * @param {string} username
 * @returns {Promise<Object>}
 */
async function fetchUser(username) {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  );
  if (response.status === 404)
    throw new Error("User not found. Please check the username and try again.");
  if (response.status === 403 || response.status === 429)
    throw new Error("GitHub API rate limit exceeded. Please wait a moment and try again.");
  if (!response.ok)
    throw new Error(`GitHub API returned an error (${response.status}). Please try again.`);
  return response.json();
}

/**
 * Fetch the top 5 non-forked repos sorted by most recently updated.
 * @param {string} reposUrl
 * @returns {Promise<Array>}
 */
async function fetchRepositories(reposUrl) {
  const response = await fetch(`${reposUrl}?sort=updated&direction=desc&per_page=10`);
  if (!response.ok) return [];
  const repos = await response.json();
  return repos.filter((r) => !r.fork).slice(0, 5);
}

// ── Formatting ────────────────────────────────────────────────────────────────

/** ISO 8601 → "Joined on August 15, 2023" */
function formatJoinDate(iso) {
  return "Joined on " + new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
}

/** ISO 8601 → "Feb 10, 2024" */
function formatRepoDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
}

/** 12300 → "12.3K" */
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// ── UI State ──────────────────────────────────────────────────────────────────

function showLoading() {
  loadingEl.classList.remove("hidden");
  errorMsgEl.classList.add("hidden");
  profileCard.classList.add("hidden");
  reposSection.classList.add("hidden");
}

function hideLoading() { loadingEl.classList.add("hidden"); }

function showError(message) {
  hideLoading();
  errorTextEl.textContent = message;
  errorMsgEl.classList.remove("hidden");
  profileCard.classList.add("hidden");
  reposSection.classList.add("hidden");
}

// ── Render ────────────────────────────────────────────────────────────────────

/** Populate the profile card with user data. */
function renderProfile(user) {
  avatarEl.src = user.avatar_url;
  avatarEl.alt = `${user.login}'s avatar`;

  nameEl.textContent  = user.name || user.login;
  loginEl.textContent = user.login;
  loginLinkEl.href    = user.html_url;

  bioEl.textContent   = user.bio || "";
  bioEl.style.display = user.bio ? "block" : "none";

  reposCountEl.textContent = formatNumber(user.public_repos);
  followersEl.textContent  = formatNumber(user.followers);
  followingEl.textContent  = formatNumber(user.following);
  joinedEl.textContent     = formatJoinDate(user.created_at);

  if (user.blog && user.blog.trim()) {
    const url = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;
    portfolioLinkEl.href       = url;
    portfolioUrlEl.textContent = user.blog;
    portfolioLinkEl.classList.remove("hidden");
  } else {
    portfolioLinkEl.classList.add("hidden");
  }

  profileCard.classList.remove("hidden");
  void profileCard.offsetWidth; // restart CSS animation
}

/** Build and insert repository cards. */
function renderRepos(repos) {
  reposListEl.innerHTML = "";

  if (!repos || repos.length === 0) {
    reposSection.classList.add("hidden");
    return;
  }

  repos.forEach((repo) => {
    const card = document.createElement("article");
    card.className = "repo-card";

    // Header: repo name link + visibility badge
    const header = document.createElement("div");
    header.className = "repo-header";

    const nameLink = document.createElement("a");
    nameLink.href        = repo.html_url;
    nameLink.target      = "_blank";
    nameLink.rel         = "noopener noreferrer";
    nameLink.className   = "repo-name";
    nameLink.textContent = repo.name;

    const badge = document.createElement("span");
    badge.className  = "repo-visibility";
    badge.textContent = repo.private ? "private" : "public";

    header.appendChild(nameLink);
    header.appendChild(badge);
    card.appendChild(header);

    // Description
    if (repo.description) {
      const desc = document.createElement("p");
      desc.className   = "repo-description";
      desc.textContent = repo.description;
      card.appendChild(desc);
    }

    // Footer: language · stars · forks · updated date
    const footer = document.createElement("div");
    footer.className = "repo-footer";

    if (repo.language) {
      const langItem = document.createElement("span");
      langItem.className = "repo-meta-item";
      const dot = document.createElement("span");
      dot.className = "repo-language-dot";
      langItem.appendChild(dot);
      langItem.append(repo.language);
      footer.appendChild(langItem);
    }

    const starsItem = document.createElement("span");
    starsItem.className = "repo-meta-item";
    starsItem.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    starsItem.append(formatNumber(repo.stargazers_count));
    footer.appendChild(starsItem);

    const forksItem = document.createElement("span");
    forksItem.className = "repo-meta-item";
    forksItem.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="6" y1="9" x2="6" y2="15"/><line x1="6" y1="9" x2="18" y2="15"/></svg>`;
    forksItem.append(formatNumber(repo.forks_count));
    footer.appendChild(forksItem);

    const updatedItem = document.createElement("span");
    updatedItem.className   = "repo-meta-item";
    updatedItem.textContent = "Updated " + formatRepoDate(repo.updated_at);
    footer.appendChild(updatedItem);

    card.appendChild(footer);
    reposListEl.appendChild(card);
  });

  reposSection.classList.remove("hidden");
}

// ── Search ────────────────────────────────────────────────────────────────────

async function searchUser() {
  const username = usernameInput.value.trim();
  if (!username) { usernameInput.focus(); return; }

  showLoading();

  try {
    const user = await fetchUser(username);
    renderProfile(user);
    hideLoading();

    const repos = await fetchRepositories(user.repos_url);
    renderRepos(repos);
  } catch (error) {
    showError(error.message || "Something went wrong. Please try again.");
  }
}

// ── Event Listeners ───────────────────────────────────────────────────────────

searchBtn.addEventListener("click", searchUser);
usernameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchUser();
});