import { motion } from "framer-motion/dist/framer-motion";
import { useState } from "react";

function Postit({ content, color, size, onClick, selected = false }) {
  // const [select, setSelect] = useState(false);
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
        fontSize: 10,
        padding: 5,
        direction: "ltr",
        borderRadius: 9,
      }}
      animate={{
        border: selected === false ? "2px solid " + color : "2px solid blue",
      }}
      dragMomentum={false}
      onClick={() => {
        // setSelect(!select);
        onClick();
      }}
    >
      {content}
    </motion.div>
  );
}

export default Postit;
