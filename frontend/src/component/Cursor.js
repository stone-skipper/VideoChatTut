import { motion } from "framer-motion/dist/framer-motion";
import { useEffect, useState } from "react";
import { usePostitStore } from "../helper/store";

function Cursor({ content, width }) {
  const [active, setActive] = useState(0); // 0 is active, 1 is inactive, 2 is grab
  const keyboard = usePostitStore((state) => state.keyboard);

  useEffect(() => {
    if (keyboard === 81) {
      setActive(0);
    } else if (keyboard === 87) {
      setActive(1);
    } else if (keyboard === 69) {
      setActive(2);
    }
    console.log(keyboard);
  }, [keyboard]);
  return (
    <motion.div
      style={{
        width: width,
        pointerEvents: "auto",
        height: "fit-content",
      }}
      drag={true}
      dragMomentum={false}
    >
      <img
        src={content[active]}
        alt={"cursor"}
        // width={300}
        //   height={300}
        style={{
          width: "100%",
          heigth: "auto",
          objectFit: "contain",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}

export default Cursor;
