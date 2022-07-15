import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { getProvider } from "./utils/provider";
import { Web3ReactProvider } from "@web3-react/core";

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getProvider}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
