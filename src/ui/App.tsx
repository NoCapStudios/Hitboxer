import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import {
  ImageOff,
  Images,
  ImageUp,
  FlipHorizontal,
  FlipVertical,
  Instagram,
  Youtube,
  Github,
  Linkedin,
} from "lucide-react";
import "./App.css";

function App() {
  const [imgPath, setImgPath] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [imgFlippedHorizontally, setHorizontal] = useState<boolean>(true);
  const [imgFlippedVertically, setVertical] = useState<boolean>(true);

  const [frames, setFrameCount] = useState<number>(1);
  const [scale, setScaleSize] = useState<number>(10);
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

  useEffect(() => {
    if (imgFlippedHorizontally) {
    } else {
    }
  }, [imgFlippedHorizontally]);

  return (
    <div className="container">
      <div className="button-panel">
        <div className="social-buttons">
          <a
            href="https://github.com/NoCapStudios"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Github size={18} />
          </a>

          <a
            href="https://www.linkedin.com/in/dihyah-adib-29b767281/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Linkedin size={18} />
          </a>

          {/* <a
            href="https://instagram.com/YOUR_USERNAME"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Instagram size={18} />
          </a> */}

          <a
            href="https://www.youtube.com/@SeamlessError"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Youtube size={18} />
          </a>
        </div>
        <button onClick={handleOpen} className="file-buttons">
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

        <button onClick={handleClose} className="file-buttons">
          <ImageOff color="white" size={"1rem"} /> <span>Remove Image</span>
        </button>

        {/* Horizontal Flip */}
        <button
          onClick={() => setHorizontal(!imgFlippedHorizontally)}
          className="flip-buttons"
        >
          <FlipHorizontal size="1rem" color="white" />
          <span>
            {imgFlippedHorizontally ? "Flip Horizontal" : "Unflip Horizontal"}
          </span>
        </button>

        {/* Vertical Flip */}
        <button
          onClick={() => setVertical(!imgFlippedVertically)}
          className="flip-buttons"
        >
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
          {scale === 10 && <span className="tiptool-text">(Default)</span>}
        </span>

        <Slider
          defaultValue={10}
          value={scale}
          valueLabelDisplay="off"
          shiftStep={1}
          step={1}
          min={1}
          max={16}
          className="input-styles"
          onChange={(e, v) => setScaleSize(v as number)}
          sx={{
            color: "#305e49",
            height: 6,

            "& .MuiSlider-thumb": {
              width: 32,
              height: 16,
              borderRadius: 2,
              backgroundColor: "#fff",
              border: "2px solid #305e49",
              transition: "0.2s",
              "&:hover": { boxShadow: "0 0 0 8px rgba(48,94,73,0.16)" },
            },

            "& .MuiSlider-track": {
              border: "none",
            },

            "& .MuiSlider-rail": {
              opacity: 0.3,
              backgroundColor: "#305e49",
            },

            "& .MuiSlider-thumb.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(48,94,73,0.24)",
            },

            "& .MuiSlider-thumb.Mui-active": {
              boxShadow: "0 0 0 14px rgba(48,94,73,0.16)",
            },
          }}
        />

        {/* BG Size */}
        <span>
          Background Grid Size: {bgsize}{" "}
          {bgsize === 80 && <span className="tiptool-text">(Default)</span>}
        </span>

        <Slider
          defaultValue={80}
          value={bgsize}
          valueLabelDisplay="off"
          shiftStep={16}
          step={16}
          marks
          min={16}
          max={240}
          onChange={(e, v) => setBgSize(v as number)}
          sx={{
            color: "#305e49",
            height: 6,

            "& .MuiSlider-thumb": {
              width: 16,
              height: 16,
              borderRadius: 2,
              backgroundColor: "#fff",
              border: "2px solid #305e49",
              transition: "0.2s",
              "&:hover": { boxShadow: "0 0 0 8px rgba(48,94,73,0.16)" },
            },

            "& .MuiSlider-track": {
              border: "none",
            },

            "& .MuiSlider-rail": {
              opacity: 0.3,
              backgroundColor: "#305e49",
            },

            "& .MuiSlider-thumb.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(48,94,73,0.24)",
            },

            "& .MuiSlider-thumb.Mui-active": {
              boxShadow: "0 0 0 14px rgba(48,94,73,0.16)",
            },
          }}
        />
        {handleColorCoding(scale!)}
        <h1 style={{ color: "#ffffff09" }}>More Coming soon...</h1>
      </div>
      <div className="editor">
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

        {imgPath && (
          <div
            className="image-viewer"
            style={{ ["--square-size" as any]: `${bgsize}px` }}
          >
            <img
              src={imgPath}
              className={`checkerboard-conic-background ${
                imgFlippedHorizontally ? "" : "flip-h"
              } ${imgFlippedVertically ? "" : "flip-v"}`}
              style={{ "--square-size": `${bgsize}px` } as React.CSSProperties}
              width={imgSize.width * scale}
              height={imgSize.height * scale}
              onLoad={handleImageLoad}
              alt="loaded"
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
