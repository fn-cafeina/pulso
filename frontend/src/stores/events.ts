import { createCrudApi } from "../lib/createCrudApi";
import { createCrudStore } from "../lib/createStore";
import { apiFetch } from "../lib/api";
import type { HealthEvent, EventQuery, NearbyEvent } from "../types";

const api = createCrudApi<HealthEvent, EventQuery>("/events");
export const useEventsStore = createCrudStore<HealthEvent, EventQuery>(api);

export async function searchEventsNearby(
  lat: number,
  lng: number,
  radius: number
): Promise<NearbyEvent[]> {
  const res = await apiFetch<NearbyEvent[]>(
    `/events?lat=${lat}&lng=${lng}&radius=${radius}`
  );
  return res.data ?? [];
}
