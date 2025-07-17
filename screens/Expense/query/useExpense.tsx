import { myConsole } from "../../../hooks/useConsole"
import { useMyInfinite } from "../../../hooks/useMyInfinite"
import { useMyQuery } from "../../../hooks/useMyQuery"

export const useGetExpensesList = ({ search }) => {
    return useMyInfinite({
        url: 'api/lead/getExpenses',
        pramsObj: { search },
        queryKeyName: 'incentive'
    })
}

export const useGetExpensesDetail = ({ id }) => {
    return useMyQuery({
        url: `api/lead/get-expenses/${id}`,
        queryKeyName: ['getExpensesDetail', id],
        enabled: !!id
    })
}


export const useGetExpenseCategoryList = ({ search }) => {
    return useMyInfinite({
        url: 'api/lead/get-all-category',
        pramsObj: { search },
        queryKeyName: 'getExpenseCategoryList'
    })
}

export const useGetExpenseCategoryDetail = ({ id }) => {
    return useMyQuery({
        url: `api/lead/get-category/${id}`,
        queryKeyName: ['getExpenseCategoryDetail', id],
        enabled: !!id
    })
}

//all approved users
export const useGetApprovedUsers = ({ search }) => {
    return useMyInfinite({
        url: 'api/hrms/user',
        pramsObj: { search, status: 'approved' },
        queryKeyName: 'getApprovedUser'
    })
}

export const useGetUserByRole = ({ search }) => {
    return useMyInfinite({
        url: 'api/lead/getUserByRole',
        pramsObj: { pagination: true, role: 'sup_admin, sr_manager', limit: 10 },
        queryKeyName: 'getUserByRole',
        onError: (err) => {
            myConsole('useGetUserByRole', err)
        }
    })
}
