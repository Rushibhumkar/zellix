import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ModalWithBlur from '../../myComponentsHRM/ModalWithBlur/ModalWithBlur'
import CustomText from '../../myComponents/CustomText/CustomText'
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn'
import CheckInOutForm from './Component/CheckInOutForm'
import { getLocationLatLng } from '../../screens/Meetings/MeetingDetails'

const punchTypeEnm = {
    punchIn: 'Check - In',
    punchOut: 'Check - Out',
}
const CheckInOut = () => {
    const [openModal, setOpenModal] = useState(false);
    const [punchType, setPunchType] = useState<'punchIn' | 'punchOut'>('punchIn');
    const toggleModal = () => {
        setOpenModal((prev) => !prev)
    }
    const clickOnPunchBtn = (type: 'punchIn' | 'punchOut') => {
        setPunchType(type)
        toggleModal()
    }
    return (
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 20,
                    marginBottom: 20
                }}
            >
                <CustomBtn
                    title='Check In'
                    onPress={() => clickOnPunchBtn('punchIn')}
                    containerStyle={{ width: '45%' }}
                />
                <CustomBtn
                    title='Check Out'
                    onPress={() => clickOnPunchBtn('punchOut')}
                    containerStyle={{ width: '45%' }}
                />
            </View>
            <ModalWithBlur
                visible={openModal}
            >
                <CheckInOutForm
                    heading={punchTypeEnm[punchType]}
                    onPressCancel={toggleModal}
                    toggleModal={toggleModal}
                    punchType={punchType}
                // onPressSubmit={remoteCheckIn}
                // onSelectOption={(v) => setSelectedId(v)}
                />
            </ModalWithBlur>
        </View>
    )
}

export default CheckInOut

const styles = StyleSheet.create({})