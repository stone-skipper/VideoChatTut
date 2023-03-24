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
