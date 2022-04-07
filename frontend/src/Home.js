import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import { Link } from "react-router-dom";

const socket = io.connect("http://localhost:5000");

function Home() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("desktop");
  const [userArray, setUserArray] = useState([]);
  var uArray = [];
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const baseURL = "http://localhost:3000/hub?socketid=";

  useEffect(() => {
    // navigator.mediaDevices
    //   .getUserMedia({ video: true, audio: false })
    //   .then((stream) => {
    //     setStream(stream);
    //     // myVideo.current.srcObject = stream;
    //   });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
      uArray.push({ name: data.name, autoFollow: data.autoFollow });
      console.log(uArray);
      setUserArray(uArray);
    });

    socket.on("switchMode", (data) => {
      console.log("switching mode", data);
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
      socket.emit("answerCall", {
        signal: data,
        to: caller,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    peer.on("signal", (data) => {
      socket.emit("switchMode", {
        name: data.name,
        autoFollow: data.autoFollow,
      });
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  return (
    <>
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
        <h1 style={{ textAlign: "center", color: "#fff" }}>
          Hybrid Meeting Experience Demo
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => {
            window.open(baseURL + me);
          }}
        >
          <QRCodeSVG value={baseURL + me} size={50} />,
        </div>
        <div>
          <div>
            {/* {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px", transform: "scaleX(-100%)" }}
              />
            )} */}
          </div>
          <div
            style={{
              height: "fit-content",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: 200,
                width: 200,
                borderRadius: 100,
                overflow: "hidden",
              }}
            >
              {callAccepted && !callEnded ? (
                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  style={{ height: "100%", transform: "scaleX(-100%)" }}
                />
              ) : null}
            </div>
            {userArray.length !== 0 && (
              <p style={{ textAlign: "center" }}>
                name : {userArray[0].name} <br />
                autoFollow : {userArray[0].autoFollow.toString()}
              </p>
            )}
          </div>
        </div>
        <div className="myId">
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </Button>
          </CopyToClipboard>

          {/* <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          /> */}
          {/* <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                onClick={() => callUser(idToCall)}
              >
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {idToCall}
          </div> */}
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name.toString()} is connecting...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Connect
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Home;
