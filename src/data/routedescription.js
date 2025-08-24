import fetcher from './_fetcher';
import useSWR from 'swr';

export default function useRoute(start, end) {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_TOKEN;

  const shouldFetch = start && end;

  const { data, error, isLoading } = useSWR(
    shouldFetch
      ? `https://api.openrouteservice.org/v2/directions/cycling-regular?api_key=${apiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}&language=nl`
      : null,
    fetcher,
    { revalidateOnFocus: false } // voorkomt dat hij terug ENG cachet
  );

  return {
    route: data, // volledige route
    instructions: data?.features?.[0]?.properties?.segments?.[0]?.steps ?? [],
    distance: data?.features?.[0]?.properties?.segments?.[0]?.distance ?? null,
    duration: data?.features?.[0]?.properties?.segments?.[0]?.duration ?? null,
    isLoading,
    isError: error,
  };
}
