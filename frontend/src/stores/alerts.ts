import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import type { EpiAlert, AlertQuery } from "../types";

const api = createCrudApi<EpiAlert, AlertQuery>("/alerts");
export const useAlertsStore = createCrudStore<EpiAlert, AlertQuery>(api);

export async function deactivateAlert(id: number): Promise<void> {
  await api.action(id, "deactivate");
}
