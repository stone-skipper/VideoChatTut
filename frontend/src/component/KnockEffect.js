import { motion } from "framer-motion/dist/framer-motion";
import { useEffect, useState } from "react";

function KnockEffect({ trigger, position, holeAccepted }) {
  const size = 200;
  const [anim, setAnim] = useState(true);

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        // background: "blue",
        background: "rgba(156, 171, 194, 0.4)",
        x: position.x - size / 2,
        y: position.y - size / 2,
        position: "absolute",
        zIndex: 3,
        top: 0,
        left: 0,
        // display: "flex",
        display: trigger === true && holeAccepted === false ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      <motion.div
        style={{
          width: size / 2,
          height: size / 2,
          borderRadius: size / 4,
          background: "rgba(156, 171, 194, 0.4)",
        }}
        // initial={{ scale: 0, opacity: 1 }}
        // animate={{ scale: 1, opacity: 0 }}
        // transition={{ duration: 2, repeat: 3, repeatType: "loop" }}
      ></motion.div>
    </motion.div>
  );
}

export default KnockEffect;
