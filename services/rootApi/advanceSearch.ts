import { axiosInstance } from "../authApi/axiosInstance";


export const getASBooking = (data) =>
    axiosInstance.post('/api/booking/filterBookings', data)
        .then(res => res)


export const getASMeeting = (data) =>
    axiosInstance.post('/api/meeting/filterMeetings', data)
        .then(res => res)

export const getASLead = (data) =>
    axiosInstance.post('/api/lead/filterLeads', data)
        .then(res => res)

