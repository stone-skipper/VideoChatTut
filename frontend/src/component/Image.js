import { motion } from "framer-motion/dist/framer-motion";
import { useState } from "react";

function Image({ content, width }) {
  return (
    <motion.img
      drag={true}
      dragMomentum={false}
      src={content}
      alt={content}
      // width={300}
      //   height={300}
      style={{
        width: width,
        height: "auto",
        // objectFit: "contain",
        pointerEvents: "auto",
        // background: "blue",
      }}
    />
  );
}

export default Image;
