import { useDelayedLoading } from "../lib/useDelayedLoading";

export function usePageLoader(
  loading: boolean,
  error: string | null,
  itemsLength: number,
) {
  const showSkeleton = useDelayedLoading(loading && itemsLength === 0);
  const errorInitial = error !== null && itemsLength === 0 && !loading;
  return { showSkeleton, errorInitial };
}
