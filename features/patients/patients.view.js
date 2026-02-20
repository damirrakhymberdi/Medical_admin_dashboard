export function renderPatientsPage() {
  return `
    <div class="patients-container">
      <div class="patients-toolbar">
        <input 
          id="patientSearch" 
          class="patients-search-input" 
          placeholder="Поиск по имени или телефону..." 
        />
        <button id="createPatientBtn" class="patients-create-btn" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Создать
        </button>
      </div>

      <div class="patients-content">
        <div id="patientsState"></div>
        <div id="patientsTable"></div>
      </div>
    </div>
  `;
}

export function renderLoading(text = "Загрузка пациентов…") {
  return `
    <div class="patients-empty">
      <div class="spinner"></div>
      <div style="margin-top:12px; color:var(--muted); font-size:14px;">${text}</div>
    </div>
  `;
}

export function renderError(message) {
  return `
    <div class="patients-empty">
      <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
      <div style="color:#b91c1c; font-size:14px;">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderEmpty() {
  return `
    <div class="patients-empty">
      <div style="font-size:32px; margin-bottom:8px;">👤</div>
      <div style="color:var(--muted); font-size:14px;">Пациенты не найдены</div>
    </div>
  `;
}

export function renderPatientsTable(list) {
  return `
    <div class="patients-list">
      ${list
        .map(
          (p) => `
        <div class="patient-item">
          <div class="patient-indicator"></div>
          <div class="patient-info">
            <div class="patient-name">${escapeHtml(p.name)}</div>
            <div class="patient-details">
              <span class="patient-phone">${escapeHtml(p.phone)}</span>
              ${p.birthDate ? `<span class="patient-birth">• ${escapeHtml(p.birthDate)}</span>` : ''}
            </div>
          </div>
          <div class="patient-actions">
            <button class="patient-action-btn" data-action="view" data-id="${p.id}" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Просмотр
            </button>
            <button class="patient-action-btn" data-action="edit" data-id="${p.id}" type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Изменить
            </button>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

export function renderPatientForm({ mode, patient }) {
  const title = mode === "edit" ? "Изменить пациента" : "Создать пациента";
  return `
    <form id="patientForm">
      <div style="font-size:14px; font-weight:600; margin-bottom:16px;">${title}</div>

      <label style="display:grid; gap:6px; margin-bottom:12px;">
        <span style="font-size:12px; color:var(--muted); font-weight:500;">Имя</span>
        <input class="input" name="name" value="${patient?.name ? escapeAttr(patient.name) : ""}" required />
      </label>

      <label style="display:grid; gap:6px; margin-bottom:12px;">
        <span style="font-size:12px; color:var(--muted); font-weight:500;">Телефон</span>
        <input class="input" name="phone" value="${patient?.phone ? escapeAttr(patient.phone) : ""}" placeholder="8700..." required />
      </label>

      <label style="display:grid; gap:6px; margin-bottom:12px;">
        <span style="font-size:12px; color:var(--muted); font-weight:500;">Дата рождения</span>
        <input class="input" type="date" name="birthDate" value="${patient?.birthDate ? escapeAttr(patient.birthDate) : ""}" />
      </label>

      <div id="patientFormError" style="min-height:18px; color:#b91c1c; font-size:13px;"></div>

      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:16px;">
        <button class="btn btn-secondary" type="button" id="cancelPatientForm">Отмена</button>
        <button class="btn" type="submit" id="savePatientBtn">${mode === "edit" ? "Сохранить" : "Создать"}</button>
      </div>
    </form>
  `;
}

export function renderPatientCard(patient) {
  return `
    <div style="display:grid; gap:16px;">
      <div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Имя</div>
        <div style="font-weight:700; font-size:18px;">${escapeHtml(patient.name)}</div>
      </div>
      <div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Телефон</div>
        <div style="font-size:15px;">${escapeHtml(patient.phone)}</div>
      </div>
      <div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Дата рождения</div>
        <div style="font-size:15px;">${patient.birthDate ? escapeHtml(patient.birthDate) : `<span style="color:var(--muted);">—</span>`}</div>
      </div>
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

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("\n", " ");
}