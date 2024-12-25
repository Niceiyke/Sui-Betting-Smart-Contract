import React from "react";
import CreateMatch from "./components/match/CreateMatch";
import MatchList from "./components/match/Matchlist";
import Navbar from "./components/navbar/Navbar";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { BackButton } from "./components/helpers/BackButton";
import MatchDetail from "./components/match/MatchDetail";
import { useGetBetServices } from "./components/hooks/useGetBetServices";
import ActiveMatchList from "./components/manager/ActiveBets";
import ActiveMatchDetail from "./components/manager/UpdateBets";
import ResolvedMatchDetail from "./components/match/ResolvedMatchDetail";
import ResolvedMatchList from "./components/user/ClaimWinning";

export default function App() {
  const { matchList, isLoading } = useGetBetServices(); // Get matches

  const time =Date.now()


  const activeMatches = matchList.filter((match) => match.status == "Pending" && Number(match.start_time) > time);

  //change logic to be greater than minutes of match play
  const updateResultList = matchList.filter(
    (match) => match.status == "Pending" && Number(match.start_time) < time
  );





  
  const resolvedMatch =matchList.filter((match)=>match.status=="Resolved")







  const navigate = useNavigate();


  // Wrapper to pass data to MatchDetail
  const MatchDetailWrapper: React.FC = () => {
    const { id } = useParams(); // Match ID from URL
    const match = matchList.find((m) => m.id === id); // Find match by ID

    if (!match) {
      return <p className="text-red-500 text-center mt-4">Match not found.</p>;
    }

    return <MatchDetail match={match} onBack={() => navigate("/")} />;
  };

  const UpdateMatchDetailWrapper: React.FC = () => {
    const { id } = useParams(); // Match ID from URL
    const match = updateResultList.find((m) => m.id === id); // Find match by ID

    if (!match) {
      return <p className="text-red-500 text-center mt-4">Match not found.</p>;
    }

    return <ActiveMatchDetail match={match} onBack={() => navigate("/active")} />;
  };

 const ResolvedMatchDetailWrapper: React.FC = () => {
   const { id } = useParams(); // Match ID from URL
   const match = resolvedMatch.find((m) => m.id === id); // Find match by ID

   if (!match) {
     return <p className="text-red-500 text-center mt-4">Match not found.</p>;
   }

   return (
     <ResolvedMatchDetail match={match} onBack={() => navigate("/resolved")} />
   );
 };

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            isLoading ? (
              <p className="text-center mt-4">Loading matches...</p>
            ) : (
              <MatchList matchList={activeMatches} />
            )
          }
        />
        <Route
          path="/active"
          element={
            isLoading ? (
              <p className="text-center mt-4">Loading matches...</p>
            ) : (
              <ActiveMatchList matchList={updateResultList} />
            )
          }
        />
        <Route path="/match/:id" element={<MatchDetailWrapper />} />
        <Route
          path="/active/match/:id"
          element={<UpdateMatchDetailWrapper />}
        />
        <Route
          path="/resolved"
          element={
            isLoading ? (
              <p className="text-center mt-4">Loading matches...</p>
            ) : (
              <ResolvedMatchList matchList={resolvedMatch} />
            )
          }
        />
        <Route
          path="/resolved/match/:id"
          element={<ResolvedMatchDetailWrapper />}
        />
        <Route
          path="/create"
          element={
            <div>
              <BackButton />
              <CreateMatch />
            </div>
          }
        />
      </Routes>
    </>
  );
}
