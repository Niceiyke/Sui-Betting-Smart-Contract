import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";
import { CoinStruct, getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import {useCurrentAccount,useSignAndExecuteTransaction,useSuiClient} from "@mysten/dapp-kit";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import { useEffect, useState } from "react";

export const useNewBetCreation = () => {
  const [coins, setCoins] = useState<CoinStruct[]>([]);

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
      const response = await client.getCoins({
        owner: address,
        coinType: SUI_TYPE_ARG,
      });
      
      setCoins(response.data);
    } catch (error) {
      console.error("Error fetching coins:", error);
      setCoins([]);
    }
  };


  useEffect(() => {
    if (account && account?.address) {
      fetchCoins(account.address);
    }
  }, [account]);

  const placeNewBet = async (
    bet_id: string,
    choice: string,
    amount: number
  ) => {
    const tx = new Transaction();
    try {
      if (!account) throw new Error("Wallet not connected");

      // Find a coin with sufficient balance for both the bet and gas
      const coin = coins.find(
        (c) => Number(c.balance) >= (amount) * 1e9
      ); // Add a small buffer for gas fees


      if (!coin) {
        console.log(
          "Insufficient balance to place the bet and cover the gas fee."
        );
        return;
      }
       if (Number(coin.balance)>amount*1e9){
         const bigIntAmount = BigInt(amount * 1e9); // Convert to the smallest unit if needed

         // Split the coin
         const [splitCoin] = tx.splitCoins(tx.gas, [
           bigIntAmount,
         ]);
         

         // Create the Move call
         tx.moveCall({
           target:
             `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::place_new_bet`,
           arguments: [
             tx.object(bet_id), // BetService ID
             tx.pure(bcs.string().serialize(choice)),
             tx.object(splitCoin), // Bet amount as u64
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
       } 
    
  }
  catch (error) {
      console.error("Error placing new bet:", error);
    }

        
        
      }

      

  

  return {
    isSuccess,
    isPending,
    placeNewBet,
  };
};