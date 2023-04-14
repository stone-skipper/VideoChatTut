import Button from "@material-ui/core/Button";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion/dist/framer-motion";
import Postit from "./component/Postit";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";

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

  const [mode, setMode] = useState("sil"); //sil <> win <> full

  const postitArray = [
    "Addictive and lead to decreased productivity and time wasting.",
    "Prevalent cyberbullying and harrassment can cause serious mental health consequences. ",
    "Create unrealistic expectations and unhealthy comparisons, leading to poor self-esteem and body image issues.",
    "The spread of fake news, misinformation, and its impact on decision-making.",
    "Hate speech and propaganda, fostering division and conflict.",
    "A way to stay connected to friends, family, and community.",
    "A place to connect with different people in the world and freely share your opinions",
    "Increase your visibility and build your audience for bigger opportunities in a career/business",
    "A great source of knowledge and information to get inspired",
    "Provide a platform for underrepresented communities to be heard and share their experiences.",
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
      console.log("listener");
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
    moveFeed();
    console.log(selectedPostit);
  }, [openHole, holePos, blur, opacity, holeSize, selectedPostit]);

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
      setHoleSize(3000);
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
    >
      <div
        style={{
          width: "fit-content",
          height: "fit-content",
          position: "absolute",
          background: "blue",
          bottom: 0,
          right: 0,
          zIndex: 10,
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
          display: "flex",
          justifyContent: "center",
          position: "absolute",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
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
            display: mode === "noCanv" ? "none" : "flex",
            flexDirection: "row",
            gap: 50,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 8,
            pointerEvents: "none",
            flexWrap: "wrap",
          }}
        >
          {postitArray.map((info, index) => {
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
                  height: openHole === true ? holeSize : 0,
                  width: openHole === true ? holeSize : 0,
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
