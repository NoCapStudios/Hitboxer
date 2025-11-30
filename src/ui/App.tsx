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
  type Offset = { x: number; y: number };
  type DragTarget = "modal" | "hitbox";

  const FrameAttributes = {
    Frame: { min: 1, max: 1000, def: 1, step: 1 },
    Scale: { min: 1, max: 16, def: 10, step: 1 },
    BgSize: { min: 8, max: 240, def: 80, step: 8 },
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

  const [frames, setFrameCount] = useState<number>(FrameAttributes.Frame.def);
  const [scale, setScaleSize] = useState<number>(FrameAttributes.Scale.def);
  const [bgsize, setBgSize] = useState<number>(FrameAttributes.BgSize.def);

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

  // State to track WHICH element is currently being dragged
  const [isDragging, setDragging] = useState<"modal" | "hitbox" | null>(null);
  // State to track WHICH hitbox ID is being dragged (only used if isDragging is 'hitbox')
  const [draggingHitboxId, setDraggingHitboxId] = useState<number | null>(null);

  // Modal Drag State
  const [modalOffset, setModalOffset] = useState<Offset>({ x: 0, y: 0 });
  const modalPos = useRef<Offset>({ x: 400, y: 200 }); // Ref for current modal position

  // Hitbox Drag State
  const [hitboxOffset, setHitboxOffset] = useState<Offset>({ x: 0, y: 0 });
  // The hitboxPos ref is no longer strictly needed for drag, as position is managed in 'hitboxes' state

  const [currentHitboxModal, setCurrentHitboxModal] = useState<number | null>(
    null
  );

  const startDrag = (e: React.MouseEvent, target: DragTarget) => {
    e.preventDefault();
    e.stopPropagation();

    // The element whose bounding box is used for offset calculation
    const draggableElement = e.currentTarget.parentElement;
    const rect = draggableElement!.getBoundingClientRect();

    setDragging(target);

    const offset: Offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    if (target === "modal") {
      setModalOffset(offset);
    } else if (target === "hitbox") {
      setHitboxOffset(offset);
    }
  };

  const stopDrag = () => {
    setDragging(null);
    setDraggingHitboxId(null);
  };

  // REMOVED: The old generic 'onDrag' function is no longer needed.

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
    // New hitbox creation logic, slightly simplified
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
        // Use the default/state coordinates for the new hitbox
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
    // Offset the next default hitbox position
    setHitboxX((prevX) => prevX + 90);
    setHitboxY((prevY) => prevY + 90);
  }
  // --- END Logic Functions ---

  // --- BEGIN useEffect Hooks for Independent Dragging ---

  // 1. Modal Dragging Logic
  useEffect(() => {
    if (isDragging !== "modal") return;

    const move = (e: MouseEvent) => {
      const modal = document.querySelector(".hitbox-modal") as HTMLElement;
      if (!modal) return;

      const X = e.clientX - modalOffset.x;
      const Y = e.clientY - modalOffset.y;

      // Update the Ref (for rendering the modal on initial load/position)
      modalPos.current.x = X;
      modalPos.current.y = Y;

      // Update the DOM element directly for performance during drag
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

  // 2. Hitbox Dragging Logic (New/Corrected Hook)
  useEffect(() => {
    if (isDragging !== "hitbox" || draggingHitboxId === null) return;

    const move = (e: MouseEvent) => {
      const X = e.clientX - hitboxOffset.x;
      const Y = e.clientY - hitboxOffset.y;

      // Update the position of the specific dragged hitbox in the state
      setHitboxes((prevHitboxes) =>
        prevHitboxes.map((h) => {
          if (h.id === draggingHitboxId) {
            // Return the new position based on drag movement
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
  }, [isDragging, draggingHitboxId, hitboxOffset]);
  // --- END useEffect Hooks ---

  // --- REST OF APP COMPONENT (UNMODIFIED FUNCTIONS) ---

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
    const atMax = scale === FrameAttributes.Scale.max;
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
      // Logic for horizontal flip if needed
    }
  }, [imgFlippedHorizontally]);

  // --- BEGIN RENDER ---
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
          Frame Count: {frames}{" "}
          {frames === FrameAttributes.Frame.min && (
            <span className="tiptool-text">(Default)</span>
          )}
          {frames !== FrameAttributes.Frame.min && (
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
                onClick={() => setFrameCount(FrameAttributes.Frame.min)}
              />
            </span>
          )}
        </span>

        <input
          type="number"
          className="input-styles"
          value={frames}
          min={FrameAttributes.Frame.min}
          onChange={(e) =>
            setFrameCount(
              Math.max(FrameAttributes.Frame.min, Number(e.target.value))
            )
          }
        />

        <span>
          Sprite-sheet Scale: {scale}{" "}
          {scale === FrameAttributes.Scale.def && (
            <span className="tiptool-text">(Default)</span>
          )}
          {scale !== FrameAttributes.Scale.def && (
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
                onClick={() => setScaleSize(FrameAttributes.Scale.def)}
              />
            </span>
          )}
        </span>

        <Slider
          defaultValue={FrameAttributes.Scale.def}
          value={scale}
          valueLabelDisplay="off"
          shiftStep={FrameAttributes.Scale.step}
          step={FrameAttributes.Scale.step}
          min={FrameAttributes.Scale.min}
          max={FrameAttributes.Scale.max}
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
          {bgsize === FrameAttributes.BgSize.def && (
            <span className="tiptool-text">(Default)</span>
          )}
          {bgsize !== FrameAttributes.BgSize.def && (
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
                onClick={() => setBgSize(FrameAttributes.BgSize.def)}
              />
            </span>
          )}
        </span>

        <Slider
          defaultValue={FrameAttributes.BgSize.def}
          value={bgsize}
          valueLabelDisplay="off"
          shiftStep={FrameAttributes.BgSize.step}
          step={FrameAttributes.BgSize.step}
          marks
          min={FrameAttributes.BgSize.min}
          max={FrameAttributes.BgSize.max}
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
            key={id}
            className={`${
              currentHitboxModal === id ? "highlighted-box" : "box"
            } ${exitingHitboxIds.includes(id) ? "exiting" : ""} ${
              enteringHitboxIds.includes(id) ? "entering" : ""
            }`}
            style={{
              // Use per-hitbox coordinates from state
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
