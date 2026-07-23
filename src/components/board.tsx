import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// NOTE: requires `expo install expo-linear-gradient`
// NOTE: `gap` in flexbox requires React Native 0.71+ / recent Expo SDK.
//       If your SDK is older, replace `gap` with margins on children instead.

interface BlastData {
  dx: number;
  dy: number;
  rot: number;
  delay: number;
  progress: Animated.Value;
}

interface ConfettiPiece {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
  size: number;
  shape: number; // borderRadius in px (replaces CSS "50%" / "2px")
  delay: number;
  duration: number;
  progress: Animated.Value;
}

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  blast: BlastData | null;
}

function Square({ value, onSquareClick, blast }: SquareProps) {
  const animatedStyle = blast
    ? {
        opacity: blast.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
        transform: [
          {
            translateX: blast.progress.interpolate({
              inputRange: [0, 0.15, 1],
              outputRange: [0, 0, blast.dx],
            }),
          },
          {
            translateY: blast.progress.interpolate({
              inputRange: [0, 0.15, 1],
              outputRange: [0, 0, blast.dy],
            }),
          },
          {
            rotate: blast.progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", `${blast.rot}deg`],
            }),
          },
          {
            scale: blast.progress.interpolate({
              inputRange: [0, 0.15, 1],
              outputRange: [1, 1.1, 0.4],
            }),
          },
        ],
      }
    : {};

  return (
    <Pressable onPress={onSquareClick} disabled={!!value} hitSlop={4}>
      <Animated.View style={[styles.square, animatedStyle]}>
        <Text
          style={[
            styles.squareText,
            value === "X" && styles.squareTextX,
            value === "O" && styles.squareTextO,
          ]}
        >
          {value}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function makeConfetti(): ConfettiPiece[] {
  const colors = [
    "#000000",
    "#fb5607",
    "#ff006e",
    "#8338ec",
    "#3a86ff",
    "#06d6a0",
  ];
  return Array.from({ length: 60 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 160 + Math.random() * 220;
    const size = 5 + Math.random() * 9;
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 60,
      rot: Math.random() * 900 - 450,
      color: colors[i % colors.length],
      size,
      shape: Math.random() > 0.5 ? size / 2 : 2,
      delay: Math.random() * 0.15,
      duration: 0.9 + Math.random() * 0.6,
      progress: new Animated.Value(0),
    };
  });
}

function makeSquareBlasts(): BlastData[] {
  return Array.from({ length: 9 }).map((_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const baseDx = (col - 1) * (140 + Math.random() * 60);
    const baseDy = (row - 1) * (140 + Math.random() * 60);
    return {
      dx: baseDx + (Math.random() * 40 - 20),
      dy: baseDy + (Math.random() * 40 - 20),
      rot: Math.random() * 480 - 240,
      delay: Math.random() * 0.1,
      progress: new Animated.Value(0),
    };
  });
}

export default function Board() {
  const [squares, setSquares] = useState<(string | null)[]>(
    Array(9).fill(null)
  );
  const [exploding, setExploding] = useState(false);
  const [useConfetti, setUseConfetti] = useState(false);
  const [blasts, setBlasts] = useState<BlastData[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Replaces the CSS `status-pulse` keyframe animation.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  function runBlastAnimations(nextBlasts: BlastData[]) {
    const animations = nextBlasts.map((b) =>
      Animated.timing(b.progress, {
        toValue: 1,
        duration: 800,
        delay: b.delay * 1000,
        easing: Easing.bezier(0.25, 0.8, 0.4, 1),
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }

  function runConfettiAnimations(pieces: ConfettiPiece[]) {
    const animations = pieces.map((p) =>
      Animated.timing(p.progress, {
        toValue: 1,
        duration: p.duration * 1000,
        delay: p.delay * 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }

  function handleClick(i: number) {
    if (squares[i]) return;
    const next = squares.slice();
    next[i] = "X";
    setSquares(next);
  }

  function handleReset() {
    setSquares(Array(9).fill(null));
    setExploding(false);
    setUseConfetti(false);
    setBlasts([]);
    setConfetti([]);
  }

  function handleExplode() {
    const nextBlasts = makeSquareBlasts();
    const nextConfetti = makeConfetti();
    setBlasts(nextBlasts);
    setConfetti(nextConfetti);
    setExploding(true);
    setUseConfetti(true);
    runBlastAnimations(nextBlasts);
    runConfettiAnimations(nextConfetti);
  }

  function handleConfetti() {
    const nextConfetti = makeConfetti();
    setConfetti(nextConfetti);
    setUseConfetti(true);
    runConfettiAnimations(nextConfetti);
  }

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const pulseGlow = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 14],
  });

  return (
    // Radial gradients aren't supported by expo-linear-gradient, so this
    // approximates the web version's radial background with a linear one.
    <LinearGradient colors={["#1e2749", "#10142b"]} style={styles.game}>
      <View style={styles.boardPanel}>
        <Text style={styles.status}>You Win</Text>
        <Animated.Text
          style={[
            styles.statusWin,
            { transform: [{ scale: pulseScale }], textShadowRadius: pulseGlow },
          ]}
        >
          You Win
        </Animated.Text>

        <View style={styles.boardWrap}>
          {[0, 1, 2].map((row) => (
            <View style={styles.boardRow} key={row}>
              {[0, 1, 2].map((col) => {
                const i = row * 3 + col;
                return (
                  <Square
                    key={i}
                    value={squares[i]}
                    onSquareClick={() => handleClick(i)}
                    blast={exploding ? blasts[i] : null}
                  />
                );
              })}
            </View>
          ))}

          {useConfetti && (
            <View style={styles.confettiField} pointerEvents="none">
              {confetti.map((p) => {
                const opacity = p.progress.interpolate({
                  inputRange: [0, 0.7, 1],
                  outputRange: [1, 1, 0],
                });
                const translateX = p.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, p.dx],
                });
                const translateY = p.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, p.dy],
                });
                const rotate = p.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", `${p.rot}deg`],
                });
                const scale = p.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.6],
                });
                return (
                  <Animated.View
                    key={p.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: p.size,
                      height: p.size,
                      borderRadius: p.shape,
                      backgroundColor: p.color,
                      opacity,
                      transform: [
                        { translateX: -p.size / 2 },
                        { translateY: -p.size / 2 },
                        { translateX },
                        { translateY },
                        { rotate },
                        { scale },
                      ],
                    }}
                  />
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            onPress={handleExplode}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Explode</Text>
          </Pressable>
          <Pressable
            onPress={handleConfetti}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Confetti</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
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