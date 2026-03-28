import React from "react";
import ReactDOM from "react-dom/client";
import GlobeView from "./GlobeView";
import "../styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="app">
      <GlobeView />
    </div>
  </React.StrictMode>
);
