import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { VaccinationRecord } from "../types";

type NoQuery = Record<string, never>;
const api = createCrudApi<VaccinationRecord, NoQuery>("/vaccines");
export const useVaccinesStore = createCrudStore<VaccinationRecord, NoQuery>(api);
