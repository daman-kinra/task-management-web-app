import React from "react";
import ReactDom from "react-dom";
import App from "./App.js";
import { Context } from "./context/Context";
ReactDom.render(
  <Context>
    <App />
  </Context>,
  document.getElementById("root")
);
