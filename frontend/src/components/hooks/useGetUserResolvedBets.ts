import { useEffect, useState } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SuiMoveObject } from "@mysten/sui/client";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface BetRecipt {
  id: string;
  owner: string;
  choice: string;
  bet_id: string;
  amount: string;
}


export const useGetUserResolvedBets = (id: string) => {
  const account = useCurrentAccount();
  const [matchList, setMatchList] = useState<BetRecipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchAllBets = async () => {
    if (!account?.address) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const bets = await getBets(id, account.address);
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
  }, [id, account?.address]);

  return { matchList, isLoading, isError, fetchAllBets };
};


const getBets = async (bet_id:string,owner:string|undefined) => {
  const client = new SuiClient({
    url: getFullnodeUrl("testnet"),
  });

  try {
    const allObjects = await client.getDynamicFields({
      parentId: bet_id,
    });

    const bets = await Promise.all(
      allObjects.data.map(async (obj) => {
        const details = await client.getObject({
          id: obj.objectId,
          options: { showContent: true },
        });

        const fields = (details.data?.content?.fields.value as SuiMoveObject)
          .fields;
        return {
          id: fields.id.id,
          owner: fields.owner,
          choice: fields.choice,
          amount: fields.amount,
          bet_id: fields.bet_service_id,
        };
      }).filter((c)=>c)
    );
    console.log("resolved bets",bets.filter((c)=>c.owner ==owner));
    return bets;
  } catch (error) {
    console.error("Error fetching bets:", error);
    return [];
  }
};
