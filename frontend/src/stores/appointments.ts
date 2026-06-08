import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { Appointment } from "../types";

const api = createCrudApi<Appointment>("/appointments");
export const useAppointmentsStore = createCrudStore<Appointment>(api);
