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

function Mobile() {
  const [mobileControl, setMobileControl] = useState(null);
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [dWidth, setDWidth] = useState(0);
  const [dHeight, setDHeight] = useState(0);
  const [name, setName] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    setDWidth(window.innerWidth);
    setDHeight(window.innerHeight);
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
        name: mobileControl,
        width: dWidth,
        height: dHeight,
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
      // userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };
  const Btn = ({ number }) => {
    return (
      <div
        style={{
          width: 80,
          height: 40,
          background: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
          cursor: "pointer",
          border:
            number === mobileControl ? "1px solid blue" : "1px solid lightgrey",
        }}
        onClick={() => {
          setMobileControl(number);
        }}
      >
        {number}
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
          width: "100vw",
          height: "fit-content",
          position: "absolute",
          top: 0,
        }}
      >
        <h1 style={{ textAlign: "center", color: "#fff" }}>Mobile Control</h1>

        <Link to="/">
          <button variant="outlined">back home</button>
        </Link>
        <div
          style={{
            display: "flex",
            // display: mobileControl === null ? "flex" : "none",
            gap: 10,
            margin: 30,
          }}
        >
          <Btn number={1} />
          <Btn number={2} /> <Btn number={3} /> <Btn number={4} />
          <Btn number={5} /> <Btn number={6} />
        </div>
        <div
          style={{
            display: callAccepted ? "none" : "block",
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
                if (mobileControl !== null) {
                  callUser(searchParams.get("socketid"));
                } else alert("select device number first");
              }}
            >
              <PhoneIcon fontSize="large" />
            </IconButton>
          )}
        </div>
      </div>

      <div
        style={{ height: "100%", position: "absolute", left: 0, zIndex: -2 }}
      >
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{ height: "100%", objectFit: "contain" }}
          />
        )}
      </div>
      <div>
        {callAccepted && !callEnded ? (
          <video
            playsInline
            ref={userVideo}
            autoPlay
            style={{ height: "100%" }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default Mobile;
