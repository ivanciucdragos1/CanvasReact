import React, { useEffect, useState, useRef } from "react";

const UserPixelsBox = ({ userPublicKey }) => {
  const [userPixels, setUserPixels] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:3000");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (
        message.action === "updatePixelCount" &&
        message.userId === userPublicKey
      ) {
        setUserPixels(message.availablePixels);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [userPublicKey]);

  useEffect(() => {
    if (!userPublicKey) {
      setUserPixels(null); // Reset pixel count when userPublicKey is not available
      return;
    }

    const fetchUserPixels = async () => {
      const response = await fetch(
        `http://localhost:3000/user-pixels/${userPublicKey}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserPixels(data.available_pixels);
      } else {
        console.error("Failed to fetch user pixels");
        setUserPixels(null); // Reset or handle error state appropriately
      }
    };

    fetchUserPixels();
  }, [userPublicKey]);

  return (
    <div>
      <h2>Your Pixels:</h2>
      <p>{userPixels !== null ? `${userPixels} pixels` : "Loading..."}</p>
    </div>
  );
};

export default UserPixelsBox;
