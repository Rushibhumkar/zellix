import { color } from "../const/color"
//user Form Status
export const statusHRM = {
    new: 'New',
    pending: 'Pending',
    rejected: 'Rejected',
    approved: 'Approved',
    forwarded: 'Forwarded',
    cancel: 'Cancel'
}

export const statusKeyHRM = {
    approved: 'approved',
    rejected: 'rejected',
    new: 'new',
    pending: 'pending',
    forwarded: 'forwarded',
    cancel: 'cancel'
}

export const statusColor = {
    new: color.saffronMango,
    pending: color.pending,
    rejected: color.reject,
    approved: color.approve,
    forwarded: color.forwarded,
    cancel: color.dullRed
}

//attendance
export const statusColorAttend = {
    absent: color.red,
    present: color.green,
    leave: color.pending,
    halfDay: color.new
}

export const statusAttend = {
    absent: 'Absent',
    present: 'Present',
    leave: 'Leave',
    halfDay: 'Half Day'
}

export const punchType = {
    leave: 'Leave',
    office: 'Office',
    remote: 'Remote'
}
export const attendanceStatus = [
    { _id: 'absent', name: 'Absent' },
    { _id: 'present', name: 'Present' }, //"absent", "present", "halfDay", 'leave',
    { _id: 'halfDay', name: 'Half Day' },
    { _id: 'leave', name: 'Leave' },
]
//
export const roleHRM = {
    sr_manager: 'Sr Manager',
    manager: 'Manager',
    assistant_manager: 'Assistant Manager',
    team_lead: 'Team Lead',
    agent: 'Agent',
    sup_admin: 'Sup Admin',
    sub_admin: 'Sub Admin',
    'Super Admin': 'Super Admin WR'
}

