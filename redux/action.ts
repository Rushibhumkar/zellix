import { myConsole } from "../hooks/useConsole";
import { getAllBooking, getAllLead, getAllMeeting, getAllUsers, getTeam } from "../services/rootApi/api"
import { getAllDevelopers } from "../services/rootApi/developerApi";
import { setAllUsers, setBookings, setDeveloper, setLead, setMeeting, setTeam, startLoading, stopLoading } from "./userSlice"

export const getUserFunc = () => {
    return async (dispatch) => {
        try {
            await dispatch(startLoading('allUsers'));
            const res = await getAllUsers();
            await dispatch(setAllUsers(res));
            await dispatch(stopLoading('allUsers'));
        }
        catch (error) {
            console.log('error in getUserFunc', error)
            await dispatch(stopLoading('allUsers'));
        }

    }
}

export const getAllLeadFunc = () => {
    return async (dispatch) => {
        await dispatch(startLoading('lead'));
        try {
            const res = await getAllLead({ type: null });
            dispatch(setLead(res))
            await dispatch(stopLoading('lead'));
        }
        catch (err) {
            console.log('error in getAllLeadFunc', err)
            await dispatch(stopLoading('lead'));
        }

    }
}

export const getAllBookingFunc = () => {
    return async (dispatch) => {
        await dispatch(startLoading('bookings'));
        try {
            const res = await getAllBooking()
            await dispatch(setBookings(res))
            await dispatch(stopLoading('bookings'));
        }
        catch (err) {
            console.log('getAllBookingFunc', err)
            await dispatch(stopLoading('bookings'));
        }

    }
}

export const getTeamFunc = () => {
    return async (dispatch) => {
        await dispatch(startLoading('team'));
        try {
            const res = await getTeam()
            await dispatch(setTeam(res))
            await dispatch(stopLoading('team'));
        }
        catch (err) {
            console.log('getTeamFunc', err)
            await dispatch(stopLoading('team'));
        }

    }
}

export const getAllMeetingFunc = () => {
    return async (dispatch) => {
        try {
            await dispatch(startLoading('meeting'));
            const res = await getAllMeeting()
            await dispatch(setMeeting(res))
            await dispatch(stopLoading('meeting'));
        }
        catch (err) {
            console.log('getAllMeetingFunc', err)
            await dispatch(stopLoading('meeting'));
        }
    }
}

export const getAllDeveloperFunc = () => {
    return async (dispatch) => {
        try {
            const res = await getAllDevelopers();
            dispatch(setDeveloper(res));
        }
        catch (err) {
            console.log('getAllDevelopersFunc', err)
        }
    }
}

export const onLogOutEmpty = () => {
    return async (dispatch) => {
        try {
            dispatch(setMeeting([]))
            dispatch(setTeam([]))
            dispatch(setBookings([]))
            dispatch(setLead([]))
            dispatch(setAllUsers([]))
        }
        catch (error) { console.log('onLogOutEmptyError', error) }
    }
}

