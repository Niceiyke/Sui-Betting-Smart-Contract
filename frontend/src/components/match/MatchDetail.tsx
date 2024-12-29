import React, { useState } from "react";

import { useNewBetCreation } from "../hooks/useNewBetCreation";
import { Match } from "../../types";



interface MatchDetailProps {
  match: Match;
  onBack: () => void;
}

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack }) => {
  const [betChoice, setBetChoice] = useState<"Home" | "Away" | "Draw">("Home");
  const [betAmount, setBetAmount] = useState<number>(0);
  const  {placeNewBet}=useNewBetCreation()

  const onPlaceBet =async()=>{
    await placeNewBet(match.id,betChoice,betAmount)
  }

  const handleChoiceChange = (choice: "Home" | "Away" | "Draw") => {
    setBetChoice(choice);
  };

  const handleAmountChange = (amount: number) => {
    setBetAmount(amount);
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
        Match Details
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
              Select Bet Choice:
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={betChoice || ""}
              onChange={(e) => handleChoiceChange(e.target.value)}
            >
              <option value="">Select</option>
              <option value={match.home}>{match.home}</option>
              <option value={match.away}>{match.away}</option>
              <option value="Draw">Draw</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Enter Bet Amount:
            </label>
            <input
              type="number"
              className="w-full border rounded-md px-3 py-2"
              value={betAmount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>

          <button onClick={onPlaceBet} className="bg-green-500 rounded-md p-4">
            Place Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
