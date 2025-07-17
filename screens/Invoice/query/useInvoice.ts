import { useMyInfinite } from "../../../hooks/useMyInfinite"
import { useMyQuery } from "../../../hooks/useMyQuery"

export const useGetInvoiceList = ({ search }) => {
    return useMyInfinite({
        url: 'api/lead/getInvoices',
        pramsObj: { search, type: 'invoice' },
        queryKeyName: 'invoiceList'
    })
}

export const useGetInvoiceDetail = ({ id }) => {
    return useMyQuery({
        url: `api/lead/getInvoiceById/${id}`,
        queryKeyName: ['invoiceDetail', id],
        enabled: !!id
    })
}







export const usePersonNameList = ({ search }) => {
    return useMyInfinite({
        url: 'api/hrms/user',
        pramsObj: { search },
        queryKeyName: 'getReceivedCategoryList'
    })
}





