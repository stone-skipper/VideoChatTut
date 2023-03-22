import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import OnFrag from "./OnFrag";
import Control from "./Control";

const Main = () => {
  return (
    <Routes>
      {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/" element={<Home />}></Route>
      <Route path="/frag" element={<OnFrag />}></Route>
      <Route path="/control" element={<Control />}></Route>
    </Routes>
  );
};

export default Main;
