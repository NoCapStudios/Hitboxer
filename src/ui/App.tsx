import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import {
  ImageOff,
  Images,
  ImageUp,
  FlipHorizontal,
  FlipVertical,
  Youtube,
  Github,
  Linkedin,
  RefreshCcw,
  X,
} from "lucide-react";
import "./css/App.css";
import "./css/HitboxEditor.css";

interface hitboxProps {
  id: number;
  origin_x: number;
  origin_y: number;
  width: number;
  height: number;
}

function App() {
  const attr = {
    Frame: { min: 1, max: 1000, def: 1, step: 1 },
    Scale: { min: 1, max: 16, def: 10, step: 1 },
    BgSize: { min: 8, max: 240, def: 80, step: 8 },
  };

  const hitboxAttr = {
    id: 1,
    x: 200,
    y: 200,
    width: 150,
    height: 150,
  };

  const iconSize = 18;

  const [imgPath, setImgPath] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [imgFlippedHorizontally, setHorizontal] = useState<boolean>(true);
  const [imgFlippedVertically, setVertical] = useState<boolean>(true);

  const [frames, setFrameCount] = useState<number>(attr.Frame.def);
  const [scale, setScaleSize] = useState<number>(attr.Scale.def);
  const [bgsize, setBgSize] = useState<number>(attr.BgSize.def);

  const [hitboxes, setHitboxes] = useState<hitboxProps[]>([]);
  const [hitboxX, setHitboxX] = useState<number>(hitboxAttr.x);
  const [hitboxY, setHitboxY] = useState<number>(hitboxAttr.y);
  const [hitboxWidth, setHitboxWidth] = useState<number>(hitboxAttr.width);
  const [hitboxHeight, setHitboxHeight] = useState<number>(hitboxAttr.height);

  const [isDragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 720, y: 360 });

  const [currentHitboxModal, setCurrentHitboxModal] = useState<number | null>(
    null
  );

  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  // const currentHitbox = hitboxes.find((h) => h.id === currentHitboxModal);

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const stopDrag = () => setDragging(false);

  const onDrag = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };
  function removeOneHitbox(id: number) {
    setHitboxes((prev) => prev.filter((w) => w.id !== id));
  }

  function resetAttributes() {
    setHitboxX(hitboxAttr.x);
    setHitboxY(hitboxAttr.y);
    setHitboxWidth(hitboxAttr.width);
    setHitboxHeight(hitboxAttr.height);
  }

  function removeAllHitboxes() {
    setHitboxes([]);
    resetAttributes();
  }

  function addOneHitbox() {
    setHitboxes((prev) => {
      const usedIds = prev.map((h) => h.id).sort((a, b) => a - b);

      let newId = 1;
      for (let i = 0; i < usedIds.length; i++) {
        if (usedIds[i] !== i + 1) {
          newId = i + 1;
          break;
        }
        newId = usedIds.length + 1;
      }
      // const newId = hitboxId;
      // setHitboxId(hitboxId + 1);

      return [
        ...prev,
        {
          id: newId,
          origin_x: hitboxX,
          origin_y: hitboxY,
          width: hitboxWidth,
          height: hitboxHeight,
        },
      ];
    });
    setHitboxX(hitboxX + 90);
    setHitboxY(hitboxY + 90);
  }

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
    const atMax = scale === attr.Scale.max;
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
    }
  }, [imgFlippedHorizontally]);

  useEffect(() => {
    const move = (e) => onDrag(e);
    const up = () => stopDrag();

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [isDragging, offset, position]);

  return (
    <div className="container">
      {currentHitboxModal && (
        <div
          className="hitbox-modal"
          style={{ top: position.y, left: position.x, position: "absolute" }}
        >
          <div
            className="hitbox-editor"
            onMouseDown={startDrag}
            onMouseUp={stopDrag}
            style={{ cursor: "grab" }}
          >
            <h2 className="hitbox-editor-header">Hitbox Editor Panel</h2>
            <div>
              <X
                size={28}
                color="#333"
                id="X"
                onClick={() => setCurrentHitboxModal(null)}
              />
            </div>
          </div>

          <button onClick={() => removeOneHitbox(currentHitboxModal)}>
            Delete Current Hitbox: {currentHitboxModal}
          </button>

          <button onClick={() => removeAllHitboxes()}>
            Delete All Hitboxes
          </button>

          <button onClick={() => resetAttributes()}>
            Reset Hitbox Attributes
          </button>
          <div className="input-col">
            <div className="input-row">
              <label>X:</label>
              <input
                type="number"
                className="input-styles-modal"
                value={
                  hitboxes.find((h) => h.id === currentHitboxModal)?.origin_x ??
                  hitboxX
                }
                step={10}
                min={10}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal ? { ...h, origin_x: v } : h
                    )
                  );
                }}
              />

              <RefreshCcw
                size={24}
                color="#fff"
                className="refresh"
                onClick={() =>
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal
                        ? { ...h, origin_x: hitboxAttr.x }
                        : h
                    )
                  )
                }
              />
            </div>

            <div className="input-row">
              <label>Y:</label>
              <input
                type="number"
                className="input-styles-modal"
                value={
                  hitboxes.find((h) => h.id === currentHitboxModal)?.origin_y ??
                  hitboxY
                }
                step={10}
                min={10}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal ? { ...h, origin_y: v } : h
                    )
                  );
                }}
              />

              <RefreshCcw
                size={24}
                color="#fff"
                className="refresh"
                onClick={() =>
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal
                        ? { ...h, origin_y: hitboxAttr.y }
                        : h
                    )
                  )
                }
              />
            </div>
          </div>

          <div className="input-col">
            <div className="input-row">
              <label>Width:</label>
              <input
                type="number"
                className="input-styles-modal"
                value={
                  hitboxes.find((h) => h.id === currentHitboxModal)?.width ??
                  hitboxWidth
                }
                step={10}
                min={10}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal ? { ...h, width: v } : h
                    )
                  );
                }}
              />

              <RefreshCcw
                size={24}
                color="#fff"
                className="refresh"
                onClick={() =>
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal
                        ? { ...h, width: hitboxAttr.width }
                        : h
                    )
                  )
                }
              />
            </div>

            <div className="input-row">
              <label>Height:</label>
              <input
                type="number"
                className="input-styles-modal"
                value={
                  hitboxes.find((h) => h.id === currentHitboxModal)?.height ??
                  hitboxHeight
                }
                step={10}
                min={10}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal ? { ...h, height: v } : h
                    )
                  );
                }}
              />

              <RefreshCcw
                size={24}
                color="#fff"
                className="refresh"
                onClick={() =>
                  setHitboxes((prev) =>
                    prev.map((h) =>
                      h.id === currentHitboxModal
                        ? { ...h, height: hitboxAttr.height }
                        : h
                    )
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="button-panel">
        <div className="social-buttons">
          <a
            href="https://github.com/NoCapStudios"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Github size={iconSize} />
          </a>

          <a
            href="https://www.linkedin.com/in/dihyah-adib-29b767281/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Linkedin size={iconSize} />
          </a>

          <a
            href="https://www.youtube.com/@SeamlessError"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Youtube size={iconSize} />
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

        <button onClick={() => addOneHitbox()} className="file-buttons">
          Create Hitbox
        </button>

        {/* <input type="number" value={}/> */}
        {/* Frame Count */}
        <span className="span-style">
          Frame Count: {frames}{" "}
          {frames === attr.Frame.min && (
            <span className="tiptool-text">(Default)</span>
          )}
          {frames !== attr.Frame.min && (
            <span className="tiptool-text">
              {" "}
              <RefreshCcw
                size={iconSize}
                style={{
                  cursor: "pointer",
                  verticalAlign: "middle",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                onClick={() => setFrameCount(attr.Frame.min)}
              />
            </span>
          )}
        </span>

        <input
          type="number"
          className="input-styles"
          value={frames}
          min={attr.Frame.min}
          onChange={(e) =>
            setFrameCount(Math.max(attr.Frame.min, Number(e.target.value)))
          }
        />

        {/* Scale */}
        <span>
          Sprite-sheet Scale: {scale}{" "}
          {scale === attr.Scale.def && (
            <span className="tiptool-text">(Default)</span>
          )}
          {scale !== attr.Scale.def && (
            <span
              className="tiptool-text"
              style={{
                cursor: "pointer",
                verticalAlign: "middle",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <RefreshCcw
                size={iconSize}
                onClick={() => setScaleSize(attr.Scale.def)}
              />
            </span>
          )}
        </span>

        <Slider
          defaultValue={attr.Scale.def}
          value={scale}
          valueLabelDisplay="off"
          shiftStep={attr.Scale.step}
          step={attr.Scale.step}
          min={attr.Scale.min}
          max={attr.Scale.max}
          className="input-styles"
          onChange={(e, v) => setScaleSize(v)}
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
          {bgsize === attr.BgSize.def && (
            <span className="tiptool-text">(Default)</span>
          )}
          {bgsize !== attr.BgSize.def && (
            <span
              className="tiptool-text"
              style={{
                cursor: "pointer",
                verticalAlign: "middle",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <RefreshCcw
                size={iconSize}
                onClick={() => setBgSize(attr.BgSize.def)}
              />
            </span>
          )}
        </span>

        <Slider
          defaultValue={attr.BgSize.def}
          value={bgsize}
          valueLabelDisplay="off"
          shiftStep={attr.BgSize.step}
          step={attr.BgSize.step}
          marks
          min={attr.BgSize.min}
          max={attr.BgSize.max}
          onChange={(e, v) => setBgSize(v)}
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
        <div className=""></div>
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
            className="image-viewer checkerboard-conic-background "
            style={{
              backgroundSize: `${bgsize * 4}px ${bgsize * 4}px`,
            }}
          >
            <img
              src={imgPath}
              className={`image-border ${
                imgFlippedHorizontally ? "" : "flip-h"
              } ${imgFlippedVertically ? "" : "flip-v"}`}
              width={imgSize.width * scale}
              height={imgSize.height * scale}
              onLoad={handleImageLoad}
              draggable={false}
            />
          </div>
        )}

        {hitboxes.map(({ id, origin_x, origin_y, width, height }) => (
          <div
            // onMouseDown={}
            // onMouseUp={}
            // onMouseMove={}
            className={`${
              currentHitboxModal === id ? "highlighted-box" : "box"
            }`}
            style={{
              left: origin_x,
              top: origin_y,
              width,
              height,
            }}
            onClick={() => setCurrentHitboxModal(id)}
          >
            Hitbox: {id}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
