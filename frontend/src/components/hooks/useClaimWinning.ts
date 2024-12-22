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
   const  recipt=recipts.filter((c) => {
      c.data?.content?.fields?.bet_service_id == bet_id;
     
    });
    console.log(recipt);
     setBetRecipt(recipt[0]?.data.objectId);
    const tx = new Transaction();
    try {
      if (!account) throw new Error("Wallet not connected");
      console.log(betRecipts)

      if(!betRecipts) throw new Error("You have no winning to claim");
      

      const betrecipt:string =betRecipts

      // Create the Move call
      tx.moveCall({
        target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::claim_winning`,
        arguments: [
          tx.object(bet_id), // BetService ID
          tx.object(betrecipt), // recipt ID
        ],
      });

      // Sign and execute the transaction
      signAndExecute(
        { transaction: tx },

        {
          onSuccess: async ({ digest }) => {
            const { effects, objectChanges } =
              await suiClient.waitForTransaction({
                digest,
                options: {
                  showEffects: true,
                  showObjectChanges: true,
                },
              });

            console.log("Transaction successful!", effects, objectChanges);
            return effects?.created[0]?.reference.objectId;
          },
          onError: (error) => {
            console.error("Transaction failed", error);
          },
        }
      );
    } catch (error) {
      console.error("Error placing new bet:", error);
    }
  };

  return {
    isSuccess,
    isPending,
    claimWinning,
  };
};
