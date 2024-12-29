import { Transaction } from "@mysten/sui/transactions";
import {
  getFullnodeUrl,
  SuiClient,
  SuiObjectResponse,
} from "@mysten/sui/client";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

interface BetReceipt {
  betServiceId: string;
  objectId: string;
}

export const useClaimWinning = () => {
  const [receipts, setReceipts] = useState<SuiObjectResponse[]>([]);
  const [betResult,setBetResult]=useState<string>('')
  const suiClient = useSuiClient();
  const [betId,setBetID]=useState('')
  const {
    mutate: signAndExecuteTransaction,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const suiClientInstance = new SuiClient({ url: getFullnodeUrl("testnet") });

  useEffect(() => {
    if (account?.address) {
      fetchReceipts(account.address);
      fetchBetResult(betId)
    }
  }, [betId]);

  const fetchBetResult = async (betId: string): Promise<void> => {
    try {
      const response = await suiClientInstance.getObject({
        id: betId,
        options: {
          showType: true,
          showContent: true,
        },
      });
      setBetResult(response.data?.content?.fields.result);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setReceipts([]);
    }
  };

  const fetchReceipts = async (address: string): Promise<void> => {
    console.log("called",address)
    try {
      const response = await suiClientInstance.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${DEPLOYED_OBJECTS.PACKAGE_ID}::bet::BetReceipt`,
        },
        options: {
          showType: true,
          showContent: true,
        },
      });


      setReceipts(response.data);
      
    } catch (error) {
      console.error("Error fetching receipts:", error);
      setReceipts([]);
    }
  };

  const claimWinning = async (betId: string): Promise<void> => {
    setBetID(betId)

    try {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      const receipt = findReceiptByBetId(betId);
      console.log(betId,receipt)
      if (!receipt) {
        throw new Error("You have no winning to claim");
      }

      const transaction = createClaimTransaction(betId, receipt.objectId);
      await executeClaimTransaction(transaction);
    } catch (error) {
      console.error("Error claiming winnings:", error);
    }
  };

  const findReceiptByBetId = (betId: string): BetReceipt | undefined => {
    return receipts.find((receipt) => {
      const content = receipt.data?.content;
      console.log("content",content )
      return (
        content?.fields?.bet_service_id === betId &&
        content?.fields?.choice === betResult &&
        content?.fields?.claimed === false
      );
    })?.data as BetReceipt | undefined;
  };

  const createClaimTransaction = (
    betId: string,
    receiptId: string
  ): Transaction => {
    const transaction = new Transaction();
    transaction.moveCall({
      target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::claim_winning`,
      arguments: [transaction.object(betId), transaction.object(receiptId)],
    });
    return transaction;
  };

  const executeClaimTransaction = async (
    transaction: Transaction
  ): Promise<void> => {
    signAndExecuteTransaction(
      { transaction },
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
  };

  return { isSuccess, isPending, claimWinning };
};
