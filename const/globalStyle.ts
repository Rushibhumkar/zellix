import { color } from "./color";

export const shadow1 = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.29,
  shadowRadius: 4.65,
  elevation: 7,
};

export const shadow2 = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowOpacity: 0.36,
  shadowRadius: 6.68,
  elevation: 11,
};

export const shadowLight = {
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.1,
  shadowRadius: 1,
  elevation: 1,
};

export const shadowPrimaryColor = {
  shadowColor: color.primaryColor,
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 6,
  shadowOffset: { width: 1, height: 0 },
};
export const shadowSecondaryColor = {
  shadowColor: color.secondaryColor,
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 6,
  shadowOffset: { width: 1, height: 0 },
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
