import {
  Animated,
  Pressable,
  StyleSheet,
  Text
} from "react-native";
import { blastAnimation } from "../graphics/blastStyle";

interface BlastData {
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  progress: Animated.Value;
}

interface BoxEntry { //TODO: unify type with parent
  number: number,
  color?: number
}

interface SquareProps {
  value: BoxEntry;
  onSquareClick: () => void;
  blast: BlastData | null;
  colorEnabled: boolean;
}


const BUTTON_COLORS = [
  "#dc3636",
  "#fb5607",
  "#ff006e",
  "#dfd21e",
  "#0f8d37",
  "#1207e0",
  "#8b3395",
];

export default function Square({ value, onSquareClick, blast, colorEnabled }: SquareProps) {
  const animatedStyle = blast ? blastAnimation(blast) : {};

  return (
    <Pressable onPress={onSquareClick} hitSlop={4}>
      {({ pressed }) => (
        <Animated.View style={[
          styles.square, animatedStyle,
          colorEnabled && { backgroundColor: BUTTON_COLORS[value.color] },
          pressed && styles.squarePressed
        ]}>

          <Text
            style={[
              styles.squareText,
              //{color: 'red'}
            ]}
          >
            {value.number}
          </Text>

        </Animated.View>
      )}
    </Pressable>
  );
}

const SQUARE_SIZE = 76;

const styles = StyleSheet.create({
  game: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  boardPanel: {
    alignItems: "center",
    gap: 20,
  },
  status: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e8eaf6",
    letterSpacing: 0.4,
  },
  statusWin: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffd166",
    letterSpacing: 0.4,
    textShadowColor: "rgba(255, 209, 102, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
  },
  boardWrap: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 16,
    // View is position:"relative" by default in RN, so the absolutely
    // positioned confetti field below anchors correctly to this box.
  },
  boardRow: {
    flexDirection: "row",
  },
  square: {
    backgroundColor: "#f4f6fb",
    borderRadius: 10,
    margin: 4,
    height: SQUARE_SIZE,
    width: SQUARE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10142b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6, // Android shadow fallback
  },
  squarePressed: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
    transform: [{ translateY: 2 }],
  },
  squareText: {
    fontSize: 36,
    fontWeight: "800",
  },
  squareTextX: {
    color: "#3a86ff",
  },
  squareTextO: {
    color: "#fb5607",
  },
  confettiField: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 0,
    height: 0,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  resetButton: {
    backgroundColor: "#3a86ff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    shadowColor: "#3a86ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  resetButtonPressed: {
    opacity: 0.85,
    transform: [{ translateY: 1 }],
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});