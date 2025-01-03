import { useEffect, useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SuiMoveObject } from "@mysten/sui/client";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
import { Match } from "../../types";

// Define the structure of a bet


// Define the return type of the hook
interface UseGetBetServicesResult {
  bets: Match[];
  isLoading: boolean;
  isError: boolean;
}

// Define the custom hook
export const useGetBetServices = (): UseGetBetServicesResult => {
  const [bets, setBets] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchBets = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const fetchedBets = await getBets();
      setBets(fetchedBets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  return { bets, isLoading, isError };
};

// Helper function to fetch bets from the Sui network
const getBets = async (): Promise<Bet[]> => {
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  try {
    const allObjects = await client.getDynamicFields({
      parentId: DEPLOYED_OBJECTS.BET_MANAGER_ID,
    });

    const betPromises = allObjects.data.map(async (obj) => {
      const details = await client.getObject({
        id: obj.name.value,
        options: { showContent: true },
      });

      const fields = (details.data?.content as SuiMoveObject).fields;
      return {
        id: fields.id.id,
        home: fields.home,
        away: fields.away,
        status: fields.status.variant,
        result: fields.result,
        startTime: fields.start_time,
      };
    });

    const fetchedBets = await Promise.all(betPromises);
    console.log(fetchedBets);
    return fetchedBets;
  } catch (error) {
    console.error("Error fetching bets:", error);
    return [];
  }
};
