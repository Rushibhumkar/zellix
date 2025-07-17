import { useInfiniteQuery } from "@tanstack/react-query";
import { axiosInstance } from "../services/authApi/axiosInstance";

interface TUseMyInfinite {
    url: string;
    queryKeyName: string;
    pramsObj: any;
    onSuccess?: any;
    onError?: any;
}

export const useMyInfinite = ({
    url,
    queryKeyName,
    pramsObj, //{search:'',isAct:''}
    onSuccess,
    onError
}: TUseMyInfinite) => {
    let res = useInfiniteQuery({
        queryKey: [
            queryKeyName,
            ...Object.values(pramsObj),
        ],
        queryFn: async ({ pageParam = 1 }) => {
            try {
                const response = await axiosInstance.get(url, {
                    params: {
                        page: pageParam,
                        ...pramsObj
                    }
                })
                onSuccess && onSuccess(response)
                return response.data
            }
            catch (err) {
                onError && onError(err)
                console.log(queryKeyName, err)
            }
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage?.pagination?.hasNext ? parseInt(lastPage?.pagination?.currentPage) + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
    let data = []
    if (res) {
        data = res?.data?.pages?.map(page => page?.data).flat()
    }
    return { ...res, data }
}
