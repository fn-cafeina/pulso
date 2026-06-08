import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import { apiFetch } from "../lib/api";
import type { HealthService, ServiceQuery, NearbyService } from "../types";

const api = createCrudApi<HealthService, ServiceQuery>("/services");
export const useServicesStore = createCrudStore<HealthService, ServiceQuery>(api);

export async function searchServicesNearby(
  lat: number,
  lng: number,
  radius: number
): Promise<NearbyService[]> {
  const res = await apiFetch<NearbyService[]>(
    `/services?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return res.data ?? [];
}
