import { useState } from "react";
import "./App.css";

function App() {
  const [imgPath, setImgPath] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [frames, setFrameCount] = useState<number | undefined>(1);

  async function handleOpen() {
    const newFilePath = await window.electronAPI.openImageDialog();
    if (!newFilePath) return;

    setFilePath(newFilePath);

    const blobUrl = window.electronAPI.loadImage(newFilePath);
    setImgPath(blobUrl);
  }

  async function handleClose() {
    if (filePath) {
      console.log("The file path is:", filePath);
      setImgPath(null);
      setFilePath(null);
    }
  }

  return (
    <div className="container">
      <div className="tooltip-bar">
        <p className="header-text">
          {filePath ? (
            <>
              <span>- Image path selected: {filePath} -</span>
            </>
          ) : (
            "- No Image Loaded -"
          )}
        </p>
      </div>
      <div className="editor">
        <div className="button-panel">
          <button onClick={handleOpen}>
            {!imgPath ? "Open Image" : "Change Image"}
          </button>

          <button onClick={handleClose}>Remove Image</button>
          <span>Frame Count: {frames}</span>
          <input
            type="number"
            name="Frame Count"
            id="frame-count"
            value={frames}
            min={0}
            onChange={(e) => {
              const value = Math.max(0, Number(e.target.value));
              setFrameCount(value);
            }}
          />
          <span>
            Image Width: <span>{innerWidth}</span>
          </span>
          <span>
            Image Height: <span>{innerHeight}</span>
          </span>
        </div>

        {imgPath && (
          <div className="image-viewer">
            <img src={imgPath} className="checkerboard-conic-background" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
