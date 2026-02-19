import { getDoctors, getSchedule } from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import {
  renderScheduleLayout,
  renderCalendarGrid,
  renderLoading,
  renderError,
  renderEmpty,
} from "./schedule.view.js";

export async function mountSchedulePage() {
  const page = document.getElementById("page-content");

  try {
    page.innerHTML = renderLoading();

    const doctors = await getDoctors();
    const state = getState();

    const selectedDoctorId = state.selectedDoctorId || "";
    const today = new Date().toISOString().slice(0, 10);
    const selectedDate = state.selectedDate || today;

    setState({ doctors, selectedDoctorId, selectedDate });

    page.innerHTML = renderScheduleLayout({
      doctors,
      selectedDoctorId,
      selectedDate,
    });

    const doctorSelect = document.getElementById("doctorSelect");
    if (doctorSelect) {
      doctorSelect.addEventListener("change", () => {
        setState({ selectedDoctorId: doctorSelect.value });
        loadCalendarGrid();
      });
    }

    window.addEventListener("schedule:dateChanged", (e) => {
      setState({ selectedDate: e.detail });
      loadCalendarGrid();
    });

    // Global функция appointment click үшін
    window.handleAppointmentClick = (appointmentId) => {
      window.location.hash = `#visit?id=${appointmentId}`;
    };

    loadCalendarGrid();
  } catch (err) {
    page.innerHTML = renderError(
      err?.message || "Не удалось загрузить расписание"
    );
  }
}

async function loadCalendarGrid() {
  const { doctors, selectedDoctorId, selectedDate } = getState();
  const box = document.getElementById("scheduleContent");

  if (!box) return;

  try {
    box.innerHTML = renderLoading();

    // Егер "Все врачи" таңдалса, барлық врачтарға жүктейміз
    const doctorsToShow = selectedDoctorId 
      ? doctors.filter(d => d.id === selectedDoctorId)
      : doctors;

    if (doctorsToShow.length === 0) {
      box.innerHTML = renderEmpty();
      return;
    }

    // Барлық врачтар үшін appointments жүктейміз
    const appointmentsPromises = doctorsToShow.map(doctor =>
      getSchedule(doctor.id, selectedDate)
    );

    const appointmentsArrays = await Promise.all(appointmentsPromises);
    
    // Барлық appointments-ты біріктіреміз
    const allAppointments = appointmentsArrays.flat();

    // Duration қосамыз (API-да жоқ болса, default 30 мин)
    const appointmentsWithDuration = allAppointments.map(appt => ({
      ...appt,
      duration: appt.duration || 30,
    }));

    if (appointmentsWithDuration.length === 0) {
      box.innerHTML = renderEmpty();
      return;
    }

    box.innerHTML = renderCalendarGrid({
      doctors: doctorsToShow,
      appointments: appointmentsWithDuration,
      selectedDate,
    });

  } catch (err) {
    box.innerHTML = renderError(
      err?.message || "Не удалось загрузить данные"
    );
  }
}