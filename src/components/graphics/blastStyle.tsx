
import {
  Animated,
  Easing
} from "react-native";


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
    "#066f1b",
    "#35b160",
    "#33b950",
    "#35ad75",
    "#3ac261",
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



export function blastAnimation(blast: BlastData){

    return {
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
}



export function makeConfetti(colorGrid:string[] = colorsLose): ConfettiPiece[] {

  return Array.from({ length: 60 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 160 + Math.random() * 220;
    const size = 5 + Math.random() * 9;
    return {
      id: i,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 60,
      rot: Math.random() * 900 - 450,
      color: colorGrid[i % colorGrid.length],
      size,
      shape: Math.random() > 0.5 ? size / 2 : 2,
      delay: Math.random() * 0.15,
      duration: 0.9 + Math.random() * 0.6,
      progress: new Animated.Value(0),
    };
  });
}

export function makeSquareBlasts(squareCount: number): BlastData[] {
  console.log(squareCount)
  return Array.from({ length: squareCount }).map((_, i) => {
    const row = Math.floor(i / squareCount);
    const col = i % squareCount;
    const baseDx = (col - 1) * (140 + Math.random() * 60);
    const baseDy = (row - 1) * (140 + Math.random() * 60);
    const neg = i%2 == 0 ? 1 : -1
    return {
      dx: 0 ,//neg* (baseDx + (Math.random() * 40 - 20)),
      dy: 0, //neg* (baseDy + (Math.random() * 40 - 20)),
      rot: Math.random() * 480 - 240,
      delay: Math.random() * 0.1,
      progress: new Animated.Value(0),
    };
  });
}


  export function runBlastAnimations(nextBlasts: BlastData[]) {
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

  export function runConfettiAnimations(pieces: ConfettiPiece[]) {
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