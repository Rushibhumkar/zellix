import { View, Text, Platform } from 'react-native'
import React from 'react'
import MapView, { Marker, AnimatedRegion, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomModal from '../CustomModal/CustomModal';
import { AntDesign } from '@expo/vector-icons';

interface TCustomMapView {
    isMapModalVisible: boolean;
    toggleMapViewModal: () => void;
    mapLatLng: { lat: number, lng: number };
    hasBackdrop: boolean;
}

const CustomMapView = ({
    isMapModalVisible,
    toggleMapViewModal,
    mapLatLng,
    hasBackdrop = false,
}: TCustomMapView) => {

    return (
        <CustomModal
            visible={isMapModalVisible}
            onClose={toggleMapViewModal}
            hasBackdrop={hasBackdrop}
        >
            <AntDesign
                name="closesquare"
                size={28}
                color="black"
                style={{
                    position: 'relative',
                    top: 30,
                    zIndex: 1,
                    alignSelf: 'flex-end',
                    backgroundColor: 'white',
                }}
                onPress={toggleMapViewModal}
            />
            <View
                style={{
                    backgroundColor: 'white',
                    minWidth: '70%',
                    maxHeight: 400,
                }}
            >
                {(mapLatLng?.lat && mapLatLng?.lng) &&
                    <MapView
                        showsCompass={true}
                        provider={Platform.OS === "ios" ? PROVIDER_DEFAULT : PROVIDER_GOOGLE}
                        style={{ width: '100%', height: '100%' }}
                        region={{
                            latitude: Number(mapLatLng?.lat),
                            longitude: Number(mapLatLng?.lng),
                            latitudeDelta: 0.04864195044303443,
                            longitudeDelta: 0.040142817690068,
                        }}
                        // showsUserLocation={true}
                        // followsUserLocation={true}
                        mapType={"standard"}
                        loadingEnabled
                    >
                        <Marker coordinate={{ latitude: Number(mapLatLng?.lat), longitude: Number(mapLatLng?.lng) }} title="Meeting Location" />
                    </MapView>}
            </View>
        </CustomModal>
    )
}

export default CustomMapView