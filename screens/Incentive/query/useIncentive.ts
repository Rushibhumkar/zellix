import { myConsole } from "../../../hooks/useConsole"
import { useMyInfinite } from "../../../hooks/useMyInfinite"
import { useMyQuery } from "../../../hooks/useMyQuery"

export const useGetIndividualIncentiveList = ({ search }) => {
    return useMyInfinite({
        url: '/api/incentive/getIncentives',
        pramsObj: { search },
        queryKeyName: 'individualIncentiveList'
    })
}
export const useGetIndividualIncentiveDetail = ({ id }) => {
    return useMyQuery({
        url: `/api/incentive/details/${id}`,
        queryKeyName: ['individualIncentiveDetail', id],
        enabled: !!id,
        onError: (e) => {
            myConsole('incentive_detail_errJavresponse', e?.response)
        },
        onSuccess: (s) => {
            myConsole('incentive_detail_succJav', s)
        }
    })
}
// export const useGetIndividualIncentiveDetail = (id) => {
//     return useQuery({
//         queryKey: ['incentiveDetail', id],
//         queryFn: async () => {
//             try {
//                 let res = await axiosInstance.get(`/api/incentive/details/${id}`);
//                 console.log('resvsdf', res)
//                 return res || {}
//             }
//             catch (err) {
//                 myConsole('err', err)
//             }
//         },
//         enabled: !!id
//     })
// }
// team incentive bad me
// export const useGetTeamIncentiveList = ({ search }) => {
//     return useMyInfinite({
//         url: 'api/lead/getExpenses',
//         pramsObj: { search },
//         queryKeyName: 'teamIncentiveList'
//     })
// }

// export const useGetTeamIncentiveDetail = ({ id }) => {
//     return useMyQuery({
//         url: `api/lead/get-expenses/${id}`,
//         queryKeyName: ['teamIncentiveDetail', id],
//         enabled: !!id
//     })
// }