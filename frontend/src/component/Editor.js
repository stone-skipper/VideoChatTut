import { motion } from "framer-motion/dist/framer-motion";
import { useState } from "react";
import { usePostitStore } from "../helper/store";
import Input from "./Input";

function Editor({ display = true }) {
  // const [select, setSelect] = useState(false);
  const postit = usePostitStore((state) => state.postit);
  const addPostit = usePostitStore((state) => state.addPostit);

  const Divider = () => {
    return (
      <div
        style={{ height: 1, width: "100%", background: "white", opacity: 0.2 }}
      ></div>
    );
  };

  const wrapperStyle = { display: "flex", flexDirection: "column", gap: 10 };
  const labetStyle = { fontWeight: "bold" };
  return (
    <div
      style={{
        width: "fit-content",
        maxWidth: 350,
        height: "100vh",
        position: "fixed",
        right: 0,
        top: 0,
        background: "#111111",
        padding: 20,
        color: "white",
        display: display === true ? "flex" : "none",
        gap: 20,
        flexDirection: "column",
        zIndex: 20,
        overflow: "hidden",
      }}
    >
      <h3>Content Editor</h3>
      <div style={wrapperStyle}>
        <span style={labetStyle}>Text</span>
        {postit.map((info, index) => {
          return (
            <div style={{ display: info.type === "text" ? "flex" : "none" }}>
              - {info.content}
            </div>
          );
        })}
        <Input type={"text"} />
      </div>
      <Divider />
      <div style={wrapperStyle}>
        <span style={labetStyle}>Image</span>
        {postit.map((info, index) => {
          return (
            <div style={{ display: info.type === "img" ? "flex" : "none" }}>
              - {info.content}
            </div>
          );
        })}
        <Input type={"img"} />
      </div>
      <Divider />

      <div style={wrapperStyle}>
        <span style={labetStyle}>Cursor</span>
        {postit.map((info, index) => {
          return (
            <div style={{ display: info.type === "cursor" ? "flex" : "none" }}>
              - {info.content}
            </div>
          );
        })}
        <Input type={"cursor"} />
      </div>
      <Divider />
    </div>
  );
}

export default Editor;
