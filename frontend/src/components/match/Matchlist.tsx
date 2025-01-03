import React from "react";
import { useNavigate } from "react-router-dom";
import { Match } from "../../types";



interface MatchListProps {
  matchList: Match[]; // Updated type
}

const MatchList: React.FC<MatchListProps> = ({ matchList }) => {
  const navigate = useNavigate();

  const handleNavigate = (id: string) => {
    navigate(`/match/${id}`); // Navigate to match detail page
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-100 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-blue-600 mb-4">
        Upcoming Matches
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
                View Details
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MatchList;
