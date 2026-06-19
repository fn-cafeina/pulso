import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { SymptomReport } from "../types";

type NoQuery = Record<string, never>;
const api = createCrudApi<SymptomReport, NoQuery>("/symptoms");
export const useSymptomsStore = createCrudStore<SymptomReport, NoQuery>(api);
