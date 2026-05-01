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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
      )}
    </>
  );
};

export default ScrollViewWithKeyboardAvoid;
