import { LEVELS_BETA } from "@/constants/levels";
import { router, useLocalSearchParams } from "expo-router";
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

interface BoxEntry {
  number: number | string,
  boxColor?: number,
  textColor: number
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


  const BUTTON_COLORS = [
    "black",
    "#dc3636",
    "#fb5607",
    "#ff006e",
    "#dfd21e",
    "#0f8d37",
    "#1207e0",
    "#8b3395",
  ];

    const BUTTON_TEXT_COLORS = [
    "black",
    "#dc3636",
    "#fb5607",
    "#ff006e",
    "#dfd21e",
    "#0f8d37",
    "#1207e0",
    "#8b3395",
  ];
  

  const wildCards = {
    bomb: "BOMB",
    extension: "EXT",
  }

export default function Board() {


  
  //Explosion graphics variables
  const { id = 5 } = useLocalSearchParams();
  const [exploding, setExploding] = useState(false);
  const [useConfetti, setUseConfetti] = useState(false);
  const [blasts, setBlasts] = useState<BlastData[]>([]);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  //Game session tracking
  const [level, setLevel] = useState<number>(Number(id))
  const level_Settings = LEVELS_BETA[level]
  const [numberRange, setNumberRange] = useState<number>(10)
  
  //Grid
  const [levelCombo, setLevelCombo] = useState<BoxEntry[]>(generateCombo(level_Settings))
  const [combo, setCombo] = useState<BoxEntry[]>(levelCombo)
  
  const [levelWin, setLevelWin] = useState<boolean>(false)
  
  const [started, setStarted] = useState<boolean>(true) //Needed? Delete later
  
  //Difficulty settings

  const [durationSetting, setDurationSetting] = useState<number>(level_Settings.durationSetting)
  const [resetTimerSeting, setResetTimerSetting] = useState<boolean>(level_Settings.resetTimerSetting)
  const [refillGridSetting, setRefillGrid] = useState<boolean>(level_Settings.refillGridSetting)
  const [colorBoxSetting, setColorBoxSetting] = useState<boolean>(level_Settings.colorBoxSetting)
  const [textColorSetting, setTextColorSetting] = useState<boolean>(level_Settings.textColorSetting) //combine with colorBoxSetting? 
  const [gridLengthSetting, setGridLengthSetting] = useState<number>(level_Settings.gridLengthSetting)
  const [bombSetting, setBombSetting] = useState<boolean>(level_Settings.bombSetting)
  const [blendInSetting, setBlendInSetting] = useState<boolean>(level_Settings.blendInSetting)

  //-----------------------
  const [squares, setSquares] = useState<BoxEntry[]>(()=>fillGrid(gridLengthSetting, combo, bombSetting, blendInSetting));
  

  
  //TODO settings
  const timerRef = useRef(null)  //Tracks timer component
 const [resetCount, setResetCount] = useState(0); //needed in key for fucking iOS compatibility 
  const [comboColorMatchSetting, setComboColorMatchSetting] = useState<boolean>()
  const [comboLength, setComboLength] = useState<number>(3)


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

  function generateCombo(levelSettings: any){
    return Array(levelSettings.comboLength).fill(0).map(()=>{
      let entry: BoxEntry = {
        number: Math.floor(Math.random()*10), 
        textColor: Math.floor(Math.random()*BUTTON_TEXT_COLORS.length) , 
        boxColor: Math.floor(Math.random()*BUTTON_COLORS.length)
      }
      if(!levelSettings.blendInSetting){
        while(entry.textColor == entry.boxColor){
          entry.boxColor = Math.floor(Math.random()*BUTTON_COLORS.length)
        }
      }
      return entry
      
    })
  }


  function fillGrid(rowSize: number, comboVal: BoxEntry[], bombSetting: boolean, blendTextSetting: boolean) {

    let comboList = [...comboVal] //copy so you don't mutate state
    let arr: BoxEntry[] = Array(rowSize*rowSize).fill(0).map(()=>{
      let bColor = Math.floor(Math.random()* BUTTON_COLORS.length)
      let tColor =  Math.floor(Math.random()* BUTTON_COLORS.length)
      while (tColor === bColor && !blendTextSetting) {
        tColor = Math.floor(Math.random() * BUTTON_COLORS.length)
      }
      return {
          number: Math.floor(Math.random()*numberRange),
          boxColor: bColor,
          textColor: tColor //TODO: Retry when matching with box  
        }
    })

    if(bombSetting){
      let numBombs = Math.floor(0.2*rowSize*rowSize)
      for (let i = 0; i<numBombs; i++){
        let bombLoc = Math.floor(Math.random()*rowSize*rowSize)
        arr[bombLoc].number = 'bomb'
      }
    }

    let flagLoc: number[] = []

    //Fill grid with valid combo number values
    while (comboList.length !== 0) {
      let val: BoxEntry = comboList.shift()!
      let loc: number = Math.floor(Math.random() * rowSize * rowSize)

        while (flagLoc.includes(loc)) {
          loc = Math.floor(Math.random() * rowSize * rowSize)
        }
        flagLoc.push(loc)
        arr[loc] = val

    }
    return arr
  }

  function displayCombo(){
    return combo.map((v, i)=>{return <Text key={i} style={{"color": textColorSetting ? BUTTON_TEXT_COLORS[v.textColor] : "white" }}>{v.number}</Text>})
  }
  


  function getMatchConditional(value: BoxEntry, nextVal: BoxEntry){
    if(textColorSetting  == true){
      return value.number == nextVal.number && value.textColor == nextVal.textColor
    }
    return value.number == nextVal.number
  }

  function handleSquareClick(i: BoxEntry) {
  if (combo.length > 0) {
    console.log(i.number === combo[0].number)
    console.log((textColorSetting == true && i.textColor == combo[0].textColor))
    
    
    if (getMatchConditional(i, combo[0])) {
      const update = combo.slice(1)
      setCombo(update)
      
      if (update.length === 0) { //win game conditional
        handleWin()
      } 
      else {
        
        if (resetTimerSeting){
          timerRef.current?.resetTimer()
        }

        if(refillGridSetting == true){
          setSquares(fillGrid(gridLengthSetting, update, bombSetting, blendInSetting))
        }

      }
    }
    else{
      if(i.number == 'bomb'){
        handleLose()
      }
    }
  }
}

  // const handleSquareClick = useCallback((i: number | string | null) => {
  //   setCombo(prev => {
  //     if (prev.length === 0 || i !== prev[0]) return prev; // no state churn on wrong click
  //     const update = prev.slice(1);
  //     if (update.length === 0) handleConfetti();
  //     return update;
  //   });
  // }, []);


  function handleReset() {
    setResetCount((c) => c + 1);
    blasts.forEach((b) => b.progress.stopAnimation(() => b.progress.setValue(0))); //for ios
    confetti.forEach((c) => c.progress.stopAnimation(() => c.progress.setValue(0))); //for ios
    setLevelWin(false)
    setExploding(false);
    setUseConfetti(false);
    setBlasts([]);
    setConfetti([]);
    setDurationSetting(durationSetting)
    timerRef.current?.resetTimer()
    setStarted(true)
    setCombo(levelCombo)
    setSquares(fillGrid(gridLengthSetting, levelCombo, bombSetting, blendInSetting));
  }

  function handleLose() {
    const nextBlasts = makeSquareBlasts(gridLengthSetting**2);
    const nextConfetti = makeConfetti(colorsLose);
    setLevelWin(false)
    setBlasts(nextBlasts);
    setConfetti(nextConfetti);
    setExploding(true);
    setUseConfetti(true);
    runBlastAnimations(nextBlasts);
    runConfettiAnimations(nextConfetti);
    timerRef.current?.stopTimer()
    setStarted(false)
  }

  function handleWin() {
    const nextConfetti = makeConfetti(colorsWin);
    setLevelWin(true)
    setConfetti(nextConfetti);
    setUseConfetti(true);
    runConfettiAnimations(nextConfetti);
    timerRef.current?.stopTimer()
    setStarted(false)
  }

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const pulseGlow = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 14],
  });

  function displayTimer(){
    if(!exploding ){
      return (<Animated.Text >
        <Timer onTimout={handleLose} pause={false} ref={timerRef} duration={durationSetting}/>
        </Animated.Text>)
    }
  }

  function displayGameOver(){

    if(exploding){
      return (<Animated.Text>
                    <Text style={styles.status}>
                    Game Over
                    </Text>
                 </Animated.Text>)
    }
  }

  function displayWinSign(){
    if(levelWin){
      return(<Animated.Text>
                    <Text style={styles.status}>
                    You Win!
                    </Text>
                 </Animated.Text>)
    }
  }

  function handleNextLevel(){
    //TODO update storage logic
    router.push(`/levels/${level+1}`)
  }

  function displayReplay(){
    if(exploding){
      return ([<Pressable
            key="reset-key"
            onPress={()=> router.canGoBack() ? router.back() : router.push("/explore")}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Back</Text>
          </Pressable>, 
          <Pressable
          key="replay-key"
            onPress={handleReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Replay</Text>
          </Pressable>]
          )
  }
  else if (levelWin){
          return (<Pressable
          key="wnext-level-key"
            onPress={()=>router.push(`/levels/${level+1}`)}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Next Level</Text>
          </Pressable>)
  }


}



  function displayLevel(){

      return ( <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Level 1</Text>
          </Pressable>)
  }

  return (
    <View style={styles.game}>
      <Animated.Text>
                    <Text style={styles.status}>
                    Level {level}
                    </Text>
                 </Animated.Text>
      <View style={styles.boardPanel}>
        
        <Text style={styles.status}>{[displayCombo()]}</Text>

        {/* Both slots keep their height even while empty, so the board stays
            put whether the timer is running or a win/lose message is showing. */}
        <View style={styles.timerSlot}>{displayTimer()}</View>
        <View style={styles.messageSlot}>
          {displayGameOver()}
          {displayWinSign()}
        </View>

        <View style={styles.boardWrap}>
          {
          [...Array(gridLengthSetting).keys()].map((row) => (
            <View style={styles.boardRow} key={row}>
              {[...Array(gridLengthSetting).keys()].map((col) => {
                const i = row * gridLengthSetting + col;
                return (
                  <Square
                    key={`${i}-${resetCount}`}
                    value={squares[i]}
                    onSquareClick={() => handleSquareClick(squares[i])}
                    blast={exploding ? blasts[i] : null}
                    colorEnabled={colorBoxSetting}
                    textColorEnabled={textColorSetting}
                    blendInSetting={blendInSetting}
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
          {displayReplay()}
          {/* <Pressable
            onPress={handleLose}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Explode</Text>
          </Pressable>
          <Pressable
            onPress={handleWin}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Confetti</Text>
          </Pressable>
*/}
          {/* <Pressable
            onPress={()=>{timerRef.current?.pauseGame()}}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && styles.resetButtonPressed,
            ]}
          >
            <Text style={styles.resetButtonText}>Pause</Text>
          </Pressable>  */}
        </View>
      </View>
    </View>
  );
}

const SQUARE_SIZE = 76;
const TIMER_SLOT_HEIGHT = 28;
const MESSAGE_SLOT_HEIGHT = 32;

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
    lineHeight: MESSAGE_SLOT_HEIGHT,
    fontWeight: "700",
    color: "#e8eaf6",
    letterSpacing: 0.4,
  },
  timerSlot: {
    height: TIMER_SLOT_HEIGHT,
    justifyContent: "center",
  },
  messageSlot: {
    height: MESSAGE_SLOT_HEIGHT,
    justifyContent: "center",
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