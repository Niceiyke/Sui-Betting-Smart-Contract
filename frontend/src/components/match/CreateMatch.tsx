import React, { useState } from "react";
import { useBetServiceCreation } from "../hooks/useBetServiceCreation";




const CreateMatch: React.FC = () => {
  const [homeTeam, setHomeTeam] = useState<string>("");
  const [awayTeam, setAwayTeam] = useState<string>("");
  const {isPending,isSuccess,createNewService} = useBetServiceCreation()

  const handleAddMatch = async() => {
    if (homeTeam && awayTeam) {
      const id=await createNewService(homeTeam,awayTeam)
   
      setHomeTeam("");
      setAwayTeam("");
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
      <button
        onClick={handleAddMatch}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        Add Match
      </button>
    </div>
  );
};

export default CreateMatch;
