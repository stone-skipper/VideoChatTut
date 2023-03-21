import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
// import { motion } from "framer-motion/dist/framer-motion";
import { motion } from "framer-motion";
// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://ancient-bayou-47853.herokuapp.com/");

function OnFrag() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [deviceId, setDeviceId] = useState(0);
  const [feedPosition, setFeedPosition] = useState(null);
  const [name, setName] = useState("RP1");
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

  useEffect(() => {
    console.log(searchParams.get("socketid"));

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
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
      // setFeedPosition(data.feedPosition);
    });

    socket.on("switchMode", (data) => {
      setFeedPosition(data.feedPosition);
      setAutoFollow(data.autoFollow);
      setOpenHole(data.openHole);
      setBlur(data.blur);
      setOpacity(data.opacity);
      setHolePos(data.holePos);
      setHoleSize(data.holeSize);

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
        name: deviceId,
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

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo2.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const getFeedPosition = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
    });
    peer.on("switchMode", (data) => {
      setFeedPosition(data.feedPosition);
      setAutoFollow(data.autoFollow);
      setOpenHole(data.openHole);
      setBlur(data.blur);
      setOpacity(data.opacity);
      setHolePos(data.holePose);
      setHoleSize(data.holeSize);
    });
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
                    setBlur(e.target.value);
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
                    setHoleSize(e.target.value);
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
              // onClick={() => callUser(idToCall)}
              onClick={() => {
                callUser(searchParams.get("socketid"));
              }}
            >
              <PhoneIcon fontSize="large" />
            </IconButton>
          )}

          <div>openhole : {openHole.toString()}</div>
          <div>
            {callAccepted && !callEnded ? "connected" : "not connected"}
          </div>
        </div>
      </div>

      {/* <div>
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{
              height: 300,
              transform: "scaleX(-100%)",
              position: "absolute",
              bottom: 0,
            }}
          />
        )}
      </div> */}
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
                <motion.video
                  playsInline
                  ref={userVideo2}
                  autoPlay
                  style={{
                    height: "100vh",
                    width: "100vw",
                    transform: "scaleX(-100%)",
                    objectFit: "cover",
                    position: "absolute",
                  }}
                  animate={{
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
