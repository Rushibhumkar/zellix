import { Platform } from "react-native";
import * as Linking from "expo-linking";

export const navigateToMapApp = (coordinates: { lat: number, lng: number }) => {
    const { lat, lng } = coordinates;
    console.log('lat', lat, 'lng', lng)
    const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = 'Custom Label';
    const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
    });

    return Linking.openURL(url);
}
