import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import { Link } from "react-router-dom";

const socket = io.connect("http://localhost:5000");

function OnHub() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);

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
        autoFollow: autoFollow,
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

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const switchMode = () => {
    setAutoFollow(!autoFollow);

    const peer = new Peer({
      initiator: false,
      trickle: true,
    });

    peer.on("signal", (data) => {
      socket.emit("switchMode", { name: name, autoFollow: autoFollow });
    });

    socket.on("callAccepted", (signal) => {
      peer.signal(signal);
    });
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
          width: "100vw",
          height: "fit-content",
          position: "absolute",
          top: 0,
        }}
      >
        <h1 style={{ textAlign: "center", color: "#fff" }}>
          Remote Participant
        </h1>

        <Link to="/">
          <button variant="outlined">back home</button>
        </Link>

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

          <div>name: {name}</div>
          <div
            style={{ background: "blue", cursor: "pointer", color: "white" }}
            onClick={() => {
              switchMode();
            }}
          >
            auto follow mode {autoFollow === true ? "on" : "off"}
          </div>
        </div>
      </div>

      <div>
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
      </div>
      <div>
        {/* {callAccepted && !callEnded ? (
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ height: "100%", transform: "scaleX(-100%)" }}
          />
        ) : null} */}
      </div>
    </div>
  );
}

export default OnHub;
