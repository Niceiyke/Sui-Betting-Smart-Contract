import React, { useState } from "react";
import { useUpdateBet } from "../hooks/useUpdateBet";
import { Match } from "../../types";

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
}

const ActiveMatchDetail: React.FC<MatchDetailProps> = ({ match, onBack }) => {
  const [result, setResult] = useState<"Home" | "Away" | "Draw" | "">("");
  console.log("updatebet", match.id);
  const { updateBet } = useUpdateBet({ betId: match.id, result });

  const onUpdateBet = async () => {
    try {
      await updateBet();
    } catch (error) {
      console.error("Error updating bet:", error);
    }
  };

  const handleResultChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setResult(event.target.value as "Home" | "Away" | "Draw" | "");
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 shadow-lg rounded-lg">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 underline hover:text-blue-800"
      >
        Back to Matches
      </button>
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Update Match Details
      </h1>
      <div className="p-4 bg-white rounded-md shadow-md border border-gray-200">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-gray-800">
            {match.home} vs {match.away}
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Select Winning Result:
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={result || ""}
              onChange={handleResultChange}
            >
              <option value="">Select</option>
              <option value={match.home}>{match.home}</option>
              <option value={match.away}>{match.away}</option>
              <option value="Draw">Draw</option>
            </select>
          </div>
          <button
            onClick={onUpdateBet}
            className="bg-green-500 text-white rounded-md p-4 hover:bg-green-600 transition-colors"
          >
            Update Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveMatchDetail;
