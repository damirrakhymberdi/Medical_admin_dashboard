import {
  createPayment,
  getPaymentsByDate,
  searchPatients,
} from "../../core/api.js";
import { getState, setState } from "../../core/state.js";
import {
  renderPaymentsPage,
  renderLoading,
  renderError,
  renderEmpty,
  renderPaymentsTable,
} from "./payments.view.js";

export async function mountPaymentsPage() {
  const page = document.getElementById("page-content");
  const date = getState().selectedDate;

  let patients = [];
  try {
    patients = await searchPatients("");
  } catch {}

  page.innerHTML = renderPaymentsPage({ date, patients });

  const dateInput = document.getElementById("payDate");
  const patientSelect = document.getElementById("payPatient");
  const amountInput = document.getElementById("payAmount");
  const methodSelect = document.getElementById("payMethod");
  const submitBtn = document.getElementById("paySubmit");
  const errBox = document.getElementById("payError");
  const stateBox = document.getElementById("paymentsState");
  const tableBox = document.getElementById("paymentsTable");

  loadPayments(date);

  dateInput.addEventListener("change", () => {
    setState({ selectedDate: dateInput.value });
    loadPayments(dateInput.value);
  });

  submitBtn.addEventListener("click", async () => {
    errBox.textContent = "";
    const amount = Number(amountInput.value);
    const method = methodSelect.value;
    const patientId = patientSelect?.value;

    if (!Number.isFinite(amount) || amount <= 0) {
      errBox.textContent = "Введите корректную сумму";
      return;
    }
    if (!patientId) {
      errBox.textContent = "Выберите пациента";
      return;
    }

    submitBtn.disabled = true;
    const oldHtml = submitBtn.innerHTML;
    submitBtn.textContent = "Загрузка...";

    try {
      await createPayment({
        date: dateInput.value,
        amount,
        method,
        patientId,
        visitId: null,
      });
      amountInput.value = "";
      await loadPayments(dateInput.value);
    } catch (err) {
      errBox.textContent = err?.message || "Ошибка при оплате";
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = oldHtml;
    }
  });

  async function loadPayments(date) {
    try {
      stateBox.innerHTML = renderLoading("Загрузка...");
      tableBox.innerHTML = "";
      const list = await getPaymentsByDate(date);
      setState({ payments: list });
      if (!list.length) {
        stateBox.innerHTML = renderEmpty();
        return;
      }
      stateBox.innerHTML = "";
      tableBox.innerHTML = renderPaymentsTable(list);
    } catch (err) {
      stateBox.innerHTML = renderError(
        err?.message || "Не удалось загрузить оплаты",
      );
      tableBox.innerHTML = "";
    }
  }
}
