import React, { useEffect, useRef, useState } from "react";
import "./canvas.css"; // Ensure this CSS file contains any necessary styles

const Canvas = ({ color, userPublicKey, canvasWidth = 1000, canvasHeight = 1000 }) => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const ws = useRef(null);
  const pixelSize = 10;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const pixelData = useRef(initializePixelData(canvasWidth / pixelSize, canvasHeight / pixelSize));
  const [isPainting, setIsPainting] = useState(false);
  const [availablePixels, setAvailablePixels] = useState(0);

  function initializePixelData(width, height) {
    const data = new Array(height);
    for (let i = 0; i < height; i++) {
      data[i] = new Array(width).fill(null);
    }
    return data;
  }

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:3000`);

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.action === 'updatePixelCount' && message.userId === userPublicKey) {
        setAvailablePixels(message.availablePixels);
      } else if (message.x !== undefined && message.y !== undefined) {
        updatePixelData(message.x, message.y, message.color, message.userId, message.timestamp);
      }
    };

    return () => {
      ws.current.close();
    };
  }, [userPublicKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    setCtx(canvas.getContext("2d"));

    return () => {
      // Cleanup code here if needed
    };
  }, []);

  useEffect(() => {
    applyTransformations();
  }, [zoomLevel, offset]);

  const applyTransformations = () => {
    if (ctx) {
      ctx.setTransform(zoomLevel, 0, 0, zoomLevel, offset.x, offset.y);
      redrawCanvas();
    }
  };

  const updatePixelData = (x, y, color, userId, timestamp) => {
    pixelData.current[y][x] = { color, userId, timestamp };
    drawPixel(x, y, color);
  };

  const drawPixel = (x, y, color) => {
    if (ctx) {
      const scaledX = x * pixelSize;
      const scaledY = y * pixelSize;
      const scaledSize = pixelSize;
      ctx.fillStyle = color;
      ctx.fillRect(scaledX, scaledY, scaledSize, scaledSize);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newZoomLevel = e.deltaY < 0 ? Math.min(5, zoomLevel * 1.1) : Math.max(1, zoomLevel / 1.1);
    setZoomLevel(newZoomLevel);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPainting(true);
    } else if (e.button === 2) {
      setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const newX = e.clientX - startPan.x;
      const newY = e.clientY - startPan.y;
      setOffset({ x: newX, y: newY });
    } else if (isPainting) {
      paintPixel(e);
    }
  };

  const handleMouseUp = () => {
    setIsPainting(false);
    setIsPanning(false);
  };

  const paintPixel = (e) => {
    if (!userPublicKey || !isPainting || availablePixels <= 0) return;
  
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offset.x) / (pixelSize * zoomLevel));
    const y = Math.floor((e.clientY - rect.top - offset.y) / (pixelSize * zoomLevel));
  
    if (x >= 0 && x < canvasWidth / pixelSize && y >= 0 && y < canvasHeight / pixelSize) {
      updatePixelData(x, y, color, userPublicKey, new Date().toISOString());
  
      if (ws.current) {
        ws.current.send(JSON.stringify({
          action: "placePixel",
          x,
          y,
          color,
          userId: userPublicKey
        }));
  
        // Decrement the available pixels only after a successful backend update.
        setAvailablePixels((prev) => Math.max(0, prev - 1));
      }
    }
  };
  

  const handleClick = (e) => {
    if (!userPublicKey) {
      alert("You need to connect your wallet to place a pixel.");
      return;
    }
  
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - offset.x) / (pixelSize * zoomLevel));
    const y = Math.floor((e.clientY - rect.top - offset.y) / (pixelSize * zoomLevel));
  
    if (x >= 0 && x < canvasWidth / pixelSize && y >= 0 && y < canvasHeight / pixelSize) {
      updatePixelData(x, y, color, userPublicKey, new Date().toISOString());
  
      if (ws.current) {
        ws.current.send(JSON.stringify({ action: "placePixel", x, y, color, userId: userPublicKey }));
        setAvailablePixels((prev) => Math.max(0, prev - 1));
      }
    }
  };
  

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartPan({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
    setIsPanning(true);
  };

  const handleTouchMove = (e) => {
    if (isPanning) {
      const touch = e.touches[0];
      const newX = touch.clientX - startPan.x;
      const newY = touch.clientY - startPan.y;
      setOffset({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      for (let y = 0; y < pixelData.current.length; y++) {
        for (let x = 0; x < pixelData.current[y].length; x++) {
          const pixel = pixelData.current[y][x];
          if (pixel) {
            drawPixel(x, y, pixel.color);
          }
        }
      }
    }
  };

  const handleCanvasEnter = () => {
    document.body.style.overflow = "hidden";
  };

  const handleCanvasLeave = () => {
    document.body.style.overflow = "auto";
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}  // Consider stopping painting/panning when the mouse leaves the canvas
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
      style={{ border: "2px solid #7C3AED", cursor: "pointer", userSelect: "none" }}
    ></canvas>
  );
};

export default Canvas;


