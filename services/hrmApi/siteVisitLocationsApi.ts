import { axiosInstance } from "../authApi/axiosInstance";

const endpoint = "/api/hrms/att/site-visit-locations";

export type SiteVisitLocation = { _id: string; name: string; developerName?: string; displayName?: string; kind?: "office" | "salesCenter" };
export async function getAttendancePunchLocations(action: "CHECK_IN" | "VISIT_IN", signal?: AbortSignal): Promise<SiteVisitLocation[]> {
  const { data } = await axiosInstance.get<{ data: SiteVisitLocation[] }>("/api/hrms/att/punch-locations", { params: { action }, signal });
  if (!Array.isArray(data?.data)) throw new Error("Invalid attendance locations response.");
  return data.data.map(location => ({ ...location, displayName: location.displayName || location.name }));
}

export async function getSiteVisitLocations(): Promise<SiteVisitLocation[]> {
  const { data } = await axiosInstance.get<{ data: SiteVisitLocation[] }>(endpoint);
  return data.data;
}

export async function addSiteVisitLocation(name: string, link: string) {
  await axiosInstance.post(endpoint, { name, link });
}

export async function getVisitPunchLocations(): Promise<SiteVisitLocation[]> {
  const { data } = await axiosInstance.get<{ data: SiteVisitLocation[] }>("/api/hrms/att/visit-punch-locations");
  return data.data
    .filter(location => location._id.startsWith("salesCenter:"))
    .map(location => ({
      ...location,
      displayName: location.developerName
        ? `${location.developerName} - ${location.name}`
        : location.name,
    }));
}
