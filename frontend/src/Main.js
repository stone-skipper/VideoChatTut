import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import OnHub from "./OnHub";

const Main = () => {
  return (
    <Routes>
      {/* The Switch decides which component to show based on the current URL.*/}
      <Route exact path="/" element={<Home />}></Route>
      <Route path="/hub" element={<OnHub />}></Route>
    </Routes>
  );
};

export default Main;
