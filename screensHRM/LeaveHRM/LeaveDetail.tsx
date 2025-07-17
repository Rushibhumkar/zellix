import React, { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import CustomText from '../../myComponents/CustomText/CustomText'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import OutlineBtn from '../../myComponents/OutlineBtn/OutlineBtn'
import { dummyLeaveDetail } from '../../utils/dummyData'
import TitleInDetail from '../../myComponentsHRM/TitleHRM/TitleInDetail'
import RowItemDetail from '../../myComponentsHRM/Row/RowItemDetail'
import { useRoute } from '@react-navigation/native'
import { useGetLeaveDetail } from '../../hooks/useGetQuerryHRM'
import { myConsole } from '../../hooks/useConsole'
import { roleHRM, statusHRM, statusKeyHRM } from '../../utils/hrmKeysMatchToBE'
import { color } from '../../const/color'
import { leaveApprove, leaveApproveReject, leaveReject } from '../../services/hrmApi/leaveHrmApi'
import { useQueryClient } from '@tanstack/react-query'
import { popUpConfToast } from '../../utils/toastModalByFunction'
import PleaseWait from '../../myComponentsHRM/PleaseWait/PleaseWait'
import ImageViewModal from '../../myComponentsHRM/ImageViewModal/ImageViewModal'
import { queryKeyHRM } from '../../utils/queryKeys'
import ModalWithBlur from '../../myComponentsHRM/ModalWithBlur/ModalWithBlur'
import LeaveAppRemark from './components/LeaveAppRemark'
import { useSelector } from 'react-redux'
import { selectUser } from '../../redux/userSlice'
import { roleEnum } from '../../utils/data'

const whichStatus = {
    Cancel: 'leaveCancelById',
    Approve: 'leaveApproveById',
    Reject: 'leaveRejectById',
}
const LeaveDetail = () => {
    const { params } = useRoute();
    const { user } = useSelector(selectUser);
    const isAgentTl = user?.role === roleEnum.agent || user?.role === roleEnum.team_lead;
    const queryClient = useQueryClient();
    const [leaveDetailById, setLeaveDetailById] = useState(dummyLeaveDetail)
    const {
        data,
        isLoading: isLoadingDetail,
        refetch,
        isRefetching
    } = useGetLeaveDetail({ id: params?.item?.from === 'nav' ? params?.item?.dataId : params?.item?._id })
    const [refreshing, setRefreshing] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [openModal, setOpenModal] = useState({
        open: false,
        which: 'Approve'//Reject
    })
    console.log('remarks', remarks)
    useEffect(() => {
        let aa = dummyLeaveDetail?.map((el, i) => {
            if (data?.hasOwnProperty(el?.key)) {
                if (!!el?.subKey) {
                    return {
                        ...el,
                        value: data[el?.key]?.[el?.subKey]
                    }
                } else {
                    return { ...el, value: data[el?.key] }
                }
            } else return el
        });
        setLeaveDetailById(aa)
    }, [data, isRefetching])
    const handleApproveReject = (async (key: 'leaveRejectById' | 'leaveApproveById') => {
        try {
            toggleModal(' ')
            popUpConfToast.plzWait({
                bodyComponent: () => <PleaseWait />
            })
            let resAcceptRejectLeave = await leaveApproveReject({
                key: key,
                id: params?.item?._id,
                remarks: remarks
            })
            refetch();
            queryClient?.invalidateQueries({
                queryKey: ['getAllLeave']
            })
            !!resAcceptRejectLeave && popUpConfToast.successMessage(resAcceptRejectLeave?.message ?? '--')
        }
        catch (error) {
        }
    })

    const onRefresh = () => {
        try {
            setRefreshing(true)
            refetch()
        }
        catch (e) {
            console.log('refreshInLeaveDetail', e)
        }
        finally {
            setRefreshing(false)
        }
    }
    //
    const toggleModal = (value: "Approve" | "Reject" | " " | "Cancel") => {
        console.log('value', value)
        setOpenModal((prev) => {
            return {
                ...prev,
                open: !prev.open,
                which: value
            }
        })
        value === ' ' && setRemarks('')
    }

    return (
        <ContainerHRM
            isLoading={isLoadingDetail}
            ph={20}
            // pt={20}
            isBAck={{
                title: 'Leave Detail'
            }}
        >
            {!isAgentTl && <>
                {([statusKeyHRM.approved, statusKeyHRM.cancel]?.indexOf(data?.status) === -1) && <View
                    style={{
                        flexDirection: 'row',
                        paddingBottom: 10,
                        paddingTop: 20
                    }}
                >
                    <CustomBtn
                        title='Accept'
                        containerStyle={{
                            minWidth: '30%',
                            marginEnd: 20
                        }}
                        textStyle={{
                            fontSize: 14
                        }}
                        // onPress={() => handleApproveReject('leaveApproveById')}
                        onPress={() => toggleModal('Approve')}
                    // isLoading={isLoading.approve}
                    />
                    <OutlineBtn
                        title='Reject'
                        textStyle={{
                            fontSize: 14
                        }}
                        containerStyle={{
                            minWidth: '30%'
                        }}
                        // onPress={() => handleApproveReject('leaveRejectById')}
                        // isLoading={isLoading.reject}
                        onPress={() => toggleModal('Reject')}
                    />
                </View>}
                {data?.status === statusKeyHRM.approved && <OutlineBtn
                    title='Cancel'
                    textStyle={{
                        fontSize: 14
                    }}
                    containerStyle={{
                        minWidth: '30%',
                        margin: 10,
                        marginBottom: 2
                    }}
                    // onPress={() => handleApproveReject('leaveRejectById')}
                    // isLoading={isLoading.reject}
                    onPress={() => toggleModal('Cancel')}
                />}
            </>}
            <FlatList
                data={leaveDetailById}
                renderItem={({ item, index }) => {
                    return (item?.heading ? <TitleInDetail
                        title={item?.title}
                    /> :
                        <RowItemDetail
                            title={item?.title}
                            value={item?.value}
                            isDate={item?.isDate}
                            containerStyle={{ marginBottom: item?.mb }}
                            component={item?.key === 'attachments' && <ImageViewModal imagesUri={item?.value} />}
                        />)
                }}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={<FlatList
                    data={data?.respondentDetails ?? []}
                    renderItem={({ item, index }) => {
                        return <RespondentDetails
                            item={item}
                            isFirst={index === 0}
                            isLast={index === data?.respondentDetails?.length - 1}
                        />
                    }}
                />}
                contentContainerStyle={{
                    paddingBottom: 50,
                    paddingTop: 10
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
            <ModalWithBlur
                visible={openModal?.open}
            >
                <LeaveAppRemark
                    heading={`${openModal?.which} Leave`}
                    onPressCancel={() => toggleModal(' ')}
                    onChangeText={(v) => setRemarks(v)}
                    onPressSubmit={() => handleApproveReject(whichStatus[openModal?.which])}
                />
            </ModalWithBlur>

        </ContainerHRM>
    )
}

export default LeaveDetail

const RespondentDetails = ({ item, isFirst, isLast }) => {
    return <View>
        {isFirst && <TitleInDetail
            title={'Respondent Details'}
        />}
        <RowItemDetail
            title={'Name'}
            value={item?.name ?? '-'}
            containerStyle={{ marginBottom: 10 }}
        />
        <RowItemDetail
            title={'Role'}
            value={item?.role ?? '-'}
            containerStyle={{ marginBottom: 10 }}
        />
        <RowItemDetail
            title={'Remarks'}
            value={item?.remarks ?? '-'}
            containerStyle={{ marginBottom: 15 }}
        />
        {!isLast && <View
            style={{
                borderWidth: 0.5,
                borderColor: color.grayBtn,
                marginBottom: 15
            }}
        />}
    </View>
}