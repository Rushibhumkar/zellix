import { Platform } from "react-native";
import { color } from "./color";

export const shadow1 = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 7,
      shadowColor: "#000",
    },
  }),
};

export const shadow2 = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.36,
      shadowRadius: 6.68,
    },
    android: {
      elevation: 11,
      shadowColor: "#000",
    },
  }),
};

export const shadowLight = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    android: {
      elevation: 1,
      shadowColor: "#000",
    },
  }),
};

export const shadowPrimaryColor = {
  ...Platform.select({
    ios: {
      shadowColor: color.primaryColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.36,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
      shadowColor: color.primaryColor,
    },
  }),
  // borderLeftWidth: 4,
  // borderLeftColor: color.primaryColor,
};

export const shadowSecondaryColor = {
  ...Platform.select({
    ios: {
      shadowColor: color.secondaryColor,
      shadowOffset: { width: 1, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
      shadowColor: color.secondaryColor,
    },
  }),
  // borderLeftWidth: 4,
  // borderLeftColor: color.secondaryColor,
};
export const textPrimaryShadow = {
  textShadowColor: color.primaryColor,
  textShadowOffset: { width: 0.5, height: 0.5 },
  textShadowRadius: 1,
};
export const textSecondaryShadow = {
  textShadowColor: color.secondaryColor,
  textShadowOffset: { width: 0.5, height: 0.5 },
  textShadowRadius: 1,
};
export const textBlackShadow = {
  textShadowColor: "rgba(0,0,0,0.6)",
  textShadowOffset: { width: 0.5, height: 0.5 },
  textShadowRadius: 1,
};
export const textWhiteShadow = {
  textShadowColor: "rgba(255, 255, 255, 0.6)",
  textShadowOffset: { width: 0.5, height: 0.5 },
  textShadowRadius: 1,
};
export const iconWrapperStyle = {
  backgroundColor: "#F9FBFD",
  borderWidth: 1,
  borderColor: "#739fe13a",
  padding: 6,
  borderRadius: 12,
};
