import { motion } from "framer-motion/dist/framer-motion";
import { useEffect, useState } from "react";

function KnockEffect({ trigger, position, holeAccepted }) {
  const size = 200;

  return (
    <>
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background: "rgba(156, 171, 194, 0.4)",
          x: position.x - size / 2,
          y: position.y - size / 2,
          position: "absolute",
          zIndex: 3,
          top: 0,
          left: 0,
          display: trigger === true && holeAccepted === false ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
        }}
        initial={{ scale: 0, background: "rgba(156, 171, 194, 0.4)" }}
        animate={{ scale: 1, background: "rgba(156, 171, 194, 0)" }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      ></motion.div>
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: size,
          display: trigger === true && holeAccepted === false ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          x: position.x - size / 2,
          y: position.y - size / 2,
          position: "absolute",
          zIndex: 3,
          top: 0,
          left: 0,
        }}
        initial={{ scale: 0, background: "rgba(156, 171, 194, 0.4)" }}
        animate={{ scale: 1, background: "rgba(156, 171, 194, 0)" }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: 0.5,
        }}
      ></motion.div>
      <motion.div
        style={{
          width: size,
          height: size,
          borderRadius: size,
          display: trigger === true && holeAccepted === false ? "flex" : "none",
          justifyContent: "center",
          alignItems: "center",
          x: position.x - size / 2,
          y: position.y - size / 2,
          position: "absolute",
          zIndex: 3,
          top: 0,
          left: 0,
        }}
        initial={{ scale: 0, background: "rgba(156, 171, 194, 0.4)" }}
        animate={{ scale: 1, background: "rgba(156, 171, 194, 0)" }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          delay: 1,
        }}
      ></motion.div>
    </>
  );
}

export default KnockEffect;
