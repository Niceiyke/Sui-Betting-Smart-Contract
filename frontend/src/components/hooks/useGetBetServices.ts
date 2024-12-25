import { useEffect, useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SuiMoveObject } from "@mysten/sui/client";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";

export const useGetBetServices = () => {
  const [matchList, setMatchList] = useState<
    {
      id: string;
      home: string;
      away: string;
      status: string;
      result: [number];
      start_time:string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchAllBets = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const bets = await getBets();
      setMatchList(bets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBets();
  }, []);

  return { matchList, isLoading, isError };
};

const getBets = async () => {
  const client = new SuiClient({
    url: getFullnodeUrl("testnet"),
  });

  try {
    const allObjects = await client.getDynamicFields({
      parentId: `${DEPLOYED_OBJECTS.BET_MANAGER_ID}`,
    });

    const bets = await Promise.all(
      allObjects.data.map(async (obj) => {
        const details = await client.getObject({
          id: obj.name.value,
          options: { showContent: true },
        });

        const fields = (details.data?.content as SuiMoveObject).fields;
        return {
          id: fields.id.id,
          home: fields.home,
          away: fields.away,
          status:fields.status.variant,
          result:fields.result,
          start_time:fields.start_time
          
        };
      })
    );
    console.log(bets)
    return bets;
  } catch (error) {
    console.error("Error fetching bets:", error);
    return [];
  }
};
