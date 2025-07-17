import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "../services/authApi/axiosInstance"

interface TUseMyQuery {
    url: string;
    queryKeyName: any;
    enabled?: boolean;
    onSuccess?: any;
    onError?: any;
}
export const useMyQuery = ({
    url,
    queryKeyName,
    enabled,
    onSuccess,
    onError
}: TUseMyQuery) => {
    if (enabled) {
        return useQuery({
            queryKey: queryKeyName,
            queryFn: async () => {
                try {
                    const response = await axiosInstance.get(url)
                    !!onSuccess && onSuccess(response);
                    return response?.data || {}
                }
                catch (err) {
                    console.log('useMyQuery', queryKeyName, err)
                    !!onError && onError(err)
                }
            },
            staleTime: 1000 * 60 * 10,
            enabled: enabled
        })
    }

}