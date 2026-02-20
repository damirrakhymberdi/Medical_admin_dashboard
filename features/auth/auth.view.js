export function renderAuthPage() {
  return `
    <div class="auth-split">
      <div class="auth-left">
        <div class="auth-topbar">
          <div class="auth-brand">MediMetrics</div>
        </div>
        <div class="auth-panel">
          <div class="auth-title">Вход</div>
          <form id="loginForm" class="auth-form">
            <label class="auth-label">
              Телефон
              <input class="input" name="phone" type="tel" placeholder="8700..." autocomplete="tel" required />
            </label>
            <label class="auth-label">
              Пароль
              <input class="input" name="password" type="password" placeholder="••••" autocomplete="current-password" required />
            </label>
            <div id="loginError" class="auth-error" aria-live="polite"></div>
            <button id="loginBtn" class="btn" type="submit">Войти</button>
            <div class="auth-hint">
              Демо: пароль <b>1234</b> → оператор, пароль <b>doctor</b> → врач
            </div>
          </form>
        </div>
      </div>
      <div class="auth-right"></div>
    </div>
  `;
}
