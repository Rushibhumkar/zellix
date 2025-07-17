import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: "User",
    initialState: {
        user: {},
        meeting: [],
        team: [],
        bookings: [],
        lead: [],
        allUsers: [],
        loading: {
            meeting: false,
            team: false,
            bookings: false,
            lead: false,
            allUsers: false
        },
        isOffline: false,
        advanceBooking: null,
        advanceLead: null,
        advanceMeeting: null,
        developer: [],
        isCalling: false,
        callDetect: {
            isCall: false,
            leadId: null
        },
        leadQueryKey: null,
        meetingQueryKey: null,
        bookingQueryKey: null,
    },
    reducers: {
        setUserInfo: (state, action) => {
            state.user = action.payload;
        },
        setMeeting: (state, action) => {
            state.meeting = action.payload;
        },
        setTeam: (state, action) => {
            state.team = action.payload;
        },
        setBookings: (state, action) => {
            state.bookings = action.payload;
        },
        setLead: (state, action) => {
            state.lead = action.payload;
        },
        setAllUsers: (state, action) => {
            state.allUsers = action.payload
        },
        setNotication: (state, { payload }) => {
            state.user.notifications = payload;
        },
        startLoading: (state, action) => {
            state.loading[action.payload] = true;
        },
        stopLoading: (state, action) => {
            state.loading[action.payload] = false;
        },
        setIsOffline: (state, action) => {
            state.isOffline = action.payload;
        },
        setAdvanceBooking: (state, action) => {
            state.advanceBooking = action.payload;
        },
        setAdvanceLead: (state, action) => {
            state.advanceLead = action.payload
        },
        setAdvanceMeeting: (state, action) => {
            state.advanceMeeting = action.payload
        },
        setDeveloper: (state, action) => {
            state.developer = action.payload
        },
        setIsCalling: (state, action) => {
            state.isCalling = action.payload
        },

        setCallDetect: (state, action) => {
            state.callDetect = action.payload
        },
        setLeadQueryKey: (state, action) => {
            state.leadQueryKey = action.payload;
        },
        setMeetingQueryKey: (state, action) => {
            state.meetingQueryKey = action.payload;
        },
        setBookingQueryKey: (state, action) => {
            state.bookingQueryKey = action.payload;
        },
    },
})

export const { setUserInfo,
    setMeeting,
    setTeam,
    setBookings,
    setLead,
    setAllUsers,
    setNotication,
    startLoading,
    stopLoading,
    setIsOffline,
    setAdvanceBooking,
    setAdvanceLead,
    setAdvanceMeeting,
    setDeveloper,
    setIsCalling,
    setCallDetect,
    setLeadQueryKey,
    setMeetingQueryKey,
    setBookingQueryKey
} = userSlice.actions;

export const selectUser = (state) => {
    return state.user
};

export default userSlice.reducer;