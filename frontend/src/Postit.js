import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import PhoneIcon from "@material-ui/icons/Phone";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import { motion } from "framer-motion/dist/framer-motion";

function Postit({ content, color, size }) {
  return (
    <motion.div
      drag={true}
      style={{
        background: color,
        width: size,
        height: size,
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "auto",
      }}
      dragMomentum={false}
    >
      {content}
    </motion.div>
  );
}

export default Postit;
