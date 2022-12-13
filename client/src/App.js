import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import UploadFiles from "./components/UploadFiles.js"

function App() {
  return (
    <div className="container">
      <h4> Using React to perform file uploads</h4>
      <div className="content">
        <UploadFiles />
      </div>
    </div>
  );
}

export default App;
