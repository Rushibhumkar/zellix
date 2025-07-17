import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Provider } from "react-redux";
import StackNavigation, { navigate } from './navigation/StackNavigation';
import store from './redux/store';
import { storeData } from './hooks/useAsyncStorage';
import { Root as PopupRootProvider } from 'react-native-popup-confirm-toast';
import 'react-native-get-random-values';
import UpdateChecker from './myComponents/UpdateChecker/UpdateChecker';
import { myConsole } from './hooks/useConsole';

//


// const socket = io('your_socket_server_url');


/////////
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/////////////

export const queryClient = new QueryClient();
export default function App() {
  //
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(async token => {
        await storeData("deviceId", token);
        setExpoPushToken(token)
      })
      .catch((error) => console.log('error in registerForPushNotificationsAsync', error));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {

      let notData = response?.notification?.request?.content?.data
      if (notData?.module === 'leads' && notData?.id) {
        navigate('allLeads', {
          screen: 'LeadsDetails',
          // params: { leadId: notData?.id },
          params: { item: { _id: notData?.id } }
        });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  //
  // useEffect(() => {
  //   // Connect to the socket
  //   socket.connect();

  //   // Listen for socket events
  //   socket.on('message', (data) => {
  //     // Handle incoming socket messages
  //     console.log('Socket message:', data);

  //     // Use the data to trigger notifications
  //     // You can use Expo Notifications API here
  //   });

  //   // Cleanup on unmount
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  return (
    <>
      <PopupRootProvider>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <StackNavigation />
            <UpdateChecker />
          </Provider>
        </QueryClientProvider>
      </PopupRootProvider>
    </>
  );
}


export async function schedulePushNotification({
  title = 'title',
  body = 'body',
  data2 = 'data2'
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { data: data2 },
    },
    trigger: { seconds: 1 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '9b8838cd-39d5-4148-a221-a81701015be2'
    })).data;
    // token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log('token', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

