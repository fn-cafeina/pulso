import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { Appointment } from "../types";

type NoQuery = Record<string, never>;
const api = createCrudApi<Appointment, NoQuery>("/appointments");
export const useAppointmentsStore = createCrudStore<Appointment, NoQuery>(api);
