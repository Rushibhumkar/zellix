import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const askLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Location Permission', 'Permission to access location was denied. Give Permission to access location for conduct meeting ');
        return;
    }
}

