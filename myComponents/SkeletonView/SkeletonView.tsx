import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface IProps {
  colors?: string[];
  gradientStyle?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle> & { width: number | string; height: number };
}

const GREY = 'rgb(234, 234, 234)';

const SkeletonView: React.FC<IProps> = ({ colors, gradientStyle, wrapperStyle }) => {
  const [viewWidth, setViewWidth] = useState<number>(-1);
  const shimmeringAnimatedValue = useRef(new Animated.Value(0)).current;

  const animation = Animated.loop(
    Animated.timing(shimmeringAnimatedValue, {
      useNativeDriver: false,
      delay: 100,
      duration: 1000,
      toValue: 1,
    })
  );

  useEffect(() => {
    animation.start();
    return () => {
      animation.stop();
    };
  }, []);

  const _onLayoutChange = (event: LayoutChangeEvent) => {
    setViewWidth(event.nativeEvent.layout.width);
  };

  const _getLeftValue = () => {
    return shimmeringAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-viewWidth, viewWidth],
    });
  };

  const width = Dimensions.get('screen').width;
  const loadingStyle = { backgroundColor: GREY };
  const left = _getLeftValue();

  return (
    <View
      style={{
        width: wrapperStyle?.width ?? width,
        height: wrapperStyle?.height ?? 10,
      }}
    >
      <View
        style={[styles.container, loadingStyle, wrapperStyle]}
        onLayout={(event) => _onLayoutChange(event)}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              left,
            },
            gradientStyle,
          ]}
        >
          <LinearGradient
            colors={[GREY, '#fff', GREY]}
            start={{ x: 0.3, y: 0.2 }}
            end={{ x: 0.8, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 0,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default SkeletonView;
