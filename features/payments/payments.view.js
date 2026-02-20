export function renderPaymentsPage({ date, patients = [] }) {
  const patientOptions = patients.length
    ? patients
        .map(
          (p) =>
            `<option value="${p.id}">${escapeHtml(p.name)} — ${escapeHtml(p.phone)}</option>`,
        )
        .join("")
    : `<option value="">— нет пациентов —</option>`;

  return `
    <div class="payments-container">
      <div class="payments-toolbar">
        <div class="payments-form-group">
          <label class="payments-label">Дата</label>
          <input id="payDate" class="payments-input" type="date" value="${date}" />
        </div>

        <div class="payments-form-group">
          <label class="payments-label">Пациент</label>
          <select id="payPatient" class="payments-input">
            ${patientOptions}
          </select>
        </div>

        <div class="payments-form-group">
          <label class="payments-label">Сумма</label>
          <input id="payAmount" class="payments-input" type="number" placeholder="0" min="0" />
        </div>

        <div class="payments-form-group">
          <label class="payments-label">Метод</label>
          <select id="payMethod" class="payments-input">
            <option value="cash">Наличные</option>
            <option value="card">Карта</option>
          </select>
        </div>

        <button id="paySubmit" class="payments-submit-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Принять
        </button>
      </div>

      <div id="payError" class="payments-error"></div>

      <div class="payments-content">
        <div id="paymentsState"></div>
        <div id="paymentsTable"></div>
      </div>
    </div>
  `;
}

export function renderLoading(text = "Загрузка…") {
  return `
    <div class="payments-empty">
      <div class="spinner"></div>
      <div style="margin-top:12px; color:var(--muted); font-size:14px;">${escapeHtml(text)}</div>
    </div>
  `;
}

export function renderError(message) {
  return `
    <div class="payments-empty">
      <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
      <div style="color:#b91c1c; font-size:14px;">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderEmpty() {
  return `
    <div class="payments-empty">
      <div style="font-size:32px; margin-bottom:8px;">💰</div>
      <div style="color:var(--muted); font-size:14px;">Нет платежей за эту дату</div>
    </div>
  `;
}

export function renderPaymentsTable(list) {
  // Подсчитываем общую сумму
  const total = list.reduce((sum, p) => sum + Number(p.amount), 0);

  return `
    <div class="payments-summary">
      <div class="payments-summary-item">
        <span class="payments-summary-label">Всего платежей:</span>
        <span class="payments-summary-value">${list.length}</span>
      </div>
      <div class="payments-summary-item">
        <span class="payments-summary-label">Общая сумма:</span>
        <span class="payments-summary-value payments-summary-total">${total.toLocaleString()} ₸</span>
      </div>
    </div>

    <div class="payments-list">
      ${list
        .map(
          (p) => `
        <div class="payment-item">
          <div class="payment-indicator"></div>
          <div class="payment-info">
            <div class="payment-header">
              <span class="payment-time">${escapeHtml(p.time)}</span>
              <span class="payment-amount">${Number(p.amount).toLocaleString()} ₸</span>
            </div>
            <div class="payment-details">
              <span class="payment-patient">${escapeHtml(p.patientName)}</span>
              <span class="payment-method-badge ${escapeHtml(p.method)}">
                ${p.method === "cash" ? "💵 Наличные" : "💳 Карта"}
              </span>
            </div>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
