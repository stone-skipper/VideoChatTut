import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import Postit from "./component/Postit";
import { motion } from "framer-motion/dist/framer-motion";

// const socket = io.connect("http://localhost:5000");
const socket = io.connect("https://ancient-bayou-47853.herokuapp.com/");

function OnFrag() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Magic Wall");
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [searchParams, setSearchParams] = useSearchParams();

  const myVideo = useRef();
  const userVideo = useRef();
  const userVideo2 = useRef();

  const connectionRef = useRef();

  const [openHole, setOpenHole] = useState(false);
  const [holePos, setHolePos] = useState({ x: 0, y: 0 });
  const [holeSize, setHoleSize] = useState(400);
  const [opacity, setOpacity] = useState(0.3);
  const [blur, setBlur] = useState(25);
  const [selectedPostit, setSelectedPostit] = useState([]);
  const [toggleCanv, setToggleCanv] = useState(true);

  // const postitArray = [
  //   "Addictive and lead to decreased productivity and time wasting.",
  //   "Prevalent cyberbullying and harrassment can cause serious mental health consequences. ",
  //   // "Create unrealistic expectations and unhealthy comparisons, leading to poor self-esteem and body image issues.",
  //   "The spread of fake news, misinformation, and its impact on decision-making.",
  //   "Hate speech and propaganda, fostering division and conflict.",
  //   "A way to stay connected to friends, family, and community.",
  //   "A place to connect with different people in the world and freely share your opinions",
  //   // "Increase your visibility and build your audience for bigger opportunities in a career/business",
  //   "A great source of knowledge and information to get inspired",
  //   "Provide a platform for underrepresented communities to be heard and share their experiences.",
  // ];

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
    // "Cursor-Rob.png",
    // "Cursor-Sam.png",
    "Frame13464.png",
    // "Frame1080.png",
    // "Frame1081.png",
  ];
  useEffect(() => {
    console.log(searchParams.get("socketid"));

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
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
    });

    socket.on("switchMode", (data) => {
      setOpenHole(data.openHole);
      setBlur(data.blur);
      setOpacity(data.opacity);
      setHolePos(data.holePos);
      setHoleSize(data.holeSize);
      setSelectedPostit(data.postit);
    });

    setScreenSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const moveFeed = () => {
    socket.emit("switchMode", {
      blur: blur,
      opacity: opacity,
      holePos: holePos,
      holeSize: holeSize,
      openHole: openHole,
      postit: selectedPostit,
    });
  };

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
      moveFeed();
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
      userVideo2.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
      // moveFeed();
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  // useEffect(() => {
  //   moveFeed();
  // }, [selectedPostit]);

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
          display: callAccepted && !callEnded ? "none" : "block",
        }}
      >
        {/* <h1 style={{ textAlign: "center" }}>Magic wall</h1> */}
        <p style={{ textAlign: "center" }}>
          {" "}
          call to : {searchParams.get("socketid")}
        </p>

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
            </div>
          ) : (
            <IconButton
              color="primary"
              aria-label="call"
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
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          zIndex: 8,
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid white",
        }}
        drag={true}
        dragMomentum={false}
      >
        <div
          style={{
            width: "50%",
            height: "fit-content",
            position: "absolute",
            display: toggleCanv === true ? "flex" : "none",
            flexDirection: "row",
            gap: 50,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 8,
            pointerEvents: "none",
            flexWrap: "wrap",
            direction: "rtl",
          }}
        >
          {postitArray.slice(0, 5).map((info, index) => {
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
          {/* {postitArray.slice(5, 10).map((info, index) => {
            return (
              <Postit
                key={index}
                content={info}
                color={"white"}
                size={100}
                selected={selectedPostit.includes(index + 5)}
                onClick={() => {
                  console.log("!");
                  if (selectedPostit.includes(index + 5) === false) {
                    setSelectedPostit([...selectedPostit, index + 5]);
                  } else {
                    setSelectedPostit(
                      selectedPostit.filter((item) => item !== index + 5)
                    );
                  }
                }}
              />
            );
          })} */}
          {imageArray.reverse().map((info, index) => {
            return (
              <motion.img
                drag={true}
                dragMomentum={false}
                key={index}
                src={"img/" + info}
                alt={info}
                height={300}
                style={{ objectFit: "contain", pointerEvents: "auto" }}
              />
            );
          })}
        </div>
      </motion.div>
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
                // transform: "scaleX(-100%)",
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
            onClick={async (e) => {
              console.log(e.clientX, e.clientY);
              setOpenHole(!openHole);
              await setHolePos({ x: e.clientX, y: e.clientY });
              moveFeed();
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
                // left: screenSize.width - (holePos.x + holeSize / 2),
                left: holePos.x - holeSize / 2,
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
                <video
                  playsInline
                  ref={userVideo2}
                  autoPlay
                  muted
                  style={{
                    height: "100vh",
                    width: "100vw",
                    // transform: "scaleX(-100%)",
                    objectFit: "cover",
                    position: "absolute",
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
