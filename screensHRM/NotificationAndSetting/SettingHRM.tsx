import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import ContainerHRM from '../../myComponentsHRM/ContainerHRM/ContainerHRM'
import CustomText from '../../myComponents/CustomText/CustomText'
import CRMLogoIcon from '../../assets/svgHRM/CRMLogoIcon'
import ChangePassLogo from '../../assets/svg/ChangePassLogo'
import LogoutLogo from '../../assets/svg/LogoutLogo'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { removeItemValue } from '../../hooks/useAsyncStorage'
import { useDispatch, useSelector } from 'react-redux'
import { onLogOutEmpty } from '../../redux/action'
import { logOut } from '../../services/authApi/auth'
import { selectUser } from '../../redux/userSlice'
import { myConsole } from '../../hooks/useConsole'
import { routeUser } from '../../utils/routesHRM'
import { EvilIcons } from '@expo/vector-icons'
import { roleEnum } from '../../utils/data'
import { routeProject } from '../../utils/routes'
import ProjectIcon from '../../assets/svg/ProjectIcon'

const SettingHRM = () => {
    const { navigate, dispatch: dispatchNav } = useNavigation();
    const { user } = useSelector(selectUser);
    const isSubSupSrMng = user?.role === roleEnum?.sub_admin || user?.role === roleEnum?.sup_admin || user?.role === roleEnum?.sr_manager;
    const isAgent = user?.role === roleEnum.agent
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    //
    const handleLogout = async () => {
        setIsLoading(true);
        try {
            let a = await logOut(user?._id);
            // console.log('aLogOut', a)
            await removeItemValue("token");
            await removeItemValue("userDetail");
            await dispatch(onLogOutEmpty());
            dispatchNav(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "Login" }],
                })
            );
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <ContainerHRM
            isBAck={{ title: 'Settings' }}
            ph={15}
        >
            <RowItem
                title={'CRMS'}
                icon={<CRMLogoIcon />}
                onPress={() => navigate('Dashboard')}
            />
            {isAgent && <RowItem
                title={'User Profile'}
                icon={<EvilIcons name='user' size={30} />}
                onPress={() => navigate(routeUser.UserDetailHRMAgent, { item: { ...user } })}
            />}
            {/* {isSubSupSrMng && <RowItem
                title='Project'
                icon={<ProjectIcon />}
                onPress={() => navigate(routeProject.ProjectNavigator)}
            />} */}
            <RowItem
                title='Change Password'
                icon={<ChangePassLogo />}
                onPress={() => navigate("ChangePassword")}
            />
            <RowItem
                title={'Logout'}
                icon={<LogoutLogo />}
                isLoading={isLoading}
                onPress={handleLogout}
            />
        </ContainerHRM>
    )
}

export default SettingHRM

const styles = StyleSheet.create({
    fdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 0.5,
        paddingVertical: 20
    }
})

//RowItem
const RowItem = ({
    title,
    icon,
    onPress,
    isLoading = false
}) => {
    return <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.5}
        style={styles.fdRow}>
        {icon}
        <CustomText
            fontSize={18}
            fontWeight='600'
        >{title}
        </CustomText>
        {isLoading && <ActivityIndicator />}
    </TouchableOpacity>
}