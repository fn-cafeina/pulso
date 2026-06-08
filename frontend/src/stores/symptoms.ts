import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { SymptomReport } from "../types";

const api = createCrudApi<SymptomReport>("/symptoms");
export const useSymptomsStore = createCrudStore<SymptomReport>(api);
