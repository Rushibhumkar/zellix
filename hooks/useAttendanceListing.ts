import { useInfiniteQuery } from "@tanstack/react-query";
import { getAttendanceList } from "../services/hrmApi/attendanceListApi";
import { AttendanceTab, attendanceTabQueryKey, nextAttendancePage, canViewUnapprovedAttendance } from "../utils/attendanceTabs";

export const useAttendanceListing = ({ tab, userId = "", accountId, role, search = "", startDate = "", endDate = "" }: {
  tab: AttendanceTab; userId?: string; accountId?: string; role?: string; search?: string; startDate?: string; endDate?: string;
}) => {
  const query = useInfiniteQuery({
    queryKey: [attendanceTabQueryKey(tab), accountId, userId, search, startDate, endDate],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => getAttendanceList({ tab, userId, search, startDate, endDate, pageParam }),
    getNextPageParam: nextAttendancePage,
    enabled: Boolean(accountId) && (tab !== "unapproved" || canViewUnapprovedAttendance(role)),
  });
  const pages = query.data?.pages || [];
  const rawTotal = pages[0]?.pagination?.totalItem;
  const totalCount = rawTotal !== null && rawTotal !== undefined && rawTotal !== "" &&
    Number.isFinite(Number(rawTotal)) && Number(rawTotal) >= 0 ? Number(rawTotal) : undefined;
  return { ...query, data: pages.flatMap(page => Array.isArray(page?.data) ? page.data : []), totalCount };
};
