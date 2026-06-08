import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { VaccinationRecord } from "../types";

const api = createCrudApi<VaccinationRecord>("/vaccines");
export const useVaccinesStore = createCrudStore<VaccinationRecord>(api);
