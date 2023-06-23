import { motion } from "framer-motion/dist/framer-motion";
import { useState, useCallback, useEffect } from "react";
import { usePostitStore } from "../helper/store";
import { useDropzone } from "react-dropzone";

function Input({ type }) {
  // const [select, setSelect] = useState(false);
  const postit = usePostitStore((state) => state.postit);
  const bg = usePostitStore((state) => state.bg);
  const addPostit = usePostitStore((state) => state.addPostit);
  const [input, setInput] = useState("");
  const [active, setActive] = useState("");
  const [inactive, setInactive] = useState("");
  const [grab, setGrab] = useState("");
  const [bgSrc, setBgSrc] = useState("");
  const [size, setSize] = useState(200);

  const handleChange = (e) => {
    setInput(e.target.value);
  };
  const handleSize = (e) => {
    setSize(e.target.value);
  };

  useEffect(() => {
    console.log(postit);
  }, [postit]);

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsDataURL(file);
    });
  }

  const handleSubmit = async (image, setState) => {
    let imported = await readAsDataURL(image);
    // setInput(imported);
    setState(imported);
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
      console.log(file);
      handleSubmit(file, setInput);
    });
  }, []);

  const onActiveDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
      console.log(file);
      handleSubmit(file, setActive);
    });
  }, []);

  const onInactiveDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
      console.log(file);
      handleSubmit(file, setInactive);
    });
  }, []);

  const onGrabProps = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
      console.log(file);
      handleSubmit(file, setGrab);
    });
  }, []);

  const onBgProps = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsArrayBuffer(file);
      console.log(file);
      handleSubmit(file, setBgSrc);
    });
  }, []);

  const { getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  const { getInputProps: getActiveProps } = useDropzone({
    onDrop: onActiveDrop,
    accept: {
      "image/*": [],
    },
  });

  const { getInputProps: getInactiveProps } = useDropzone({
    onDrop: onInactiveDrop,
    accept: {
      "image/*": [],
    },
  });

  const { getInputProps: getGrabProps } = useDropzone({
    onDrop: onGrabProps,
    accept: {
      "image/*": [],
    },
  });

  const { getInputProps: getBgProps } = useDropzone({
    onDrop: onBgProps,
    accept: {
      "image/*": [],
    },
  });
  return (
    <div
      style={{
        width: "fit-content",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* text input */}

      {type === "text" && (
        <input placeholder="content" onChange={handleChange}></input>
      )}

      {/* image input */}

      {type === "img" && (
        <input
          {...getInputProps()}
          //   {...getRootProps()}
          style={{ width: "100%" }}
        ></input>
      )}
      {type === "img" && (
        <input
          placeholder="200"
          type="number"
          onChange={handleSize}
          style={{ width: 60 }}
        ></input>
      )}

      {/* cursor input */}
      {type === "cursor" && (
        <form>
          <label for="active">Active (Q)</label>
          <input
            {...getActiveProps()}
            style={{ width: "100%" }}
            id="active"
            label="Active"
          ></input>
        </form>
      )}
      {type === "cursor" && (
        <form>
          <label for="inactive">Inactive (W)</label>
          <input
            {...getInactiveProps()}
            style={{ width: "100%" }}
            id="inactive"
          ></input>
        </form>
      )}
      {type === "cursor" && (
        <form>
          <label for="inactive">Drag (E)</label>
          <input
            {...getGrabProps()}
            style={{ width: "100%" }}
            id="inactive"
          ></input>
        </form>
      )}

      {type === "cursor" && (
        <form>
          <label for="size">Width</label>
          <input
            placeholder="200"
            type="number"
            onChange={handleSize}
            style={{ width: 60 }}
            id="size"
          ></input>
        </form>
      )}
      {type === "bg" && (
        <form>
          <input {...getBgProps()} style={{ width: "100%" }} id="bg"></input>
        </form>
      )}

      <div
        style={{
          background: "blue",
          display: "flex",
          padding: 5,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 100,
          width: "fit-content",
          height: "fit-content",
        }}
        onClick={() => {
          if (type === "cursor") {
            addPostit({
              type: type,
              content: [active, inactive, grab],
              size: Number(size),
            });
          } else if (type === "bg") {
            usePostitStore.setState({ bg: bgSrc });
          } else {
            addPostit({ type: type, content: input, size: Number(size) });
          }
        }}
      >
        +
      </div>
    </div>
  );
}

export default Input;
