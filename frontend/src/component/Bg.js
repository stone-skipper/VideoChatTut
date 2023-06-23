import { motion } from "framer-motion/dist/framer-motion";
import { useState } from "react";
import { usePostitStore } from "../helper/store";
import Image from "./Image";
import Postit from "./Postit";
import Cursor from "./Cursor";

function Bg({ mode, blur = 0 }) {
  const bg = usePostitStore((state) => state.bg);

  return (
    <motion.div
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        zIndex: 2,
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: "blur(" + blur + "px)",
      }}
    >
      <img
        alt=""
        src={bg}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      ></img>
    </motion.div>
  );
}

export default Bg;
