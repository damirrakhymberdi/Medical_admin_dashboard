import { initCalendar } from "./calendar.js";

// Уақыт слоттары 08:00 - 20:00, әр 30 минут
function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 19; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
}

// Уақыттан Y позициясын есептеу (pixel)
function timeToY(time) {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = (h - 8) * 60 + m;
  return (totalMinutes / 30) * 60; // 60px әр 30 минут
}

// Ұзақтықтан height есептеу
function durationToHeight(minutes) {
  return (minutes / 30) * 60;
}

export function renderScheduleLayout({ doctors, selectedDoctorId, selectedDate }) {
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

        <div class="card" style="margin-top:12px;">
          <div id="calendar"></div>
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
        window.dispatchEvent(new CustomEvent("schedule:dateChanged", { detail: newDate }));
      },
    });
  });

  return html;
}

export function renderCalendarGrid({ doctors, appointments, selectedDate }) {
  const timeSlots = generateTimeSlots();
  
  // Егер врачтар жоқ болса
  if (!doctors || doctors.length === 0) {
    return `
      <div class="calendar-empty">
        <div class="calendar-empty-icon">👨‍⚕️</div>
        <div class="calendar-empty-text">Врачей не найдено</div>
      </div>
    `;
  }

  return `
    <div class="calendar-grid-wrapper">
      <!-- Header -->
      <div class="calendar-grid-header">
        <div class="calendar-time-header">Время</div>
        <div class="calendar-doctors-header">
          ${doctors.map(d => `
            <div class="calendar-doctor-column-header">
              <div class="calendar-doctor-name">${escapeHtml(d.name)}</div>
              <div class="calendar-doctor-specialty">${escapeHtml(d.specialty || '')}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Grid -->
      <div class="calendar-grid-scroll">
        <div class="calendar-grid">
          <!-- Уақыт бағанасы -->
          <div class="calendar-time-column">
            ${timeSlots.map(time => `
              <div class="calendar-time-slot">${time}</div>
            `).join('')}
          </div>

          <!-- Врачтар бағаналары -->
          <div class="calendar-doctors-columns">
            ${doctors.map(doctor => {
              const doctorAppts = appointments.filter(a => a.doctorId === doctor.id);
              
              return `
                <div class="calendar-doctor-column">
                  <!-- Grid сызықтары -->
                  <div class="calendar-time-grid">
                    ${timeSlots.map(() => `<div class="calendar-time-grid-line"></div>`).join('')}
                  </div>

                  <!-- Appointment блоктары -->
                  ${doctorAppts.map(appt => {
                    const top = timeToY(appt.time);
                    const height = durationToHeight(appt.duration || 30);
                    
                    return `
                      <div 
                        class="calendar-appointment ${escapeHtml(appt.status)}"
                        style="top: ${top}px; height: ${height}px;"
                        data-appointment-id="${escapeHtml(appt.id)}"
                        onclick="window.handleAppointmentClick('${escapeHtml(appt.id)}')"
                      >
                        <div class="calendar-appointment-time">${escapeHtml(appt.time)}</div>
                        <div class="calendar-appointment-patient">${escapeHtml(appt.patientName)}</div>
                        <div class="calendar-appointment-status">${escapeHtml(appt.status)}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderLoading() {
  return `
    <div class="calendar-empty">
      <div class="spinner"></div>
      <div class="calendar-empty-text" style="margin-top:12px;">Загрузка...</div>
    </div>
  `;
}

export function renderError(message) {
  return `
    <div class="calendar-empty">
      <div class="calendar-empty-icon">⚠️</div>
      <div class="calendar-empty-text" style="color:#b91c1c;">${escapeHtml(message)}</div>
    </div>
  `;
}

export function renderEmpty() {
  return `
    <div class="calendar-empty">
      <div class="calendar-empty-icon">📅</div>
      <div class="calendar-empty-text">Нет записей на эту дату</div>
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