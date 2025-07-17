import { myConsole } from "../../hooks/useConsole";
import { axiosInstance } from "../authApi/axiosInstance"

interface TAddMeeting {
    agents: [string];
    clientAddress: string;
    clientCity: string;
    clientCountry: string;
    lead: string;
    location: string;
    productPitch: string;
    remarks: string;
    scheduleDate: string;
    self: boolean;
    status: 'conducted' | 'schedule';
}

export const addMeeting = (data: TAddMeeting) => {
    return axiosInstance.post('/api/meeting', data)
        .then((res) => res)
        .catch(err => {
            throw new Error(err)
        })
}

export const updateMeeting = ({ id, data }) => {
    return axiosInstance.put(`/api/meeting/updateMeetingById/${id}`, data)
        .then((res) => res)
        .catch(err => {
            throw new Error(err)
        })
}

export const deleteMeeting = (id: [string]) => {
    return axiosInstance.post('/api/meeting/deleteMeetingsById', id)
        .then((res) => res)
        .catch(err => {
            throw new Error(err)
        })
}

export const meetingRescheduled = (id: string, data) => {
    return axiosInstance.post(`/api/meeting/reScheduleMeetingById/${id}`, data)
        .then(res => res)
        .catch(err => {
            throw new Error(err)
        })

}
export const meetingOtpGenerate = (id: string) => {
    return axiosInstance.post(`/api/meeting/meetingOtpGenerate/${id}`)
        .then(res => res)
        .catch(err => {
            throw new Error(err)
        })
}
export const meetingOtpVerify = (id: string, data) => {
    return axiosInstance.post(`/api/meeting/meetingOtpVerify/${id}`, data)
        .then(res => res)
        .catch(err => {
            throw new Error(err)
        })
}

export const meetingConduct = (id: string, data) => {
    return axiosInstance.post(`/api/meeting/conductById/${id}`, data)
        .then(res => res)
        .catch(err => {
            throw new Error(err)
        })
}

export const getMeeting = async ({
    search = null,
    pageParam = 1,
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
    try {
        const response = await axiosInstance.get('api/meeting', {
            params: {
                page: pageParam,
                search,
                ...(limit && { limit }),
                ...(status && { status }),
                ...(srManager && { srManager }),
                ...(manager && { manager }),
                ...(assistantManager && { assistantManager }),
                ...(teamLead && { teamLead }),
                ...(agent && { agent }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(pagination && { pagination }),
            },
        });
        return response.data
    }
    catch (err) {
        console.log('getMeetingErrPag', err)
    }
}

export const getMeetingById = async (id) => {
    try {
        const response = await axiosInstance.get(`api/meeting/meetingDetailsById/${id}`)
        return response.data
    }
    catch (err) {
        console.log('getMeetingByIdErrPag', err)
    }
}

export const getMeetingForBooking = async ({
    search = '',
    pageParam = 1,
}) => {
    try {
        const response = await axiosInstance.get(`api/meeting/getMeetingForBooking`, {
            params: {
                page: pageParam,
                search
            },
        })
        return response.data
    }
    catch (err) {
        console.log('getMeetingForBookingErrPag', err)
    }
}


