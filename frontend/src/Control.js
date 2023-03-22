import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import { motion } from "framer-motion/dist/framer-motion";

// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://ancient-bayou-47853.herokuapp.com/");

function Control() {
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

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const moveFeed = () => {
    socket.emit("switchMode", {
      autoFollow: autoFollow,
      feedPosition: feedPosition,
      blur: blur,
      opacity: opacity,
      holePos: holePos,
      holeSize: holeSize,
      openHole: openHole,
    });
  };

  useEffect(() => {
    moveFeed();
  }, [openHole, holePos, blur, opacity, holeSize]);

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
          width: "100vw",
          height: "fit-content",
          position: "absolute",
          top: 0,
          zIndex: 5,
        }}
      >
        <h1 style={{ textAlign: "center", color: "#fff" }}>Controller</h1>

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
        </div>
      </div>
    </div>
  );
}

export default Control;
