import { axiosInstance } from "../authApi/axiosInstance";

interface TAddTeam {
    agents: [];
    createdBy: string;
    managerId: string;
    name: string;
    srManagerId: string;
    teamLeadId: string;
}

export const addTeam = (data: TAddTeam) =>
    axiosInstance.post('/api/team', data)
        .then(res => res?.data)

export const updateTeam = ({ id, data }) =>
    axiosInstance.put(`/api/team/teamUpdateById/${id}`, data)
        .then(res => res)


export const deleteTeam = (id: string) => {
    axiosInstance.delete(`/api/team/${id}`)
        .then(res => res)
}       
