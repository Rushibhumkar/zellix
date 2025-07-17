import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { Children, ReactNode } from "react";

interface TContainer {
  children: ReactNode;
  isAndroidIssue?: Boolean;
}

const ScrollViewWithKeyboardAvoid = ({
  children,
  isAndroidIssue = false,
}: TContainer) => {
  return (
    <>
      {!isAndroidIssue ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView>{children}</ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView>{children}</ScrollView>
      )}
    </>
  );
};

export default ScrollViewWithKeyboardAvoid;
