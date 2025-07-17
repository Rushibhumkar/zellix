import { View, Text } from 'react-native'
import React, { FC, useState } from 'react'
import CustomModal from '../../myComponents/CustomModal/CustomModal'
import DropdownRNE from '../../myComponents/DropdownRNE/DropdownRNE'
import { WIDTH } from '../../const/deviceInfo'
import CustomText from '../../myComponents/CustomText/CustomText'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import { useDispatch, useSelector } from 'react-redux'
import { selectUser } from '../../redux/userSlice'
import { myConsole } from '../../hooks/useConsole'
import { leadAssignById } from '../../services/rootApi/leadApi'
import { getAllLeadFunc } from '../../redux/action'
import { useAssigningUser } from '../../hooks/useCRMgetQuerry'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeyCRM } from '../../utils/queryKeys'

interface TMultipleLeadAssign {
    selected: [string]
    visible: boolean,
    setSelected: (a: []) => void,
    toggleModal: () => void,
    setSnackBar: any,
}

const MultipleLeadAssign: FC<TMultipleLeadAssign> = ({
    selected,
    visible,
    setSelected,
    toggleModal,
    setSnackBar
}) => {
    const queryClient = useQueryClient();
    const { team, user } = useSelector(selectUser);
    const [srManager, setSrManager] = useState('');
    const [assign, setAssign] = useState('')
    const [assignUserList, setAssignUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const {
        data: assigningUserList,
        isLoading: loadingAssign
    } = useAssigningUser({
        srManager
    })

    // const onSelectManager = (srMngId) => {
    //     let srManagerId = srMngId;
    //     setSrManager(srManagerId);
    //     let filterTeam = team.filter((el) => {
    //         return el?.srManager?._id === srManagerId
    //     })
    //     const newArray = Array.from(
    //         new Set(filterTeam.flatMap(obj =>
    //             Object.values(obj).flatMap(value =>
    //                 (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null))
    //                     ? value.flatMap(agent => JSON.stringify(agent))
    //                     : [JSON.stringify(value)]
    //             )
    //         ))
    //     ).map(str => JSON.parse(str)).filter(obj => typeof (obj) !== 'string' && !!obj).map((el) => {
    //         return {
    //             ...el,
    //             name: `${el.name} (${el?.role})`,
    //             nameR: el?.name
    //         }
    //     });
    //     setAssignUserList(newArray)
    // }
    const onModalClose = () => {
        toggleModal();
        setSrManager('');
        setAssign('');
    }

    const handleSubmit = async () => {

        try {
            setIsLoading(true);
            const sendData = {
                leads: selected,
                srManager,
                ...(assign && { assign: assign })
            }

            const resAssignLead = await leadAssignById(sendData);
            queryClient.invalidateQueries({
                queryKey: [queryKeyCRM.getLead]
            })

            setSnackBar({
                visible: true,
                text: resAssignLead?.data,
                error: false,
            });
            setSelected([])
        }
        catch (err) {
            myConsole('errorAssignLead', err)
        }
        finally {
            setIsLoading(false);
            onModalClose()
        }
    }


    return (
        <CustomModal
            visible={visible}
            onClose={onModalClose}
            hasBackdrop={true}
        >
            <View
                style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 10,
                    width: WIDTH * 0.7
                }}
            >
                <View>
                    <CustomText
                        fontSize={20}
                        marginBottom={15}
                        fontWeight='700'
                    >
                        Assign Lead
                    </CustomText>
                    <DropdownRNE
                        label='Sr Manager'
                        placeholder='Sr Manager'
                        containerStyle={{ marginBottom: 15 }}
                        keyName='sr_manager'
                        onChange={(v) => setSrManager(v)}
                    // initialValue={srManager}
                    />
                    <DropdownRNE
                        label='Users'
                        placeholder='Users'
                        containerStyle={{ marginBottom: 10 }}
                        arrOfObj={assigningUserList?.data || []}
                        onChange={(v) => setAssign(v)}
                        initialValue={assign}
                    />
                    <CustomBtn
                        title='Save'
                        containerStyle={{ margin: 20 }}
                        disabled={!srManager}
                        onPress={handleSubmit}
                        isLoading={isLoading}
                    />
                </View>
            </View>
        </CustomModal>
    )
}

export default MultipleLeadAssign