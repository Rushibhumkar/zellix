import { myConsole } from "../../hooks/useConsole"
import { popUpConfToast } from "../../utils/toastModalByFunction"
import { axiosInstance } from "../authApi/axiosInstance"

export const getProjectList = async ({
    pageParam = 1,
    search = '',
    limit = 10,
    pagination = true
}) => {
    try {
        const response = await axiosInstance.get('/api/project', {
            params: {
                page: pageParam,
                limit,
                pagination,
                search,
            }
        })
        return response.data
    }
    catch (err) {
        console.log('getProjectListErr', err)
    }
}

export const getProjectById = async (id) => {
    try {
        const response = await axiosInstance.get(`api/project/${id}`)
        return response.data
    }
    catch (err) {
        console.log('getMeetingByIdErrPag', err)
    }
}

interface TupdateProject {
    id?: string,
    data: {
        formId: string,
        members: string[],
        pageName: string,
        projectName: string,
        source: string,
        srManager: string,
    }
}

export const addProject = async ({
    data
}: TupdateProject) => {
    try {
        const response = await axiosInstance.post(`api/project`, data)
        return response.data
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Internal Error')
        myConsole('addProjectErrPag', err?.response?.data)
    }
}

export const updateProject = async ({
    id,
    data
}: TupdateProject) => {
    try {
        const response = await axiosInstance.post(`api/project/updateProject/${id}`, data)
        return response.data
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Internal Error')
        console.log('updateProjectErrPag', err)
    }
}

interface TDeleteProject {
    idArr: any
}

export const deleteProject = async ({
    idArr,
}: TDeleteProject) => {
    try {
        const response = await axiosInstance.post(`api/project/deleteProjects`, { ids: idArr })
        popUpConfToast.successMessage(response?.data?.message || 'Internal Error')
        return response.data
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Internal Error')
        console.log('deleteProjectErrPag', err)
    }
}