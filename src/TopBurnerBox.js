import React, { useEffect, useState } from "react";

const TopBurnersBox = () => {
  const [topBurners, setTopBurners] = useState([]);

  useEffect(() => {
    const fetchTopBurners = async () => {
      const response = await fetch("http://localhost:3000/top-burners");
      if (response.ok) {
        const data = await response.json();
        setTopBurners(data);
      } else {
        console.error("Failed to fetch top burners");
      }
    };

    fetchTopBurners();
  }, []);

  return (
    <div>
      <h2>Top Burners:</h2>
      <ul>
        {topBurners.map((burner, index) => (
          <li key={index}>
            {burner.user_id}: {burner.total_burned} pixels
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopBurnersBox;
