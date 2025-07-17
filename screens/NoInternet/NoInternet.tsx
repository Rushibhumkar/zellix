import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import useInternetConnectivity from '../../hooks/useInternetConnectivity';
import { useNavigation } from '@react-navigation/native';
import CustomBtn from '../../myComponents/CustomBtn/CustomBtn';
import NoInternetIcon from '../../assets/svg/NoInternetIcon';
import CustomText from '../../myComponents/CustomText/CustomText';
import CustomSnackBar from '../../myComponents/CustomSnackBar/CustomSnackBar';
import { HEIGHT, WIDTH } from '../../const/deviceInfo';
import NoInternetPic1 from '../../assets/svg/NoInternetPic1';

const NoInternet = () => {
    const { isOffline, checkInternetConnectivity } = useInternetConnectivity();
    const [snackBar, setSnackBar] = useState({
        visible: false,
        text: "",
        error: false,
    });

    const onRefresh = () => {
        if (isOffline) {
            setSnackBar({
                visible: true,
                text: 'No Internet Connection',
                error: true,
            });
        }
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View
                style={{ position: 'relative', bottom: 90, borderWidth: 1,zIndex:10 }}
            >
                <CustomSnackBar snackbar={snackBar} setSnackbar={setSnackBar} />
            </View>
            <View
                style={{ justifyContent: 'center', alignItems: 'center' }}
            >
                <NoInternetPic1 
                width={WIDTH*0.85}
                />
                <CustomBtn
                    onPress={() => {
                        checkInternetConnectivity()
                        onRefresh()
                    }}
                    containerStyle={{
                        width: 200,
                        marginTop: 50
                    }}
                    title='Refresh'
                />
                
            </View>
        </View>
    )
}

export default NoInternet