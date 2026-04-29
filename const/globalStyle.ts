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
      shadowOpacity: 0.26,
      shadowRadius: 2,
      elevation: 1,
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
  padding: 8,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.1)",
  borderColor: "#ffffff29",
  borderWidth: 2,
};

export const headerIconWrapperStyle = {
  padding: 8,
  borderRadius: 12,
  backgroundColor: "rgba(255,255,255,0.1)",
  borderColor: "#ffffff29",
  borderWidth: 2,
};

export const headerRowItemsStyle = {
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 14,
  justifyContent: "space-between" as const,
  flexDirection: "row" as const,
};

export const buttonWrapper = {
  backgroundColor: "rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: 8,
  borderColor: "#ffffff29",
  borderWidth: 2,
};
