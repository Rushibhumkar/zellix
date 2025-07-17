import { myConsole } from "../../hooks/useConsole";
import { axiosInstance } from "../authApi/axiosInstance";


interface TUpdateExpense { 
expenseAmount:number,
vatPercent:number,
officeName:string,
expenseDate: string
responsiblePerson:string,
team:string,
remarks:string,
vatAmount:number,
amountExcludedVat:number,
expenseCategory:number,
expenseSubCategory:number,
}




export const updateExpanse = (  data: TUpdateExpense ) =>
    axiosInstance.put(`lead/update-expenses/67b6cdfde78efb8042adf90b`, data)
        .then(res => res)
    