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

  useEffect(() => {
    if (imgFlippedHorizontally) {
    } else {
    }
  }, [imgFlippedHorizontally]);

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
    const sameScales = imgSize.width === imgSize.width * scale!;
    if (atMax || sameScales) {
      if (atMax) {
        return (
          <>
            <span>
              Image Width: <b className="scale-max">{imgSize.width} px</b>
            </span>
            <span>
              Image Height: <b className="scale-max">{imgSize.height} px</b>
            </span>
            <div className="divider"></div>
            <span>
              Scaled Image Width:{" "}
              <b className="scale-max">{imgSize.width * scale!} px</b>
            </span>
            <span>
              Scaled Image Height:{" "}
              <b className="scale-max">{imgSize.height * scale!} px</b>
            </span>
          </>
        );
      }
      if (sameScales) {
        return (
          <>
            <span>
              Image Width: <b className="same-scales">{imgSize.width} px</b>
            </span>
            <span>
              Image Height: <b className="same-scales">{imgSize.height} px</b>
            </span>
            <div className="divider"></div>
            <span>
              Scaled Image Width:{" "}
              <b className="same-scales">{imgSize.width * scale!} px</b>
            </span>
            <span>
              Scaled Image Height:{" "}
              <b className="same-scales">{imgSize.height * scale!} px</b>
            </span>
          </>
        );
      }
    } else {
      return (
        <>
          <span>
            Image Width: <b className="base-color">{imgSize.width} px</b>
          </span>
          <span>
            Image Height: <b className="base-color">{imgSize.height} px</b>
          </span>
          <div className="divider"></div>
          <span>
            Scaled Image Width:{" "}
            <b className="base-color">{imgSize.width * scale!} px</b>
          </span>
          <span>
            Scaled Image Height:{" "}
            <b className="base-color">{imgSize.height * scale!} px</b>
          </span>
        </>
      );
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

          <button onClick={() => setHorizontal(!imgFlippedHorizontally)}>
            {imgFlippedHorizontally ? (
              <>
                <FlipHorizontal color="white" size={"1rem"} />
                <span>Flip Horizontally</span>
              </>
            ) : (
              <>
                <FlipHorizontal color="white" size={"1rem"} />
                <span>Flip Back</span>
              </>
            )}
          </button>

          <button onClick={() => setVertical(!imgFlippedVertically)}>
            {imgFlippedVertically ? (
              <>
                <FlipVertical color="white" size={"1rem"} />
                <span>Flip Vertically</span>
              </>
            ) : (
              <>
                <FlipVertical color="white" size={"1rem"} />
                <span>Flip Back</span>
              </>
            )}
          </button>
          {frames === 1 ? (
            <span className="span-style">
              Frame Count: {frames}{" "}
              <span className="tiptool-text">(Default)</span>
            </span>
          ) : (
            <span className="span-style">Frame Count: {frames}</span>
          )}
          <p className="tiptool-text">
            Frame(s) count cannot be less than one.
          </p>
          <input
            type="number"
            name="Frame Count"
            className="input-styles"
            value={frames}
            min={1}
            onChange={(e) => {
              const value = Math.max(0, Number(e.target.value));
              setFrameCount(value);
            }}
          />
          {scale === 3 ? (
            <span>
              Sprite sheet Scale: {scale}{" "}
              <span className="tiptool-text">(Default)</span>
            </span>
          ) : (
            <span>Sprite sheet Scale: {scale}</span>
          )}
          <p className="tiptool-text">
            Scaling iamges cannot be less than one.
          </p>
          <input
            type="number"
            name="Image Scale"
            className="input-styles"
            value={scale}
            min={1}
            max={16}
            onChange={(e) => {
              const value = Math.max(0, Number(e.target.value));
              setScaleSize(value);
            }}
          />

          {bgsize === 64 ? (
            <span>
              Background Grid Size: {bgsize}{" "}
              <span className="tiptool-text">(Default)</span>
            </span>
          ) : (
            <span>Background Grid Size: {bgsize}</span>
          )}
          <p className="tiptool-text">
            Pro tip: Keep the number A multiple of 16 for better ratio to
            scalling results
          </p>
          <input
            type="number"
            name="BG Grid Size"
            className="input-styles"
            value={bgsize}
            min={16}
            step={16}
            max={512}
            onChange={(e) => {
              const value = Math.max(0, Number(e.target.value));
              setBgSize(value);
            }}
          />
          {handleColorCoding(scale!)}
        </div>

        {imgPath && (
          <div className="image-viewer">
            <img
              src={imgPath}
              className={`checkerboard-conic-background ${
                imgFlippedHorizontally ? "" : "flip-h"
              } ${imgFlippedVertically ? "" : "flip-v"}`}
              width={imgSize.width * scale!}
              height={imgSize.height * scale!}
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
