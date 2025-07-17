import { myConsole } from "../../hooks/useConsole"
import { popUpConfToast } from "../../utils/toastModalByFunction"
import { axiosInstance } from "../authApi/axiosInstance"

export const addBooking = async ({ data, onSuccess }) => {
    try {
        let res = await axiosInstance.post('/api/booking', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        popUpConfToast.successMessage(res?.data || 'Booking Added Successfully')
        onSuccess && onSuccess(res)
        return res
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Something Went Wrong')
        // myConsole('errAddBooking', err?.response?.data)
    }
}

export const updateBooking = async ({ id, data, onSuccess }) => {
    try {
        const res = await axiosInstance.post(`/api/booking/updateBookingById/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        // myConsole('bookingRes', res)
        popUpConfToast.successMessage(res?.data || 'Booking Updated Successfully')
        onSuccess && onSuccess(res)
        return res
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Something Went Wrong')
        // myConsole('UpdateBookingError', err)
    }
}

export const deleteBookings = (data: [string]) => {
    return axiosInstance.post('/api/booking/deleteBookingsById', data)
        .then(res => res)
}

export const rejectBooking = (id: string, data: any) => {
    return axiosInstance.post(`/api/booking/bookingRejectedById/${id}`, data)
        .then(res => res)
}


export const approvedBooking = (id: string, data: any) => {
    return axiosInstance.post(`/api/booking/bookingApprovedById/${id}`, data)
        .then(res => res)
}

export const updateCase = (id: string, data: any) => {
    return axiosInstance.post(`/api/booking/caseFileUpload/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then(res => {
            popUpConfToast.successMessage(res?.data)
            return res?.data
        })
        .catch(err => {
            myConsole('errUpdateCase', err?.response?.data)
            popUpConfToast.errorMessage('Server error')
        })
}

export const getBooking = async ({
    search = null,
    pageParam = 1,
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
}) => {
    try {
        const response = await axiosInstance.get('api/booking', {
            params: {
                page: pageParam,
                search,
                ...(pagination && { pagination }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(limit && { limit }),
                ...(status && { status }),
                ...(srManager && { srManager }),
                ...(manager && { manager }),
                ...(assistantManager && { assistantManager }),
                ...(teamLead && { teamLead }),
                ...(agent && { agent }),
                //
                ...(type && { type }),
                ...(name && { name }),
                ...(clientName && { clientName }),
                ...(clientMobile && { clientMobile }),
                ...(clientEmail && { clientEmail }),
                ...(relationshipManager && { relationshipManager }),
                ...(projectName && { projectName }),
                ...(inputStatus && { inputStatus }),
                ...(developer && { developer }),
                ...(paymentStatus && { paymentStatus }),
                ...(paymentMode && { paymentMode }),
                ...(token && { token }),
                ...(businessStatus && { businessStatus }),
            },
        });
        return response.data
    }
    catch (err) {
        console.log('getBookingErrPag', err)
    }
}

export const getBookingById = async (id) => {
    try {
        const response = await axiosInstance.get(`api/booking/getBookingDetailsById/${id}`)
        return response.data
    }
    catch (err) {
        console.log('getBookingByIdErrPag', err)
    }
}



