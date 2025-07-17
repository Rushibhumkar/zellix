import { useCallback, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';

const useInternetConnectivity = () => {
    const [isOffline, setOfflineStatus] = useState(false);
    const { navigate } = useNavigation()
    useEffect(() => {
        const removeNetInfoSubscription = NetInfo.addEventListener(state => {
            const offline = !(state.isConnected && state.isInternetReachable);
            if (offline === true) {
                setTimeout(() => {
                    navigate('NoInternet')
                }, 1000);
            }
            if (offline === false) {
                navigate('Dashboard')
            }
            setOfflineStatus(offline);
        });

        return () => {
            removeNetInfoSubscription();
        };
    }, []);

    const checkInternetConnectivity = useCallback(() => {
        NetInfo.fetch().then(state => {
            const offline = !(state.isConnected && state.isInternetReachable);
            setOfflineStatus(offline);
        });
    }, []);

    return { isOffline, checkInternetConnectivity }
};

export default useInternetConnectivity;
