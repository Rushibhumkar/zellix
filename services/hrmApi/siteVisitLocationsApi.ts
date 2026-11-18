import { axiosInstance } from "../authApi/axiosInstance";

const endpoint = "/api/hrms/att/site-visit-locations";

export type SiteVisitLocation = { _id: string; name: string };

export async function getSiteVisitLocations(): Promise<SiteVisitLocation[]> {
  const { data } = await axiosInstance.get<{ data: SiteVisitLocation[] }>(endpoint);
  return data.data;
}

export async function addSiteVisitLocation(name: string, link: string) {
  await axiosInstance.post(endpoint, { name, link });
}

export async function getVisitPunchLocations(): Promise<SiteVisitLocation[]> {
  const { data } = await axiosInstance.get<{ data: SiteVisitLocation[] }>("/api/hrms/att/visit-punch-locations");
  return data.data;
}
