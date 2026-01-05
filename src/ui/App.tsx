import React, { useEffect, useRef, useState } from "react";
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
  Settings,
} from "lucide-react";
import "./css/App.css";
import "./css/HitboxEditor.css";
import "./css/settings.css";

function App() {
  type Offset = { x: number; y: number };
  type DragTarget = "modal" | "hitbox";

  type hitboxProps = {
    id: number;
    origin_x: number;
    origin_y: number;
    width: number;
    height: number;
  };

  const FRAME_CONFIG = {
    min: 1,
    max: 1000,
    def: 1,
    step: 1,
  };

  const SCALE_CONFIG = {
    min: 1,
    max: 16,
    def: 10,
    step: 1,
  };

  const BGSIZE_CONFIG = {
    min: 8,
    max: 240,
    def: 80,
    step: 8,
  };

  const hitboxAttributes = {
    id: 1,
    x: 200,
    y: 200,
    width: 150,
    height: 150,
  };

  const ICON_SIZE = 18;
  const ANIMATION_DURATION = 300;

  const [imgPath, setImgPath] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [imgFlippedHorizontally, setHorizontal] = useState<boolean>(true);
  const [imgFlippedVertically, setVertical] = useState<boolean>(true);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const [frames, setFrameCount] = useState<number>(FRAME_CONFIG.def);
  const [scale, setScaleSize] = useState<number>(SCALE_CONFIG.def);
  const [bgsize, setBgSize] = useState<number>(BGSIZE_CONFIG.def);

  const [hitboxes, setHitboxes] = useState<hitboxProps[]>([]);
  const [hitboxX, setHitboxX] = useState<number>(hitboxAttributes.x);
  const [hitboxY, setHitboxY] = useState<number>(hitboxAttributes.y);
  const [hitboxWidth, setHitboxWidth] = useState<number>(
    hitboxAttributes.width
  );
  const [hitboxHeight, setHitboxHeight] = useState<number>(
    hitboxAttributes.height
  );
  const [exitingHitboxIds, setExitingHitboxIds] = useState<number[]>([]);
  const [enteringHitboxIds, setEnteringHitboxIds] = useState<number[]>([]);

  const [isDragging, setDragging] = useState<"modal" | "hitbox" | null>(null);
  const [draggingHitboxId, setDraggingHitboxId] = useState<number | null>(null);

  const [modalOffset, setModalOffset] = useState<Offset>({ x: 0, y: 0 });
  const modalPos = useRef<Offset>({ x: 400, y: 200 });

  const [hitboxOffset, setHitboxOffset] = useState<Offset>({ x: 0, y: 0 });
  const [currentHitboxModal, setCurrentHitboxModal] = useState<number | null>(
    null
  );

  const [openSettings, setOpenSettings] = useState(false);
  const [closing, setClosing] = useState(false);

  const startDrag = (e: React.MouseEvent, target: DragTarget) => {
    e.preventDefault();
    e.stopPropagation();

    const draggableElement = e.currentTarget.parentElement;
    const rect = draggableElement!.getBoundingClientRect();

    setDragging(target);

    let offset: Offset = { x: 0, y: 0 };

    if (target === "modal") {
      offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setModalOffset(offset);
    } else if (target === "hitbox") {
      const hitboxId = draggingHitboxId;
      const currentHitbox = hitboxes.find((h) => h.id === hitboxId);

      if (currentHitbox) {
        const editorContainer = document.querySelector(".editor");
        if (!editorContainer) return;

        const editorRect = editorContainer.getBoundingClientRect();

        const hitboxElement = e.currentTarget as HTMLElement;
        const hitboxRect = hitboxElement.getBoundingClientRect();

        offset = {
          x: e.clientX - hitboxRect.left,
          y: e.clientY - hitboxRect.top,
        };
        setHitboxOffset(offset);
      }
    }
  };

  const stopDrag = () => {
    setDragging(null);
    setDraggingHitboxId(null);
  };

  function removeOneHitbox(id: number) {
    setExitingHitboxIds((prev) => [...prev, id]);

    setTimeout(() => {
      setHitboxes((prev) => prev.filter((w) => w.id !== id));
      setExitingHitboxIds((prev) =>
        prev.filter((exitingId) => exitingId !== id)
      );
    }, ANIMATION_DURATION);
  }

  function resetAttributes() {
    setHitboxX(hitboxAttributes.x);
    setHitboxY(hitboxAttributes.y);
    setHitboxWidth(hitboxAttributes.width);
    setHitboxHeight(hitboxAttributes.height);
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

      const newHitbox = {
        id: newId,
        origin_x: hitboxX,
        origin_y: hitboxY,
        width: hitboxWidth,
        height: hitboxHeight,
      };

      setEnteringHitboxIds((prev) => [...prev, newId]);

      setTimeout(() => {
        setEnteringHitboxIds((prev) =>
          prev.filter((enteringId) => enteringId !== newId)
        );
      }, ANIMATION_DURATION);

      return [...prev, newHitbox];
    });
    setHitboxX((prevX) => prevX + 90);
    setHitboxY((prevY) => prevY + 90);
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

  function handleColorCoding(currentScale: number) {
    const atMax = currentScale === SCALE_CONFIG.max;
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

  const toggleSettings = () => {
    if (openSettings) {
      setClosing(true);
      setTimeout(() => {
        setOpenSettings(false);
        setClosing(false);
      }, 250);
    } else {
      setOpenSettings(true);
    }
  };

  useEffect(() => {
    if (isDragging !== "modal") return;

    const move = (e: MouseEvent) => {
      const modal = document.querySelector(".hitbox-modal") as HTMLElement;
      if (!modal) return;

      const X = e.clientX - modalOffset.x;
      const Y = e.clientY - modalOffset.y;

      modalPos.current.x = X;
      modalPos.current.y = Y;

      modal.style.left = X + "px";
      modal.style.top = Y + "px";
    };

    const up = () => stopDrag();

    document.addEventListener("mousemove", move, { capture: true });
    document.addEventListener("mouseup", up, { capture: true });

    return () => {
      document.removeEventListener("mousemove", move, { capture: true });
      document.removeEventListener("mouseup", up, { capture: true });
    };
  }, [isDragging, modalOffset]);

  useEffect(() => {
    if (isDragging !== "hitbox" || draggingHitboxId === null) return;

    const editorContainer = document.querySelector(".editor");
    if (!editorContainer) return;
    const editorRect = editorContainer.getBoundingClientRect();

    const move = (e: MouseEvent) => {
      const mouseXRelativeToEditor = e.clientX - editorRect.left;
      const mouseYRelativeToEditor = e.clientY - editorRect.top;

      const X = mouseXRelativeToEditor - hitboxOffset.x;
      const Y = mouseYRelativeToEditor - hitboxOffset.y;

      setHitboxes((prevHitboxes) =>
        prevHitboxes.map((h) => {
          if (h.id === draggingHitboxId) {
            return {
              ...h,
              origin_x: X,
              origin_y: Y,
            };
          }
          return h;
        })
      );
    };

    const up = () => stopDrag();

    document.addEventListener("mousemove", move, { capture: true });
    document.addEventListener("mouseup", up, { capture: true });

    return () => {
      document.removeEventListener("mousemove", move, { capture: true });
      document.removeEventListener("mouseup", up, { capture: true });
    };
  }, [isDragging, draggingHitboxId, hitboxOffset, hitboxes]);

  return (
    <div className="container">
      {currentHitboxModal && (
        <div
          className="hitbox-modal"
          style={{ left: modalPos.current.x, top: modalPos.current.y }}
        >
          <div
            className="hitbox-editor"
            onMouseDown={(e) => startDrag(e, "modal")}
            onMouseUp={stopDrag}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
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
                        ? { ...h, origin_x: hitboxAttributes.x }
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
                        ? { ...h, origin_y: hitboxAttributes.y }
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
                        ? { ...h, width: hitboxAttributes.width }
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
                        ? { ...h, height: hitboxAttributes.height }
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
            <Github size={ICON_SIZE} />
          </a>

          <a
            href="https://www.linkedin.com/in/dihyah-adib-29b767281/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Linkedin size={ICON_SIZE} />
          </a>

          <a
            href="https://www.youtube.com/@SeamlessError"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
          >
            <Youtube size={ICON_SIZE} />
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

        <button
          onClick={() => setHorizontal(!imgFlippedHorizontally)}
          className="flip-buttons"
        >
          <FlipHorizontal size="1rem" color="white" />
          <span>
            {imgFlippedHorizontally ? "Flip Horizontal" : "Unflip Horizontal"}
          </span>
        </button>

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

        <span className="span-style">
          Frame Count: {frames}
          {frames === FRAME_CONFIG.min && (
            <span className="tiptool-text">(Default)</span>
          )}
          {frames !== FRAME_CONFIG.min && (
            <span className="tiptool-text">
              {" "}
              <RefreshCcw
                size={ICON_SIZE}
                style={{
                  cursor: "pointer",
                  verticalAlign: "middle",
                  display: "inline-flex",
                  alignItems: "center",
                }}
                onClick={() => setFrameCount(FRAME_CONFIG.def)}
              />
            </span>
          )}
        </span>

        <input
          type="number"
          className="input-styles"
          value={frames}
          min={FRAME_CONFIG.min}
          onChange={(e) =>
            setFrameCount(Math.max(FRAME_CONFIG.min, Number(e.target.value)))
          }
        />

        <span>
          Sprite-sheet Scale: {scale}{" "}
          {scale === SCALE_CONFIG.def && (
            <span className="tiptool-text">(Default)</span>
          )}
          {scale !== SCALE_CONFIG.def && (
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
                size={ICON_SIZE}
                onClick={() => setScaleSize(SCALE_CONFIG.def)}
              />
            </span>
          )}
        </span>

        <Slider
          defaultValue={SCALE_CONFIG.def}
          value={scale}
          valueLabelDisplay="off"
          shiftStep={SCALE_CONFIG.step}
          step={SCALE_CONFIG.step}
          min={SCALE_CONFIG.min}
          max={SCALE_CONFIG.max}
          className="input-styles"
          onChange={(_e, v) => setScaleSize(v)}
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

        <span>
          Background Grid Size: {bgsize}{" "}
          {bgsize === BGSIZE_CONFIG.def && (
            <span className="tiptool-text">(Default)</span>
          )}
          {bgsize !== BGSIZE_CONFIG.def && (
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
                size={ICON_SIZE}
                onClick={() => setBgSize(BGSIZE_CONFIG.def)}
              />
            </span>
          )}
        </span>

        <Slider
          defaultValue={BGSIZE_CONFIG.def}
          value={bgsize}
          valueLabelDisplay="off"
          shiftStep={BGSIZE_CONFIG.step}
          step={BGSIZE_CONFIG.step}
          marks
          min={BGSIZE_CONFIG.min}
          max={BGSIZE_CONFIG.max}
          onChange={(_e, v) => setBgSize(v)}
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

        {handleColorCoding(scale)}
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

          <Settings
            size={ICON_SIZE}
            color="#fff"
            className={`setting ${openSettings ? "spin-right" : "spin-left"}`}
            onClick={() => setOpenSettings(!openSettings)}
          />
        </div>

        {openSettings && (
          <>
            <div
              className={`settings-overlay ${closing ? "closing" : ""}`}
              onClick={toggleSettings}
            />
            <div className={`settings-modal ${closing ? "closing" : ""}`}>
              <div className="settings-header">
                <span>Settings</span>
                <span className="close-btn" onClick={toggleSettings}>
                  ×
                </span>
              </div>
              <Slider
                value={SCALE_CONFIG.def}
                min={SCALE_CONFIG.min}
                defaultValue={SCALE_CONFIG.def}
                max={SCALE_CONFIG.max}
                onChange={(_e, v) => setScaleSize(v as number)}
                valueLabelDisplay="auto"
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
              <Slider
                value={SCALE_CONFIG.def}
                // onChange={}
                valueLabelDisplay="auto"
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
              <input type="number" />
              <input type="number" />
              <input type="number" />
            </div>
          </>
        )}

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
            key={id}
            className={`${
              currentHitboxModal === id ? "highlighted-box" : "box"
            } ${exitingHitboxIds.includes(id) ? "exiting" : ""} ${
              enteringHitboxIds.includes(id) ? "entering" : ""
            }`}
            style={{
              left: origin_x,
              top: origin_y,
              width,
              height,
              cursor:
                isDragging === "hitbox" && draggingHitboxId === id
                  ? "grabbing"
                  : "grab",
            }}
            onMouseDown={(e) => {
              setDraggingHitboxId(id);
              startDrag(e, "hitbox");
            }}
            onMouseUp={stopDrag}
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
