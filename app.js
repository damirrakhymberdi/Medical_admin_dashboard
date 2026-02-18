import { getState, setState } from "./core/state.js";
import { renderAuthPage } from "./features/auth/auth.view.js";
import { mountAuthPage } from "./features/auth/auth.controller.js";

import { mountSchedulePage } from "./features/schedule/schedule.controller.js";
import { mountPatientsPage } from "./features/patients/patients.controller.js";
import { mountVisitPage } from "./features/visits/visits.controller.js";
import { mountPaymentsPage } from "./features/payments/payments.controller.js";
import { mountReportPage } from "./features/report/report.controller.js";

/* =========================
   1) Layout (App Shell)
   ========================= */
const app = document.getElementById("app");

function renderLayout() {
  app.innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
                <path d="M8 12h8M12 8v8" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span class="logo-text">MediMetrics</span>
          </div>
          <div class="support-info">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Support: +7 771 163 2030</span>
          </div>
        </div>

        <nav class="menu" id="menu">
          <a href="#schedule" class="menu-item" data-route="schedule">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>Schedule</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a href="#patients" class="menu-item" data-route="patients">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Patients</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a href="#payments" class="menu-item" data-route="payments">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>Payments</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>

          <a href="#report" class="menu-item" data-route="report">
            <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Report</span>
            <svg class="menu-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </nav>
      </aside>

      <div class="main">
        <header class="header">
          <input id="globalSearch" type="text" placeholder="Search..." />
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="user" id="userBox">Guest</div>
            <button class="btn btn-secondary" id="logoutBtn" type="button">Logout</button>
          </div>
        </header>

        <main class="content" id="page-content"></main>
      </div>
    </div>
  `;
}

/* =========================
   2) Helpers
   ========================= */
function setActiveMenu(route) {
  const links = document.querySelectorAll(".menu-item");
  links.forEach((a) => a.classList.toggle("active", a.dataset.route === route));
}

function setHeaderUser() {
  const { user } = getState();

  const userBox = document.getElementById("userBox");
  if (userBox) userBox.textContent = user?.role ? user.role : "Guest";

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";
}

function getAllowedRoutesByRole(role) {
  if (role === "doctor") {
    // doctor can only work with schedule + visits
    return new Set(["schedule", "visit"]);
  }
  // operator (default)
  return new Set(["schedule", "patients", "payments", "report", "visit"]);
}

function applyRoleToMenu() {
  const { user } = getState();
  const menu = document.getElementById("menu");
  if (!menu) return;

  // reset (in case role changes / logout-login)
  menu.querySelector('[data-route="patients"]')?.classList.remove("hidden");
  menu.querySelector('[data-route="payments"]')?.classList.remove("hidden");
  menu.querySelector('[data-route="report"]')?.classList.remove("hidden");

  if (user?.role === "doctor") {
    menu.querySelector('[data-route="patients"]')?.classList.add("hidden");
    menu.querySelector('[data-route="payments"]')?.classList.add("hidden");
    menu.querySelector('[data-route="report"]')?.classList.add("hidden");
  }
}

/* =========================
   3) Router (auth + role guard)
   ========================= */
function getRouteFromHash() {
  const hash = window.location.hash || "#schedule";
  return hash.replace("#", "").split("?")[0];
}

function requireAuthAndRole(route) {
  const { user } = getState();

  const protectedRoutes = new Set([
    "schedule",
    "patients",
    "payments",
    "report",
    "visit",
  ]);

  // not logged in -> block protected
  if (!user && protectedRoutes.has(route)) return "login";

  // logged in -> role restriction
  if (user) {
    const allowedByRole = getAllowedRoutesByRole(user.role);
    if (route !== "login" && !allowedByRole.has(route)) {
      return "schedule";
    }
  }

  return route;
}

function renderLogin() {
  app.innerHTML = renderAuthPage();

  mountAuthPage({
    onSuccess: () => {
      // after login go schedule
      window.location.hash = "#schedule";
    },
  });
}

function renderProtected(route) {
  renderLayout();
  setHeaderUser();
  applyRoleToMenu();
  setActiveMenu(route);

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", () => {
    setState({ user: null });
    window.location.hash = "#login";
  });

  if (route === "schedule") return mountSchedulePage();
  if (route === "patients") return mountPatientsPage();
  if (route === "visit") return mountVisitPage();
  if (route === "payments") return mountPaymentsPage();
  if (route === "report") return mountReportPage();
}

function renderRoute() {
  let route = getRouteFromHash();
  route = requireAuthAndRole(route);

  const allowed = new Set([
    "login",
    "schedule",
    "patients",
    "payments",
    "report",
    "visit",
  ]);
  if (!allowed.has(route)) route = "schedule";

  // force hash to #login if login required (so URL becomes clear)
  if (route === "login") {
    if (window.location.hash !== "#login") window.location.hash = "#login";
    renderLogin();
    return;
  }

  renderProtected(route);
}

function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  if (!window.location.hash) window.location.hash = "#login";
  renderRoute();
}

initRouter();
