import * as Linking from "expo-linking";
import { NativeModules, Platform } from "react-native";

type WhatsAppLauncherModule = {
  open: (url: string) => Promise<void>;
};

const whatsappLauncher = NativeModules.WhatsAppLauncher as
  | WhatsAppLauncherModule
  | undefined;

export const openWhatsApp = async (url?: string | null) => {
  const whatsappUrl = String(url || "").trim();
  if (!whatsappUrl) return;

  if (Platform.OS === "android" && whatsappLauncher?.open) {
    try {
      await whatsappLauncher.open(whatsappUrl);
      return;
    } catch {
      // Fall back to the platform URL handler if the native launcher fails.
    }
  }

  await Linking.openURL(whatsappUrl);
};
