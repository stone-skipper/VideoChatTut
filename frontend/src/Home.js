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

const socket = io.connect("https://etkqn5.sse.codesandbox.io/");

function Home() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Remote Participant");
  const [userArray, setUserArray] = useState([]);
  const [feedPosition, setFeedPosition] = useState(1);
  const [autoFollow, setAutoFollow] = useState(true);
  var uArray = [];
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const baseURL = "http://localhost:3000/frag?socketid=";

  useEffect(() => {
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
      uArray.push({ name: data.name, autoFollow: data.autoFollow });
      setUserArray(uArray);
    });

    socket.on("switchMode", (data) => {
      moveFeed();
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

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
      // peer.on("stream", (stream) => {
      //   userVideo.current.srcObject = stream;
      // });
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
      socket.emit("switchMode", {
        name: data.name,
        autoFollow: data.autoFollow,
      });
    });
    // peer.on("stream", (stream) => {
    //   userVideo.current.srcObject = stream;
    // });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };
  // const updatePeer = new Peer({
  //   initiator: true,
  //   trickle: false,
  // });
  const moveFeed = () => {
    socket.emit("switchMode", {
      autoFollow: autoFollow,
      feedPosition: feedPosition,
    });
  };
  function downHandler({ key }) {
    console.log(key);
    if (key === "1") {
      setFeedPosition(1);
    } else if (key === "2") {
      setFeedPosition(2);
    } else if (key === "3") {
      setFeedPosition(3);
    }
  }

  function upHandler({ key }) {}

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []);

  useEffect(() => {
    moveFeed();
  }, [feedPosition]);

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
          Remote Participant, looking at {feedPosition}
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
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "300px", transform: "scaleX(-1)" }}
              />
            )}
            <br />
            my video
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
            {/* <div
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
                  style={{
                    height: "100%",
                    transform: "scaleX(-100%)",
                    background: "blue",
                  }}
                />
              ) : null}
            </div> */}
            {userArray.length !== 0 && (
              <p style={{ textAlign: "center" }}>
                name : {userArray[0].name} <br />
              </p>
            )}
          </div>
        </div>

        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name.toString()} is calling...</h1>
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
