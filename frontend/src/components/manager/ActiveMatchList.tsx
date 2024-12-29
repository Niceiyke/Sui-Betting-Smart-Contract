import React from "react";
import { useNavigate } from "react-router-dom";

interface Match {
  id: string;
  home: string;
  away: string;
}

interface MatchListProps {
  matchList: Match[]; // Updated type
}

const ActiveMatchList: React.FC<MatchListProps> = ({ matchList }) => {
  const navigate = useNavigate();

  const handleNavigate = (id: string) => {
    console.log(id)
    navigate(`/active/match/${id}`); // Navigate to match detail page
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Active Matches
      </h1>
      <ul className="space-y-4">
        {matchList.map((match) => (
          <li
            key={match.id}
            className="p-4 bg-white rounded-md shadow-md border border-gray-200"
          >
            <div className="flex justify-between">
              <div className="flex gap-2">
                <p className="text-lg font-semibold text-gray-800">
                  {match.home}
                </p>
                <p className="text-sm text-gray-600 my-1">vs</p>
                <p className="text-lg font-semibold text-gray-800">
                  {match.away}
                </p>
              </div>
              <button
                className="bg-blue-700 rounded-md p-2 text-white hover:bg-blue-950"
                onClick={() => handleNavigate(match.id)}
              >
                Update Result
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActiveMatchList;
