import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import Postit from "./component/Postit";
import { motion } from "framer-motion/dist/framer-motion";

// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://ancient-bayou-47853.herokuapp.com/");

function OnFrag() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Magic Wall");
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [searchParams, setSearchParams] = useSearchParams();

  const myVideo = useRef();
  const userVideo = useRef();
  const userVideo2 = useRef();

  const connectionRef = useRef();

  const [openHole, setOpenHole] = useState(false);
  const [holePos, setHolePos] = useState({ x: 0, y: 0 });
  const [holeSize, setHoleSize] = useState(800);
  const [opacity, setOpacity] = useState(0.3);
  const [blur, setBlur] = useState(30);
  const [selectedPostit, setSelectedPostit] = useState([]);

  const postitArray = [
    "Social media can be addictive and lead to decreased productivity and time wasting.",
    "Cyberbullying and harassment are prevalent on social media platforms and can have serious mental health consequences.",
    "Social media can create unrealistic expectations and unhealthy comparisons, leading to poor self-esteem and body image issues.",
    "The spread of fake news and misinformation can have harmful impacts on public opinion and decision-making.",
    "Social media can be a breeding ground for hate speech and propaganda, fostering division and conflict.",
    "Social media provides a platform for individuals and groups to connect and share ideas, fostering a sense of community and belonging.",
    "Social media can be a powerful tool for social and political activism, allowing for the mobilization of large groups of people for a common cause.",
    "Social media can facilitate the spread of important information and news in real-time, allowing for greater awareness and understanding of current events.",
    "Social media can be a valuable resource for businesses and entrepreneurs, allowing for targeted advertising and customer engagement.",
    "Social media can provide a platform for marginalized voices and underrepresented communities to be heard and share their experiences.",
  ];

  useEffect(() => {
    console.log(searchParams.get("socketid"));

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        setStream(stream);
        // myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("switchMode", (data) => {
      setOpenHole(data.openHole);
      setBlur(data.blur);
      setOpacity(data.opacity);
      setHolePos(data.holePos);
      setHoleSize(data.holeSize);
      setSelectedPostit(data.postit);

      console.log("switching mode!");
    });

    setScreenSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo2.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "fit-content",
          height: "fit-content",
          position: "absolute",
          top: 0,
          zIndex: 5,
          display: callAccepted && !callEnded ? "none" : "block",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#fff" }}>Magic wall</h1>

        <div
          style={{
            display: "block",
            background: "white",
            padding: 30,
            borderRadius: 10,
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {callAccepted && !callEnded ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
              <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                opacity {opacity}
                <input
                  type="range"
                  value={opacity}
                  onChange={(e) => {
                    setOpacity(e.target.value);
                  }}
                  min={0}
                  max={1}
                  step={0.1}
                  label={"opacity"}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                blur {blur}
                <input
                  type="range"
                  value={blur}
                  onChange={(e) => {
                    setBlur(parseInt(e.target.value));
                  }}
                  min={0}
                  max={100}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                holeSize {holeSize}
                <input
                  type="range"
                  value={holeSize}
                  onChange={(e) => {
                    setHoleSize(parseInt(e.target.value));
                  }}
                  min={0}
                  max={1000}
                />
              </div>
            </div>
          ) : (
            <IconButton
              color="primary"
              aria-label="call"
              onClick={() => {
                callUser(searchParams.get("socketid"));
              }}
            >
              <PhoneIcon fontSize="large" />
            </IconButton>
          )}

          <div>openhole : {openHole.toString()}</div>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 8,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "60%",
            height: "fit-content",
            position: "absolute",
            display: "flex",
            flexDirection: "row",
            gap: 50,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 8,
            pointerEvents: "none",
            flexWrap: "wrap",
          }}
        >
          {postitArray
            .slice(0, 5)
            .reverse()
            .map((info, index) => {
              return (
                <Postit
                  key={index}
                  content={info}
                  color={"white"}
                  size={100}
                  selected={selectedPostit.includes(index)}
                  onClick={() => {
                    console.log("!");
                    if (selectedPostit.includes(index) === false) {
                      setSelectedPostit([...selectedPostit, index]);
                    } else {
                      setSelectedPostit(
                        selectedPostit.filter((item) => item !== index)
                      );
                    }
                  }}
                />
              );
            })}
          {postitArray
            .slice(5, 10)
            .reverse()
            .map((info, index) => {
              return (
                <Postit
                  key={index}
                  content={info}
                  color={"white"}
                  size={100}
                  selected={selectedPostit.includes(index)}
                  onClick={() => {
                    console.log("!");
                    if (selectedPostit.includes(index) === false) {
                      setSelectedPostit([...selectedPostit, index]);
                    } else {
                      setSelectedPostit(
                        selectedPostit.filter((item) => item !== index)
                      );
                    }
                  }}
                />
              );
            })}
        </div>
      </div>
      {callAccepted && !callEnded ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              filter: "blur(" + blur + "px)",
              opacity: opacity,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* for blur */}
            <video
              playsInline
              ref={userVideo}
              autoPlay
              // muted
              style={{
                height: "100%",
                width: "100%",
                // transform: "scaleX(-100%)",
                objectFit: "cover",
              }}
            />
          </motion.div>
          <motion.div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 3,
            }}
            onClick={(e) => {
              console.log(e.clientX, e.clientY);
              setOpenHole(!openHole);
              setHolePos({ x: e.clientX, y: e.clientY });
            }}
          >
            <motion.div
              style={{
                overflow: "hidden",
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              animate={{
                width: holeSize,
                height: holeSize,
                borderRadius: holeSize / 2,
                left: screenSize.width - (holePos.x + holeSize / 2),
                top: holePos.y - holeSize / 2,
              }}
            >
              <motion.div
                style={{
                  overflow: "hidden",
                  position: "relative",
                }}
                animate={{
                  height: openHole === true ? holeSize : 0,
                  width: openHole === true ? holeSize : 0,
                  borderRadius: holeSize / 2,
                }}
              >
                <video
                  playsInline
                  ref={userVideo2}
                  autoPlay
                  muted
                  style={{
                    height: "100vh",
                    width: "100vw",
                    // transform: "scaleX(-100%)",
                    objectFit: "cover",
                    position: "absolute",
                    right: 0 - holePos.x + holeSize / 2,
                    top: 0 - holePos.y + holeSize / 2,
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

export default OnFrag;
