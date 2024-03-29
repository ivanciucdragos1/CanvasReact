// Canvas.js
import React, { useEffect, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";

const Canvas = ({ color, userPublicKey }) => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const ws = useRef(null);
  const pixelSize = 10;
  const [zoomLevel, setZoomLevel] = useState(1);
  const pixelData = useRef({});
  const minZoom = 1; // Define minZoom inside the component
  const maxZoom = 5; // Define maxZoom inside the component
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:3000`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.x !== undefined && data.y !== undefined) {
        updatePixelData(
          data.x,
          data.y,
          data.color,
          data.userId,
          data.timestamp
        );
      }
    };

    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      setCtx(canvasRef.current.getContext("2d"));
    }
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [zoomLevel, ctx]); // Redraw canvas on zoom level change or context setup

  const updatePixelData = (x, y, color, userId, timestamp) => {
    pixelData.current[`${x}-${y}`] = { color, userId, timestamp };
    drawPixel(x, y, color, userId, timestamp);
  };

  const drawPixel = (x, y, color, userId, timestamp) => {
    const scaledX = x * pixelSize * zoomLevel;
    const scaledY = y * pixelSize * zoomLevel;
    const scaledSize = pixelSize * zoomLevel;
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(scaledX, scaledY, scaledSize, scaledSize);
      ctx.strokeRect(scaledX, scaledY, scaledSize, scaledSize);
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newZoomLevel =
      e.deltaY < 0
        ? Math.min(maxZoom, zoomLevel * 1.1)
        : Math.max(minZoom, zoomLevel / 1.1);
    setZoomLevel(newZoomLevel);
  };

  const handleClick = (e) => {
    if (!userPublicKey) {
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components and dependencies to your app using the cli.
        </AlertDescription>
      </Alert>;
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (pixelSize * zoomLevel));
    const y = Math.floor((e.clientY - rect.top) / (pixelSize * zoomLevel));

    updatePixelData(x, y, color, userPublicKey, new Date().toISOString());

    // Send pixel placement to the server
    if (ws.current) {
      ws.current.send(
        JSON.stringify({
          action: "placePixel",
          x,
          y,
          color,
          userId: userPublicKey,
        })
      );
    }
  };

  const redrawCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      for (let key in pixelData.current) {
        const [x, y] = key.split("-").map(Number);
        drawPixel(
          x,
          y,
          pixelData.current[key].color,
          pixelData.current[key].userId,
          pixelData.current[key].timestamp
        );
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width="1000"
      height="1000"
      onWheel={handleWheel}
      onClick={handleClick}
      style={{ border: "2px solid #7C3AED", cursor: "pointer" }}
    ></canvas>
  );
};

export default Canvas;
