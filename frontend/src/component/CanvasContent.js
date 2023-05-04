import { motion } from "framer-motion/dist/framer-motion";
import { useState } from "react";
import { usePostitStore } from "../helper/store";
import Image from "./Image";
import Postit from "./Postit";
import Cursor from "./Cursor";

function CanvasContent({ mode }) {
  const postit = usePostitStore((state) => state.postit);

  return (
    <motion.div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 8,
        // pointerEvents: "none",
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
          width: "60%",
          height: "fit-content",
          position: "absolute",
          display: mode === "noCanv" ? "none" : "flex",
          flexDirection: "row",
          gap: 50,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 8,
          pointerEvents: "none",
          flexWrap: "wrap",
        }}
      >
        {postit.map((info, index) => {
          if (info.type === "text") {
            return (
              <Postit
                content={info.content}
                color={"white"}
                size={100}
                onClick={() => {}}
              />
            );
          } else if (info.type === "img") {
            return <Image content={info.content} width={info.size} />;
          } else if (info.type === "cursor") {
            return <Cursor content={info.content} width={info.size} />;
          }
        })}
      </div>
    </motion.div>
  );
}

export default CanvasContent;
