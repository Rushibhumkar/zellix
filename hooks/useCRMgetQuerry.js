import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { assigningUser, getLead, getLeadDetailById, getLeadPool, getLogsInfoLeadDeatil, getUserInfoLeadDeatil } from "../services/rootApi/leadApi"
import { getMeeting, getMeetingById, getMeetingForBooking } from "../services/rootApi/meetingApi";
import { getBooking, getBookingById } from "../services/rootApi/bookingApi";
import { myConsole } from "./useConsole";
import { getBookingCount, getCommissionCount, getDashboardCount, getMeetingCount } from "../services/rootApi/api";
import { getAllDevelopers } from "../services/rootApi/developerApi";
import { getLeadQuality, getClosingLeadProjectWise,getLeadProjectWise} from "../services/rootApi/api";

export const useGetLeadPool = ({
    search,
}) => {
    let res = useInfiniteQuery({
        queryKey: [
            'getLeadPool',
            search,
        ],
        queryFn: ({ pageParam = 1 }) => getLeadPool({
            pageParam,
            search,
        }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat()
    }
    return { ...res, data }
}

export const useGetLead = ({
    search,
    type,
    limit,
    status,
    individual,
    pagination = true,
    srManager,
    manager,
    assistantManager,
    teamLead,
    agent,
    startDate,
    endDate,
    skipType,
}) => {
    // return useQuery({
    //     queryKey: ['getLead'],
    //     queryFn: () => getLead(),
    //     staleTime: Infinity,
    //     // enabled: !!type
    // })
    let res = useInfiniteQuery({
        queryKey: [
            'getLead',
            search,
            type,
            limit,
            status,
            individual,
            pagination,
            srManager,
            manager,
            assistantManager,
            teamLead,
            agent,
            startDate,
            endDate,
            skipType
        ],
        queryFn: async ({ pageParam = 1 }) => getLead({
            search,
            pageParam,
            type,
            limit,
            status,
            individual,
            pagination,
            srManager,
            manager,
            assistantManager,
            teamLead,
            agent,
            startDate,
            endDate,
            skipType,
        }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat()
    }
    return { ...res, data }
}
export const useGetLeadInAddMeeting = ({
    search,
    pagination = true,
    skipType = true,
}) => {
    // return useQuery({
    //     queryKey: ['getLead'],
    //     queryFn: () => getLead(),
    //     staleTime: Infinity,
    //     // enabled: !!type
    // })
    let res = useInfiniteQuery({
        queryKey: [
            'getLeadInAddMeeting',
            search,
            pagination,
            skipType
        ],
        queryFn: ({ pageParam = 1 }) => getLead({
            search,
            pagination,
            skipType,
            pageParam,
        }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat()
    }
    return { ...res, data }
}

export const useGetLeadById = (id) => {
    let res = useQuery({
        queryKey: ['getLeadDetailById', id],
        queryFn: () => getLeadDetailById(id),
        staleTime: Infinity,
        enabled: !!id
    })
    return res
}

export const useGetUserInfoInLeadDetail = (id) => {
    let res = useQuery({
        queryKey: ['getUserInfoLeadDeatil', id],
        queryFn: async () => await getUserInfoLeadDeatil(id),
        staleTime: Infinity,
        enabled: !!id
    })
    return res
}

export const useGetLogsInfoInLeadDetail = (id) => {
    let res = useQuery({
        queryKey: ['getLogsInfoLeadDeatil', id],
        queryFn: () => getLogsInfoLeadDeatil(id),
        staleTime: Infinity,
        enabled: !!id
    })
    return res
}

// getMeeting
export const useGetMeeting = ({
    search,
    limit,
    status,
    pagination = true,
    srManager,
    manager,
    assistantManager,
    teamLead,
    agent,
    startDate,
    endDate,

}) => {
    // return useQuery({
    //     queryKey: ['getLead'],
    //     queryFn: () => getLead(),
    //     staleTime: Infinity,
    //     // enabled: !!type
    // })
    let res = useInfiniteQuery({
        queryKey: [
            'getMeeting',
            search,
            limit,
            status,
            pagination = true,
            srManager,
            manager,
            assistantManager,
            teamLead,
            agent,
            startDate,
            endDate,
        ],
        queryFn: ({ pageParam = 1 }) => getMeeting({
            search,
            pageParam,
            limit,
            status,
            pagination,
            srManager,
            manager,
            assistantManager,
            teamLead,
            agent,
            startDate,
            endDate,
        }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat()
    }
    return { ...res, data }
}

export const useGetMeetingById = (id) => {
    let res = useQuery({
        queryKey: ['getMeetingById', id],
        queryFn: () => getMeetingById(id),
        staleTime: Infinity,
        enabled: !!id
    })
    return res
}

//getBooking
export const useGetBooking = ({
    search,
    limit,
    status,
    pagination = true,
    type,
    name,
    startDate,
    endDate,
    srManager,
    manager,
    assistantManager,
    teamLead,
    agent,
    clientName,
    clientMobile,
    clientEmail,
    relationshipManager,
    projectName,
    inputStatus,
    developer,
    paymentStatus,
    paymentMode,
    token,
    businessStatus,
}) => {
    // return useQuery({
    //     queryKey: ['getLead'],
    //     queryFn: () => getLead(),
    //     staleTime: Infinity,
    //     // enabled: !!type
    // })
    let res = useInfiniteQuery({
        queryKey: [
            'getBooking',
            search,
            limit,
            status,
            pagination = true,
            type,
            name,
            startDate,
            endDate,
            srManager,
            manager,
            assistantManager,
            teamLead,
            agent,
            clientName,
            clientMobile,
            clientEmail,
            relationshipManager,
            projectName,
            inputStatus,
            developer,
            paymentStatus,
            paymentMode,
            token,
            businessStatus
        ],
        queryFn: ({ pageParam = 1 }) => getBooking({
            search,
            pageParam,
            limit,
            status,
            pagination,
            type,
            name,
            startDate,
            endDate,
            srManager,
            manager,
            assistantManager,
            teamLead,
            agent,
            clientName,
            clientMobile,
            clientEmail,
            relationshipManager,
            projectName,
            inputStatus,
            developer,
            paymentStatus,
            paymentMode,
            token,
            businessStatus
        }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat()
    }
    return { ...res, data }
}
// getBookingById
export const useGetBookingById = (id) => {
    let res = useQuery({
        queryKey: ['getBookingById', id],
        queryFn: () => getBookingById(id),
        staleTime: Infinity,
        enabled: !!id
    })
    return res
}

export const useGetMeetingForBooking = ({
    search
}) => {
    let res = useInfiniteQuery({
        queryKey: [
            'getMeetingForBooking',
            search,
        ],
        queryFn: ({ pageParam = 1 }) => getMeetingForBooking({
            search,
            pageParam,
        }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat();
        // data = res?.data?.pages?.map(page =>
        //     // page?.data
        //     page?.data?.map((el) => {
        //         return {
        //             ...el,
        //             name: `${el?.lead?.clientName}  (${el?.clientAddress})`
        //         }
        //     })
        // ).flat()
    }
    return { ...res, data }
}

export const useAssigningUser = ({
    srManager
}) => {
    let res = useQuery({
        queryKey: ['assigningUser', srManager],
        queryFn: () => assigningUser({
            srManager
        }),
        staleTime: Infinity,
        enabled: !!srManager
    })
    return res
}

export const useGetDashboardCount = () => {
    let res = useQuery({
        queryKey: ['getDashboardCount'],
        queryFn: () => getDashboardCount(),
        staleTime: Infinity,
    })
    return res
}
export const useGetBookingCount = () => {
    let res = useQuery({
        queryKey: ['getBookingCount'],
        queryFn: () => getBookingCount(),
        staleTime: Infinity,
    })
    return res
}
export const useGetMeetingCount = () => {
    let res = useQuery({
        queryKey: ['getMeetingCount'],
        queryFn: () => getMeetingCount(),
        staleTime: Infinity,
    })
    return res
}

// api/booking/getCommissionData
export const useGetCommissionCount = () => {
    let res = useQuery({
        queryKey: ['getCommissionCount'],
        queryFn: () => getCommissionCount(),
        staleTime: Infinity,
    })
    return res
}

export const useGetDeveloperList = () => {
    let res = useQuery({
        queryKey: ['getAllDevelopers'],
        queryFn: () => getAllDevelopers(),
        staleTime: Infinity,
    })
    return res
}

export const useGetLeadQuality = () => {
    let res= useQuery({
        queryKey: ['getLeadQuality'],
        queryFn: () => getLeadQuality(),
        staleTime: Infinity,
    });
    return res
};

export const useGetLeadProjectWise = (startDate, endDate) => {
    let res= useQuery({
        queryKey: ['getLeadProjectWise', startDate, endDate],
        queryFn: () => getLeadProjectWise(startDate, endDate),
        staleTime: Infinity,
        enabled: !!startDate && !!endDate,
    });
    return res
};

export const useGetClosingLeadProjectWise = (startDate, endDate) => {
   let res=  useQuery({
        queryKey: ['getClosingLeadProjectWise', startDate, endDate],
        queryFn: () => getClosingLeadProjectWise(startDate, endDate),
        staleTime: Infinity,
        enabled: !!startDate && !!endDate,
    });
    return res
};