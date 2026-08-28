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
import { makeConfetti, makeSquareBlasts, runBlastAnimations, runConfettiAnimations } from "../graphics/blastStyle";
import Square from "./square";
import Timer from "./timer";



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

  const colorsWin = [
    "#cb11e8",
    "#35b160",
    "#a033b9",
    "#35ad75",
    "#8b3395",
    "#06d6a0",
  ];

  const colorsLose = [
    "#dc3636",
    "#fb5607",
    "#ff006e",
    "#dfd21e",
    "#edbc29",
    "#d77e25",
  ];


export default function Board() {

  const [level, setLevel] = useState<number>(1)

  const [gridLength, setGridLength] = useState<number>(16);
  const [numberRange, setNumberRange] = useState<number>(10)
  
  const [combo, setCombo] = useState<number[]>([123456789])

  const [squares, setSquares] = useState<(number | string | null)[]>(fillGrid(4, combo));

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


  function fillGrid(rowSize: number, comboVal: number[]){
    
    let comboList = [...comboVal] //copy so you don't mutate state
    let arr = Array(rowSize*rowSize).fill(0).map(()=>Math.floor(Math.random()*numberRange))
    /**
     * Add non-number graphics here
     */
    
    let flagLoc: number[] = []
    
    //Fill grid with valid values
    while(comboList.length !== 0){
      let val = comboList.pop()!
      let loc = Math.floor(Math.random()*rowSize*rowSize)
      
      let locExists = arr.indexOf(val)
      if(!locExists){  
        
        //find valid location (that isn't already filled with valid value)
        while(flagLoc.includes(loc)){
          loc = Math.floor(Math.random()*rowSize*rowSize)
        }
        flagLoc.push(loc)
        arr[loc] = val
        
      }
      else{
          flagLoc.push(locExists)
      }

    }

    return arr
  }

  function displayCombo(){
    return combo.join()
  }
  


  function handleClick(i: number) {
    if (squares[i]) return;
    const next = squares.slice();
    next[i] = "X";
    setSquares(next);
  }

  function handleReset() {
    setSquares(fillGrid(4, combo));
    setExploding(false);
    setUseConfetti(false);
    setBlasts([]);
    setConfetti([]);
  }

  function handleExplode() {
    const nextBlasts = makeSquareBlasts();
    const nextConfetti = makeConfetti(colorsLose);
    setBlasts(nextBlasts);
    setConfetti(nextConfetti);
    setExploding(true);
    setUseConfetti(true);
    runBlastAnimations(nextBlasts);
    runConfettiAnimations(nextConfetti);
  }

  function handleConfetti() {
    const nextConfetti = makeConfetti(colorsWin);
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
        <Text style={styles.status}>{[displayCombo()]}</Text>
        {/* <Animated.Text
          style={[
            styles.statusWin,
            { transform: [{ scale: pulseScale }], textShadowRadius: pulseGlow },
          ]}
        >
          You Win
        </Animated.Text> */}
        <Animated.Text>
        <Timer onTimout={handleExplode}/>
        </Animated.Text>

        <View style={styles.boardWrap}>
          {[0, 1, 2, 3].map((row) => (
            <View style={styles.boardRow} key={row}>
              {[0, 1, 2, 3].map((col) => {
                const i = row * 4 + col;
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
    fontSize: 25,
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