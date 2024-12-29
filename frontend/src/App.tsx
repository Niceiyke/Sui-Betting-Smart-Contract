import React from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import CreateMatch from "./components/match/CreateMatch";
import MatchList from "./components/match/Matchlist";
import MatchDetail from "./components/match/MatchDetail";
import {BackButton} from "./components/helpers/BackButton";
import { useGetBetServices } from "./components/hooks/useGetBetServices";
import ResolvedMatchList from "./components/user/ResolvedMatchList";
import ActiveMatchList from "./components/manager/ActiveMatchList";
import { Match } from "./types";
import ActiveMatchDetail from "./components/manager/UpdateBets";
import ResolvedMatchDetail from "./components/match/ResolvedMatchDetail";



export default function App() {
  const { bets, isLoading } = useGetBetServices();
  const navigate = useNavigate();
  const currentTime = Date.now();

  // Filter functions
  const filterActiveMatches = (match: Match) =>
    match.status === "Pending" && Number(match.startTime) > currentTime;

  const filterUpdateResultMatches = (match: Match) =>
    match.status === "Pending" && Number(match.startTime) < currentTime;

  const filterResolvedMatches = (match: Match) => match.status === "Resolved";

  // Filtered match lists
  const activeMatches = bets.filter(filterActiveMatches);
  const updateResultMatches = bets.filter(filterUpdateResultMatches);
  const resolvedMatches = bets.filter(filterResolvedMatches);

  // Generic match detail component
  const MatchDetailWrapper: React.FC<{
    filterFunction: (match: Match) => boolean;
    backPath: string;
  }> = ({ filterFunction, backPath }) => {
    const { id } = useParams();
    const match = bets.find((m) => m.id === id && filterFunction(m));

    if (!match) {
      return <p className="text-red-500 text-center mt-4">Match not found.</p>;
    }

    if (backPath === "/") {
      return <MatchDetail match={match} onBack={() => navigate(backPath)} />;;
    }

    if (backPath === "/active") {
      return <ActiveMatchDetail match={match} onBack={() => navigate(backPath)} />;
    }

    if (backPath === "/resolved") {
      return <ResolvedMatchDetail match={match} onBack={() => navigate(backPath)} />;
    }

    
  };
       
  // Generic list component
  const MatchListComponent: React.FC<{
    matchList: Match[];
    backPath?: string;
  }> = ({ matchList, backPath = "/" }) => {
    if (isLoading) {
      return <p className="text-center mt-4">Loading matches...</p>;
    }

    if (backPath === "/") {
      return <MatchList matchList={matchList} />;
    }

    if (backPath === "/active") {
      return <ActiveMatchList matchList={matchList} />;
    }

    if (backPath === "/resolved") {
      return <ResolvedMatchList matchList={matchList} />;
    }

    // If no conditions match, you might want to return something else or nothing
    return null;
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<MatchListComponent matchList={activeMatches} />}
        />
        <Route
          path="/active"
          element={
            <MatchListComponent
              matchList={updateResultMatches}
              backPath="/active"
            />
          }
        />
        <Route
          path="/match/:id"
          element={
            <MatchDetailWrapper
              filterFunction={filterActiveMatches}
              backPath="/"
            />
          }
        />
        <Route
          path="/active/match/:id"
          element={
            <MatchDetailWrapper
              filterFunction={filterUpdateResultMatches}
              backPath="/active"
            />
          }
        />
        <Route
          path="/resolved"
          element={
            <MatchListComponent
              matchList={resolvedMatches}
              backPath="/resolved"
            />
          }
        />
        <Route
          path="/resolved/match/:id"
          element={
            <MatchDetailWrapper
              filterFunction={filterResolvedMatches}
              backPath="/resolved"
            />
          }
        />
        <Route
          path="/create"
          element={
            <>
              <BackButton />
              <CreateMatch />
            </>
          }
        />
      </Routes>
    </>
  );
}
