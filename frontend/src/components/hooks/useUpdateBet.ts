import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";
import { CoinStruct, getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { useEffect, useState } from "react";

export const useUpdateBet = (bet_id: string, result: string) => {
  const [admin, setAdmin] = useState<string>('');
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
          StructType: `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::BetAdmin`,
        },
        options: {
          showType: true,
          showContent: true,
        },
      });



   response.data.filter((c)=>{
    c.data?.content.fields.bet_id==bet_id
    setAdmin(c.data?.objectId);
  
  })

  console.log(admin)

    } catch (error) {
      console.error("Error fetching admin:", error);
      setAdmin('');
    }
  };

  useEffect(() => {
    if (account && account?.address) {
      fetchCoins(account.address);
    }
  }, [account]);

  const updateBet = async () => {
    const tx = new Transaction();
    try {
      if (!account) throw new Error("Wallet not connected");

      // Create the Move call
      tx.moveCall({
        target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::update_bet_with_result`,
        arguments: [
          tx.object(admin), // admin ID
          tx.object(bet_id), // BetService ID
          tx.pure(bcs.string().serialize(result)),
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
            return effects?.sharedObjects[0]?.objectId;
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
    updateBet,
  };
};