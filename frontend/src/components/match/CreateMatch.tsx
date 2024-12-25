import React, { useState } from "react";
import { useBetServiceCreation } from "../hooks/useBetServiceCreation";

const CreateMatch: React.FC = () => {
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");
  const [startTime, setStartTime] = useState<string>(""); // New state for start time
  const { isPending, isSuccess, createNewService } = useBetServiceCreation();

  const handleAddMatch = async () => {
    if (homeTeam && awayTeam && startTime) {
      const date = new Date(startTime);
      const timestampMs = date.getTime();

      //console.log(date.setMinutes(date.getMinutes() + 90));

      const id = await createNewService(homeTeam, awayTeam, timestampMs); // Pass start time
      console.log(id)
      if(isSuccess){
        setHomeTeam("");
        setAwayTeam("");
        setStartTime(""); // Clear the start time input
        alert(`created match with id ${id}`);
      }

      
      
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mb-4">
      <input
        type="text"
        value={homeTeam}
        onChange={(e) => setHomeTeam(e.target.value)}
        placeholder="Home Team"
        className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <input
        type="text"
        value={awayTeam}
        onChange={(e) => setAwayTeam(e.target.value)}
        placeholder="Away Team"
        className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <input
        type="datetime-local" // Input type for datetime
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        placeholder="Start Time"
        className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      />
      <button
        onClick={handleAddMatch}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      disabled={isPending}>
        Add Match
      </button>
    </div>
  );
};

export default CreateMatch;
