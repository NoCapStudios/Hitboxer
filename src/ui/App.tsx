import React, { useEffect, useState } from "react";
import {
  ImageOff,
  Images,
  ImageUp,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";
import "./App.css";

function App() {
  const [imgPath, setImgPath] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [imgFlippedHorizontally, setHorizontal] = useState<boolean>(true);
  const [imgFlippedVertically, setVertical] = useState<boolean>(false);

  const [frames, setFrameCount] = useState<number>(1);
  const [scale, setScaleSize] = useState<number>(3);
  const [bgsize, setBgSize] = useState<number>(64);

  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

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
      setImgSize({ width: 0, height: 0 });
    }
  }

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgSize({ width: naturalWidth, height: naturalHeight });
  }

  useEffect(() => {
    if (imgFlippedHorizontally) {
    } else {
    }
  }, [imgFlippedHorizontally]);

  function handleColorCoding(scale: number) {
    const atMax = scale === 16;
    const sameScales = imgSize.width === imgSize.width * scale;

    const className = atMax
      ? "scale-max"
      : sameScales
      ? "same-scales"
      : "base-color";

    return (
      <>
        <span>
          Image Width: <b className={className}>{imgSize.width} px</b>
        </span>
        <span>
          Image Height: <b className={className}>{imgSize.height} px</b>
        </span>

        <div className="divider"></div>

        <span>
          Scaled Image Width:{" "}
          <b className={className}>{imgSize.width * scale} px</b>
        </span>
        <span>
          Scaled Image Height:{" "}
          <b className={className}>{imgSize.height * scale} px</b>
        </span>
      </>
    );
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
            {!imgPath ? (
              <>
                <ImageUp color="white" size={"1rem"} /> <span>Open Image</span>
              </>
            ) : (
              <>
                <Images color="white" size={"1rem"} /> <span>Change Image</span>
              </>
            )}
          </button>

          <button onClick={handleClose}>
            <ImageOff color="white" size={"1rem"} /> <span>Remove Image</span>
          </button>

          {/* Horizontal Flip */}
          <button onClick={() => setHorizontal(!imgFlippedHorizontally)}>
            <FlipHorizontal size="1rem" color="white" />
            <span>
              {imgFlippedHorizontally ? "Flip Horizontal" : "Unflip Horizontal"}
            </span>
          </button>

          {/* Vertical Flip */}
          <button onClick={() => setVertical(!imgFlippedVertically)}>
            <FlipVertical size="1rem" color="white" />
            <span>
              {imgFlippedVertically ? "Flip Vertical" : "Unflip Vertical"}
            </span>
          </button>

          {/* Frame Count */}
          <span className="span-style">
            Frame Count: {frames}{" "}
            {frames === 1 && <span className="tiptool-text">(Default)</span>}
          </span>

          <input
            type="number"
            className="input-styles"
            value={frames}
            min={1}
            onChange={(e) => setFrameCount(Math.max(1, Number(e.target.value)))}
          />

          {/* Scale */}
          <span>
            Sprite-sheet Scale: {scale}{" "}
            {scale === 3 && <span className="tiptool-text">(Default)</span>}
          </span>

          <input
            type="number"
            className="input-styles"
            value={scale}
            min={1}
            max={16}
            onChange={(e) => setScaleSize(Math.max(1, Number(e.target.value)))}
          />

          {/* BG Size */}
          <span>
            Background Grid Size: {bgsize}{" "}
            {bgsize === 64 && <span className="tiptool-text">(Default)</span>}
          </span>

          <p className="tiptool-text">
            Pro tip: Keep the number A multiple of 16 for better ratio to
            scalling results
          </p>

          <input
            type="number"
            className="input-styles"
            min={16}
            step={16}
            max={512}
            value={bgsize}
            onChange={(e) => setBgSize(Math.max(16, Number(e.target.value)))}
          />

          {handleColorCoding(scale!)}
        </div>

        {imgPath && (
          <div
            className="image-viewer"
            style={{ ["--square-size" as any]: `${bgsize}px` }}
          >
            <img
              src={imgPath}
              onLoad={handleImageLoad}
              width={imgSize.width * scale}
              height={imgSize.height * scale}
              alt="loaded"
              draggable={false}
              className={`checkerboard-conic-background flip-anim ${
                imgFlippedHorizontally ? "" : "flip-h"
              } ${imgFlippedVertically ? "" : "flip-v"}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
