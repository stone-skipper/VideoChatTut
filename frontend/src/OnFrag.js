import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import { motion } from "framer-motion/dist/framer-motion";

const socket = io.connect("https://localhost:5000");

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

  const [searchParams, setSearchParams] = useSearchParams();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

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
      setFeedPosition(data.feedPosition);
    });

    socket.on("switchMode", (data) => {
      setFeedPosition(data.feedPosition);
      setAutoFollow(data.autoFollow);
      console.log("switching mode!");
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
        name: deviceId,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
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
    });
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  function DeviceSelect({ number, selected }) {
    return (
      <div
        style={{
          width: 50,
          height: 30,
          background: "white",
          borderRadius: 5,
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: number === selected ? "2px solid blue" : "2px solid white",
        }}
        onClick={() => {
          setDeviceId(number);
        }}
      >
        {number}
      </div>
    );
  }

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
        }}
      >
        <h1 style={{ textAlign: "center", color: "#fff" }}>
          Device {deviceId} looking at {feedPosition}
        </h1>

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
          {/* <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          /> */}
          {callAccepted && !callEnded ? (
            <Button variant="contained" color="secondary" onClick={leaveCall}>
              End Call
            </Button>
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

          <div>name: {deviceId}</div>
          <div>auto follow mode {autoFollow === true ? "on" : "off"}</div>
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
        <motion.div
          style={{
            width: 300,
            height: 300,
            display: "flex",
            justifyContent: "center",
            borderRadius: 150,
            overflow: "hidden",
            background: "blue",
          }}
          initial={
            {
              // x: feedPosition < deviceId ? -200 : 500,
            }
          }
          animate={{
            opacity: feedPosition === deviceId ? 1 : 0.5,
          }}
        >
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ height: "100%", transform: "scaleX(-100%)" }}
          />
        </motion.div>
      ) : null}
      <div
        style={{
          width: "100vw",
          position: "absolute",
          bottom: 50,
          display: "flex",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <DeviceSelect number={1} selected={deviceId} />
        <DeviceSelect number={2} selected={deviceId} />
        <DeviceSelect number={3} selected={deviceId} />
      </div>
    </div>
  );
}

export default OnFrag;
