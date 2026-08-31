import Countdown, { CountdownApi } from "react-countdown";
// Random component
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  Animated,

  StyleSheet,
  Text,
} from "react-native";

interface TimerProps{
  onTimout: () => void;
  pause: boolean;
  ref: any;
  duration: number;
}

export default function Timer({ onTimout, pause, ref, duration }: TimerProps) {

  const [key, setKey] = useState<number>(0) 
  const targetDate = useMemo(() => Date.now() + duration, [key]);
   const [displayTimout, setDisplayTimeout] = useState<boolean>(false)
   const timerRef = useRef<Countdown>(null)
   
    
   function handleTimout(){
      setDisplayTimeout(true)
      onTimout()
    }

    useImperativeHandle(ref, ()=>({
      pauseGame(){
        if (timerRef.current?.isPaused()){
          timerRef.current?.start()
        } 
        else{
           timerRef.current?.pause()
        }  
      },
      stopTimer(){
        timerRef.current?.stop()
        setDisplayTimeout(true)

      },
      
      resetTimer(){
        console.log("reset")
        setDisplayTimeout(false)
        setKey(key=>key+1)
      }

    }))


    useEffect(() => {
      const api: CountdownApi | undefined = timerRef.current?.getApi();
      if (!api) return;

      if (pause) {
        api.pause();
      } else {
        api.start();
      }
    }, [pause]);



    function renderer({api, formatted}) {
      //api.pause()
      let { hours, minutes, seconds } = formatted
      
      if (api.completed) {
            // Render a complete state
            return null
        } else {
            // Render a countdown
            return (
                <span>
                 <Animated.Text>
                    <Text style={styles.status}>
                    {hours}:{minutes}:{seconds}
                    </Text>
                 </Animated.Text>
                 
                 </span>
            );
        }
    };


    return(<>
            <span hidden={!displayTimout}>
                 <Animated.Text>
                    <Text style={styles.status}>
                    Game Over
                    </Text>
                 </Animated.Text>
                 
                 </span>
            <span hidden={displayTimout}>
            <Countdown date={targetDate} renderer={renderer} onComplete={()=>{handleTimout()}} controlled={false} ref={timerRef} key={key}/>
              </span>
          </>)
    

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