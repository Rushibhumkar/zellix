// LeadsDetails/component/CelebrationModal.tsx

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const EMOJIS = [
  "🎉",
  "🥳",
  "🎊",
  "✨",
  "🏆",
  "🌟",
  "🎈",
  "💫",
  "🔥",
  "⭐",
  "🎇",
  "🎆",
];

// ─── Single Rocket Emoji ────────────────────────────────────────────────────
const RocketEmoji = ({
  emoji,
  startX,
  delay,
  duration,
}: {
  emoji: string;
  startX: number;
  delay: number;
  duration: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.4)).current;

  // random horizontal drift (left or right like a real rocket sway)
  const driftX = (Math.random() - 0.5) * 80;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // fade in fast
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // scale up as it launches
        Animated.timing(scale, {
          toValue: 1.2,
          duration: duration * 0.3,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // shoot upward
        Animated.timing(translateY, {
          toValue: -(SCREEN_HEIGHT * 0.85),
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // drift sideways
        Animated.timing(translateX, {
          toValue: driftX,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
      // fade out at top
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: 26 + Math.random() * 16,
        left: startX,
        bottom: 30,
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
        zIndex: 10,
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

// ─── Burst: second wave after rockets explode at top ────────────────────────
const BurstParticle = ({
  emoji,
  originX,
  delay,
}: {
  emoji: string;
  originX: number;
  delay: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const angle = Math.random() * 2 * Math.PI;
  const radius = 60 + Math.random() * 80;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: Math.cos(angle) * radius,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: Math.sin(angle) * radius,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: 16 + Math.random() * 10,
        left: originX,
        top: SCREEN_HEIGHT * 0.12,
        opacity,
        transform: [{ translateX }, { translateY }, { scale }],
        zIndex: 10,
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

// ─── Props ───────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  status: string;
  onCreateMeeting: () => void;
  onClose: () => void;
}

// ─── Main Component ──────────────────────────────────────────────────────────
const CelebrationModal = ({
  visible,
  status,
  onCreateMeeting,
  onClose,
}: Props) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const isMeetingScheduled = status === "meeting_scheduled";

  // ── generate rockets spread across screen width ──
  const rockets = Array.from({ length: 14 }, (_, i) => ({
    emoji: EMOJIS[i % EMOJIS.length],
    startX: 10 + (i / 13) * (SCREEN_WIDTH - 40), // spread evenly
    delay: i * 180, // staggered launch
    duration: 1200 + Math.random() * 600,
  }));

  // ── burst particles appear after rockets reach top ──
  const bursts = Array.from({ length: 20 }, (_, i) => ({
    emoji: ["✨", "⭐", "💥", "🌟", "🎆"][i % 5],
    originX: 20 + Math.random() * (SCREEN_WIDTH - 60),
    delay: 800 + i * 100,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 🚀 Full screen rockets — behind card */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {rockets.map((r, i) => (
            <RocketEmoji key={`rocket-${i}`} {...r} />
          ))}
          {bursts.map((b, i) => (
            <BurstParticle key={`burst-${i}`} {...b} />
          ))}
        </View>

        {/* 🎴 Center Card */}
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Text style={styles.bigEmoji}>
            {isMeetingScheduled ? "📅" : "🤝"}
          </Text>

          <CustomText style={styles.title}>
            🎉 Let's create the meeting!
          </CustomText>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={onCreateMeeting}
            activeOpacity={0.85}
          >
            <Text style={styles.createBtnText}>📋 Create Meeting</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <CustomText style={styles.skipText}>Skip for now</CustomText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CelebrationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.62)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: "82%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 14,
    zIndex: 20,
  },
  bigEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E67BE",
    marginBottom: 24,
    textAlign: "center",
  },
  createBtn: {
    backgroundColor: color.mainTxtColor,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  skipBtn: {
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 13,
    color: "#9BA5B4",
    textDecorationLine: "underline",
  },
});
