import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function useRoute(start, end) {
  // alleen fetchen als coords volledig beschikbaar zijn
  const shouldFetch = start?.length === 2 && end?.length === 2;

  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `/api/route?start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    route: data,
    instructions: data?.features?.[0]?.properties?.segments?.[0]?.steps ?? [],
    distance: data?.features?.[0]?.properties?.segments?.[0]?.distance ?? null,
    duration: data?.features?.[0]?.properties?.segments?.[0]?.duration ?? null,
    isLoading,
    isError: error,
  };
}
