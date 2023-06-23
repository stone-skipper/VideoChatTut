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
import Bg from "./component/Bg";
import KnockEffect from "./component/KnockEffect";

// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://ancient-bayou-47853.herokuapp.com/");

function Shadow() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Remote Participant");
  const [toggleUI, setToggleUI] = useState(true);
  const [toggleEditor, setToggleEditor] = useState(false);
  const [keycode, setKeycode] = useState();
  const [animDone, setAnimDone] = useState(false);

  const [mode, setMode] = useState("sil"); //sil <> win <> full

  const myVideo = useRef();
  const myVideo2 = useRef();

  const userVideo = useRef();
  const userVideo2 = useRef();
  const connectionRef = useRef();
  const baseURL = window.location + "frag?socketid=";

  const [openHole, setOpenHole] = useState(false);
  const [holePos, setHolePos] = useState({ x: 0, y: 0 });
  const [holeSize, setHoleSize] = useState(400);
  const [opacity, setOpacity] = useState(0.6);
  const [blur, setBlur] = useState(100);
  const [bodyOpacity, setBodyOpacity] = useState(1);
  const [bodyBlur, setBodyBlur] = useState(0);
  const [backgroundBlur, setBackgroundBlur] = useState(0);

  const [x, setX] = useState(1);
  const [y, setY] = useState(0.4);
  const [z, setZ] = useState(-0.3);
  const [toggleShadow, setToggleShadow] = useState(true);
  const [border, setBorder] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        setStream(stream);
        console.log(stream);
        myVideo.current.srcObject = stream;
        myVideo2.current.srcObject = stream;
      });
  }, []);

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
      tabIndex="0"
    >
      <Bg mode={mode} blur={backgroundBlur} />
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
          width: "100%",
          height: "100%",
          position: "relative",
          bottom: 0,
          right: 0,
          zIndex: 2,
          mixBlendMode: "multiply",
          display: toggleUI === true ? "block" : "none",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "50%",
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(217, 227, 235, 0) 0%, #D9E3EB 56.77%, rgba(217, 227, 235, 0) 84.9%)",
            position: "absolute",
          }}
        ></div>
        {stream && (
          //shadow
          <video
            playsInline
            muted
            ref={myVideo2}
            autoPlay
            style={{
              height: "100%",
              width: "100%",
              perspective: 1200,
              transform:
                "scaleX(-100%) rotate3d(" +
                x +
                ", " +
                y +
                ", " +
                z +
                ", 85deg)",
              transformOrigin: "bottom",
              filter: "blur(" + blur + "px) grayscale(1.0)",
              objectFit: "cover",
              mixBlendMode: "multiply",
              position: "absolute",
              opacity: opacity,
              display: toggleShadow === true ? "block" : "none",
              border:
                border === true ? "3px solid red" : "3px solid transparent",
            }}
          />
        )}
        {stream && (
          <video
            playsInline
            muted
            ref={myVideo}
            autoPlay
            style={{
              height: "100%",
              width: "100%",
              transform: "scaleX(-100%)",
              objectFit: "cover",
              mixBlendMode: "multiply",
              position: "absolute",
              opacity: bodyOpacity,
              filter: "blur(" + bodyBlur + "px)",
            }}
          />
        )}
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
        <p style={{ textAlign: "center" }}>
          background / visual effect testing
        </p>
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
            max={200}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          x {x}
          <input
            type="range"
            value={x}
            onChange={(e) => {
              setX(e.target.value);
            }}
            min={-1}
            max={1}
            step={0.1}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          y {y}
          <input
            type="range"
            value={y}
            onChange={(e) => {
              setY(e.target.value);
            }}
            min={-1}
            max={1}
            step={0.1}
          />
        </div>{" "}
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          z {z}
          <input
            type="range"
            value={z}
            onChange={(e) => {
              setZ(e.target.value);
            }}
            min={-1}
            max={1}
            step={0.1}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          bodyOpacity {bodyOpacity}
          <input
            type="range"
            value={bodyOpacity}
            onChange={(e) => {
              setBodyOpacity(e.target.value);
            }}
            min={0}
            max={1}
            step={0.1}
            label={"body opacity"}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          bodyBlur {bodyBlur}
          <input
            type="range"
            value={bodyBlur}
            onChange={(e) => {
              setBodyBlur(parseInt(e.target.value));
            }}
            min={0}
            max={200}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          bgBlur {backgroundBlur}
          <input
            type="range"
            value={backgroundBlur}
            onChange={(e) => {
              setBackgroundBlur(parseInt(e.target.value));
            }}
            min={0}
            max={200}
          />
        </div>
        <div
          style={{
            background: toggleShadow === true ? "green" : "darkgrey",
            color: "white",
          }}
          onClick={() => {
            setToggleShadow(!toggleShadow);
          }}
        >
          shadow: {toggleShadow.toString()}
        </div>
        <div
          style={{
            background: border === true ? "green" : "darkgrey",
            color: "white",
          }}
          onClick={() => {
            setBorder(!border);
          }}
        >
          border: {border.toString()}
        </div>
      </div>
      <CanvasContent mode={mode} />
    </div>
  );
}

export default Shadow;
