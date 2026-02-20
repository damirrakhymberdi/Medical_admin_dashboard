import { initCalendar } from "./calendar.js";

function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 19; hour++) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
}

function timeToY(time) {
  const [h, m] = time.split(":").map(Number);
  return (((h - 8) * 60 + m) / 30) * 60;
}

function durationToHeight(minutes) {
  return (minutes / 30) * 60;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderScheduleLayout({
  doctors,
  selectedDoctorId,
  selectedDate,
}) {
  const html = `
    <div class="schedule-shell" style="margin-top:0px;">
      <div class="schedule-left">
        <div class="card">
          <label class="muted" style="font-size:12px;">Врач</label>
          <select id="doctorSelect" class="input" style="margin-top:6px;">
            <option value="">Все врачи</option>
            ${doctors
              .map(
                (d) =>
                  `<option value="${d.id}" ${d.id === selectedDoctorId ? "selected" : ""}>${escapeHtml(d.name)}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="card" style="margin-top:0;">
          <div id="calendar"></div>
        </div>
        <!-- ✅ ЖАҢА кнопка -->
        <div class="card" style="margin-top:0; padding:10px;">
          <button id="addAppointmentBtn" class="btn" style="width:100%;" type="button">
            + Новая запись
          </button>
        </div>
      </div>
      <div class="schedule-right">
        <div id="scheduleContent"></div>
      </div>
    </div>
  `;

  queueMicrotask(() => {
    const calBox = document.getElementById("calendar");
    if (!calBox) return;
    initCalendar(calBox, {
      value: selectedDate,
      onChange: (newDate) => {
        window.dispatchEvent(
          new CustomEvent("schedule:dateChanged", { detail: newDate }),
        );
      },
    });
  });

  return html;
}

// ✅ ЖАҢА — форма
export function renderAddAppointmentForm({ doctors, patients }) {
  return `
    <form id="addApptForm" style="display:grid; gap:12px;">
      <label style="display:grid; gap:6px; font-size:12px; color:var(--muted);">
        Врач
        <select class="input" name="doctorId" required>
          <option value="">Выберите врача</option>
          ${doctors.map((d) => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join("")}
        </select>
      </label>
      <label style="display:grid; gap:6px; font-size:12px; color:var(--muted);">
        Пациент
        <select class="input" name="patientId" required>
          <option value="">Выберите пациента</option>
          ${patients.map((p) => `<option value="${p.id}">${escapeHtml(p.name)} — ${escapeHtml(p.phone)}</option>`).join("")}
        </select>
      </label>
      <label style="display:grid; gap:6px; font-size:12px; color:var(--muted);">
        Дата
        <input class="input" type="date" name="date" required />
      </label>
      <label style="display:grid; gap:6px; font-size:12px; color:var(--muted);">
        Время
        <input class="input" type="time" name="time" required />
      </label>
      <label style="display:grid; gap:6px; font-size:12px; color:var(--muted);">
        Длительность (мин)
        <select class="input" name="duration">
          <option value="15">15 мин</option>
          <option value="30" selected>30 мин</option>
          <option value="45">45 мин</option>
          <option value="60">60 мин</option>
          <option value="90">90 мин</option>
        </select>
      </label>
      <div id="apptFormError" style="min-height:18px; color:#b91c1c; font-size:13px;"></div>
      <div style="display:flex; gap:8px; justify-content:flex-end;">
        <button class="btn btn-secondary" type="button" id="cancelApptForm">Отмена</button>
        <button class="btn" type="submit" id="saveApptBtn">Создать</button>
      </div>
    </form>
  `;
}

export function renderCalendarGrid({ doctors, appointments, selectedDate }) {
  const timeSlots = generateTimeSlots();
  if (!doctors || doctors.length === 0) {
    return `<div class="calendar-empty"><div class="calendar-empty-icon">👨‍⚕️</div><div class="calendar-empty-text">Врачей не найдено</div></div>`;
  }
  return `
    <div class="calendar-grid-wrapper">
      <div class="calendar-grid-header">
        <div class="calendar-time-header">Время</div>
        <div class="calendar-doctors-header">
          ${doctors
            .map(
              (d) => `
            <div class="calendar-doctor-column-header">
              <div class="calendar-doctor-name">${escapeHtml(d.name)}</div>
              <div class="calendar-doctor-specialty">${escapeHtml(d.specialty || "")}</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
      <div class="calendar-grid-scroll">
        <div class="calendar-grid">
          <div class="calendar-time-column">
            ${timeSlots.map((t) => `<div class="calendar-time-slot">${t}</div>`).join("")}
          </div>
          <div class="calendar-doctors-columns">
            ${doctors
              .map((doctor) => {
                const appts = appointments.filter(
                  (a) => a.doctorId === doctor.id,
                );
                return `
                <div class="calendar-doctor-column">
                  <div class="calendar-time-grid">
                    ${timeSlots.map(() => `<div class="calendar-time-grid-line"></div>`).join("")}
                  </div>
                  ${appts
                    .map((appt) => {
                      const top = timeToY(appt.time);
                      const height = durationToHeight(appt.duration || 30);
                      return `
                      <div
                        class="calendar-appointment ${escapeHtml(appt.status)}"
                        style="top:${top}px; height:${height}px;"
                        data-appointment-id="${escapeHtml(appt.id)}"
                        onclick="window.handleAppointmentClick('${escapeHtml(appt.id)}')"
                      >
                        <div class="calendar-appointment-time">${escapeHtml(appt.time)}</div>
                        <div class="calendar-appointment-patient">${escapeHtml(appt.patientName)}</div>
                        <div class="calendar-appointment-status">${escapeHtml(appt.status)}</div>
                      </div>
                    `;
                    })
                    .join("")}
                </div>
              `;
              })
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderLoading() {
  return `<div class="calendar-empty"><div class="spinner"></div><div class="calendar-empty-text" style="margin-top:12px;">Загрузка...</div></div>`;
}

export function renderError(message) {
  return `<div class="calendar-empty"><div class="calendar-empty-icon">⚠️</div><div class="calendar-empty-text" style="color:#b91c1c;">${escapeHtml(message)}</div></div>`;
}

export function renderEmpty() {
  return `<div class="calendar-empty"><div class="calendar-empty-icon">📅</div><div class="calendar-empty-text">Нет записей на эту дату</div></div>`;
}
