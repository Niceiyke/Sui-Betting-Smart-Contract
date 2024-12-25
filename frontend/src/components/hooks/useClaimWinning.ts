import { Transaction } from "@mysten/sui/transactions";
import {  getFullnodeUrl, SuiClient, SuiObjectResponse } from "@mysten/sui/client";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";

import { useEffect, useState } from "react";

export const useClaimWinning = () => {
  const [recipts, setRecipt] = useState<SuiObjectResponse[]>([]);
  const [betRecipts, setBetRecipt] = useState<string>();
  
  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const client = new SuiClient({
    url: getFullnodeUrl("testnet"),
  });

  const fetchCoins = async (address: string) => {
    try {
      const response = await client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${DEPLOYED_OBJECTS.PACKAGE_ID}::bet::BetRecipt`,
        },
        options: {
          showType: true,
          showContent: true,
        },
      });
      console.log(response.data)

      setRecipt(response.data);
    } catch (error) {
      console.error("Error fetching recipt:", error);
      setRecipt([]);
    }
  };

  useEffect(() => {
    if (account && account?.address) {
      fetchCoins(account.address);
    }
  }, [account]);

const claimWinning = async (bet_id: string) => {
  try {
    if (!account) throw new Error("Wallet not connected");

    const recipt = recipts.find(
      (c) => c.data?.content?.fields?.bet_service_id === bet_id
    );
    if (!recipt) throw new Error("You have no winning to claim");
   console.log(recipt.data?.objectId)
    

    const tx = new Transaction();
    tx.moveCall({
      target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::claim_winning`,
      arguments: [tx.object(bet_id), tx.object(recipt?.data.objectId)],
    });

 signAndExecute(
      { transaction: tx },
      {
        onSuccess: async ({ digest }) => {
          const { effects, objectChanges } = await suiClient.waitForTransaction(
            {
              digest,
              options: { showEffects: true, showObjectChanges: true },
            }
          );
          console.log("Transaction successful!", effects, objectChanges);
        },
        onError: (error) => {
          console.error("Transaction failed", error);
        },
      }
    );
  } catch (error) {
    console.error("Error claiming winnings:", error);
  }
};

  return {
    isSuccess,
    isPending,
    claimWinning,
  };
};
