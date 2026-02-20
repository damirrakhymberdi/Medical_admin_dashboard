import {
  getDoctors,
  getSchedule,
  createAppointment,
  searchPatients,
} from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import { openModal, closeModal } from "../../ui/modal.js";
import {
  renderScheduleLayout,
  renderCalendarGrid,
  renderAddAppointmentForm,
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
    const selectedDate =
      state.selectedDate || new Date().toISOString().slice(0, 10);
    setState({ doctors, selectedDoctorId, selectedDate });
    page.innerHTML = renderScheduleLayout({
      doctors,
      selectedDoctorId,
      selectedDate,
    });

    document.getElementById("doctorSelect")?.addEventListener("change", (e) => {
      setState({ selectedDoctorId: e.target.value });
      loadCalendarGrid();
    });
    window.addEventListener("schedule:dateChanged", (e) => {
      setState({ selectedDate: e.detail });
      loadCalendarGrid();
    });
    window.handleAppointmentClick = (id) => {
      window.location.hash = `#visit?id=${id}`;
    };
    document
      .getElementById("addAppointmentBtn")
      ?.addEventListener("click", openAddAppointmentModal);
    loadCalendarGrid();
  } catch (err) {
    page.innerHTML = renderError(
      err?.message || "Не удалось загрузить расписание",
    );
  }
}

async function loadCalendarGrid() {
  const { doctors, selectedDoctorId, selectedDate } = getState();
  const box = document.getElementById("scheduleContent");
  if (!box) return;
  try {
    box.innerHTML = renderLoading();
    const doctorsToShow = selectedDoctorId
      ? doctors.filter((d) => d.id === selectedDoctorId)
      : doctors;
    if (!doctorsToShow.length) {
      box.innerHTML = renderEmpty();
      return;
    }
    const arrays = await Promise.all(
      doctorsToShow.map((d) => getSchedule(d.id, selectedDate)),
    );
    const all = arrays
      .flat()
      .map((a) => ({ ...a, duration: a.duration || 30 }));
    if (!all.length) {
      box.innerHTML = renderEmpty();
      return;
    }
    box.innerHTML = renderCalendarGrid({
      doctors: doctorsToShow,
      appointments: all,
      selectedDate,
    });
  } catch (err) {
    box.innerHTML = renderError(err?.message || "Не удалось загрузить данные");
  }
}

async function openAddAppointmentModal() {
  const { doctors, selectedDate } = getState();
  let patients = [];
  try {
    patients = await searchPatients("");
  } catch {}
  openModal({
    title: "Новая запись",
    content: renderAddAppointmentForm({ doctors, patients }),
  });

  const form = document.getElementById("addApptForm");
  const errBox = document.getElementById("apptFormError");
  const saveBtn = document.getElementById("saveApptBtn");
  const dateInput = form?.querySelector('[name="date"]');
  if (dateInput) dateInput.value = selectedDate;

  document
    .getElementById("cancelApptForm")
    ?.addEventListener("click", closeModal);
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.textContent = "";
    saveBtn.disabled = true;
    const old = saveBtn.textContent;
    saveBtn.textContent = "Создаём...";
    try {
      const fd = new FormData(form);
      await createAppointment({
        doctorId: fd.get("doctorId"),
        patientId: fd.get("patientId"),
        date: fd.get("date"),
        time: fd.get("time"),
        duration: Number(fd.get("duration")),
      });
      closeModal();
      setState({ selectedDate: fd.get("date") });
      loadCalendarGrid();
    } catch (err) {
      errBox.textContent = err?.message || "Ошибка создания записи";
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = old;
    }
  });
}
