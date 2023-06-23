import Button from "@material-ui/core/Button";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion/dist/framer-motion";
import Postit from "./component/Postit";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import Editor from "./component/Editor";
import { usePostitStore } from "./helper/store";
import CanvasContent from "./component/CanvasContent";
import KnockEffect from "./component/KnockEffect";

// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://ancient-bayou-47853.herokuapp.com/");

function Home() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Remote Participant");
  const [toggleUI, setToggleUI] = useState(false);
  const [toggleEditor, setToggleEditor] = useState(true);
  const [animDone, setAnimDone] = useState(false);
  const knockAudio = new Audio("audio/DigitalBongos.wav");
  const acceptAudio = new Audio("audio/ModernWarning.wav");
  const [mode, setMode] = useState("sil"); //sil <> win <> full

  const postit = usePostitStore((state) => state.postit);

  const postitArray = [
    "gaming controller",
    "user testings by regions",
    "customization",
    "future of connection",
  ];

  const imageArray = [
    "Frame1077.png",
    "Frame1078.png",
    "Frame1079.png",
    // "Option2.png",
    "Cursor-Rob.png",
    "Cursor-Sam.png",
    "Frame13464.png",
    // "Frame1080.png",
    // "Frame1081.png",
  ];
  const myVideo = useRef();
  const userVideo = useRef();
  const userVideo2 = useRef();
  const connectionRef = useRef();
  const baseURL = window.location + "frag?socketid=";

  const [openHole, setOpenHole] = useState(false);
  const [holePos, setHolePos] = useState({ x: 0, y: 0 });
  const [holeSize, setHoleSize] = useState(400);
  const [opacity, setOpacity] = useState(0.3);
  const [blur, setBlur] = useState(25);
  const [selectedPostit, setSelectedPostit] = useState([]);

  const moveFeed = () => {
    socket.emit("switchMode", {
      blur: blur,
      opacity: opacity,
      holePos: holePos,
      holeSize: holeSize,
      openHole: openHole,
      postit: selectedPostit,
    });
    console.log("switching mode");
  };

  function handleKeyDown(event) {
    console.log(event.keyCode);
    usePostitStore.setState({ keyboard: event.keyCode });
    // if (event.keyCode === 13) {
    //   console.log("Enter key pressed");
    // }
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        setStream(stream);
        console.log(stream);
        myVideo.current.srcObject = stream;
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
      // moveFeed();
      setOpenHole(data.openHole);
      setBlur(data.blur);
      setOpacity(data.opacity);
      setHolePos(data.holePos);
      setHoleSize(data.holeSize);
      setSelectedPostit(data.postit);
      // console.log("listener");
    });
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

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
      peer.on("stream", (stream) => {
        userVideo.current.srcObject = stream;
        userVideo2.current.srcObject = stream;
      });
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: caller,
      });
      // moveFeed();
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo2.current.srcObject = stream;
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  useEffect(() => {
    setHolePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }, []);

  useEffect(() => {
    if (callAccepted === true) {
      moveFeed();
    }
    // console.log(selectedPostit);
  }, [openHole, holePos, blur, opacity, holeSize, selectedPostit]);

  useEffect(() => {
    if (openHole === true && animDone === false) {
      knockAudio.play();
    } else if (openHole === true && animDone === true) {
      acceptAudio.play();
    }
  }, [openHole, animDone]);

  useEffect(() => {
    if (mode === "sil") {
      setOpenHole(false);
      setBlur(25);
      setOpacity(0.3);
    } else if (mode === "win") {
      setOpenHole(true);
      setHoleSize(400);
    } else if (mode === "full") {
      setOpenHole(true);
      setHoleSize(5000);
    }
  }, [mode]);

  const Btn = ({ title, active }) => {
    return (
      <div
        style={{
          padding: 10,
          width: "fit-content",
          height: "fit-content",
          color: "white",
          background: active === title ? "blue" : "grey",
        }}
        onClick={() => {
          setMode(title);
        }}
      >
        {title}
      </div>
    );
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
      }}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <Editor display={toggleEditor} />
      <div
        style={{
          position: "fixed",
          zIndex: 100,
          background: "#9CABC2",
          width: 30,
          height: 30,
          bottom: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => {
          setToggleEditor(!toggleEditor);
        }}
      >
        {toggleEditor === true && "✖"}
      </div>
      <div
        style={{
          position: "fixed",
          zIndex: 100,
          background: "#9CABC2",
          width: 30,
          height: 30,
          bottom: 0,
          left: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => {
          setToggleUI(!toggleUI);
        }}
      >
        {toggleUI === true && "✖"}
      </div>
      <div
        style={{
          width: "fit-content",
          height: "fit-content",
          position: "absolute",
          background: "blue",
          bottom: 0,
          right: 0,
          zIndex: 10,
          display: toggleUI === true ? "block" : "none",
        }}
      >
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{
              width: 300,
              height: 200,
              transform: "scaleX(-1)",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            background: "black",
            color: "white",
            bottom: 0,
            right: 0,
          }}
        >
          my view
        </div>
      </div>

      <div
        style={{
          width: "fit-content",
          justifyContent: "center",
          position: "absolute",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
          display: toggleUI === true ? "flex" : "none",
        }}
      >
        {/* header */}
        {/* <h1 style={{ textAlign: "center", color: "#fff" }}>
          Magic wall (moderator)
        </h1> */}
        <p style={{ textAlign: "center" }}> socket id :{me}</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            window.open(baseURL + me);
            navigator.clipboard.writeText(baseURL + me);
          }}
        >
          <QRCodeSVG value={baseURL + me} size={50} />,
        </div>
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
        openHole : {openHole.toString()}
        <div style={{ display: "flex" }}>
          <Btn title="sil" active={mode} />
          <Btn title="win" active={mode} />
          <Btn title="full" active={mode} />
          <Btn title="noCanv" active={mode} />
        </div>
        <div
          style={{
            background: animDone === true ? "green" : "darkgrey",
            color: "white",
          }}
          onClick={() => {
            setAnimDone(!animDone);
          }}
        >
          Rob accepted : {animDone.toString()}
        </div>
      </div>
      <CanvasContent mode={mode} />
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
                transform: "scaleX(-100%)",
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
                // background: "blue",
              }}
              animate={{
                width: holeSize,
                height: holeSize,
                left: holePos.x - holeSize / 2,
                top: holePos.y - holeSize / 2,
                borderRadius: holeSize / 2,
              }}
            >
              <motion.div
                style={{
                  overflow: "hidden",
                  position: "relative",
                }}
                animate={{
                  borderRadius: holeSize / 2,
                  height: animDone === true && openHole === true ? holeSize : 0,
                  width: animDone === true && openHole === true ? holeSize : 0,
                }}
              >
                <motion.video
                  playsInline
                  ref={userVideo2}
                  autoPlay
                  muted
                  style={{
                    height: "100vh",
                    width: "100vw",
                    transform: "scaleX(-100%)",
                    objectFit: "cover",
                    position: "absolute",
                  }}
                  animate={{
                    left: 0 - holePos.x + holeSize / 2,
                    top: 0 - holePos.y + holeSize / 2,
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      ) : null}
      <KnockEffect
        position={{ x: holePos.x, y: holePos.y }}
        trigger={openHole}
        holeAccepted={animDone}
      />
      <div>
        {receivingCall && !callAccepted ? (
          <div
            className="caller"
            style={{
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.3)",
              position: "absolute",
              zIndex: 15,
              top: 0,
              left: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div>
              <h1>{name.toString()} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Connect
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Home;
