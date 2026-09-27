import { ROLE_LABELS } from "./roles";
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

export type UserStatusKey = 'active' | 'resigned' | 'terminated' | 'inactive';

export const userStatusHRM: Record<UserStatusKey, string> = {
    active: 'Active',
    resigned: 'Resigned',
    terminated: 'Terminated',
    inactive: 'Inactive'
}

export const getUserStatusHRM = (user: {
    activeStatus?: string;
    accountStatus?: string;
    inactiveReason?: string;
}): UserStatusKey => {
    if (user?.inactiveReason === 'resigned' || user?.activeStatus === 'resign') return 'resigned';
    if (user?.inactiveReason === 'terminated' || user?.activeStatus === 'terminated') return 'terminated';
    if (user?.accountStatus === 'inactive') return 'inactive';
    return 'active';
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
export const roleHRM = { ...ROLE_LABELS, "Super Admin": "Super Admin WR" };
