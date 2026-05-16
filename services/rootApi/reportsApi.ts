import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../authApi/axiosInstance";
import { myConsole } from "../../hooks/useConsole";

interface GetLeadCallReportsParams {
  startDate?: string | null;
  endDate?: string | null;
  leadType?: string;
  pnls?: string[];
  teams?: string[];
  agents?: string[];
}

export const getLeadCallReports = async ({
  startDate = null,
  endDate = null,
  leadType = "lead",
  pnls = [],
  teams = [],
  agents = [],
}: GetLeadCallReportsParams) => {
  const res = await axiosInstance.get("/api/lead/reports/call-logs", {
    params: {
      startDate,
      endDate,
      leadType,
      pnls,
      teams,
      agents,
    },
  });
  // myConsole("API RESPONSE =>", res?.data);
  return res?.data;
};

export const useGetLeadCallReports = ({
  startDate = null,
  endDate = null,
  leadType = "lead",
  pnls = [],
  teams = [],
  agents = [],
}: GetLeadCallReportsParams) => {
  return useQuery({
    queryKey: [
      "getLeadCallReports",
      startDate,
      endDate,
      leadType,
      pnls,
      teams,
      agents,
    ],
    queryFn: () =>
      getLeadCallReports({
        startDate,
        endDate,
        leadType,
        pnls,
        teams,
        agents,
      }),

    staleTime: 1000 * 60 * 5,

    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
