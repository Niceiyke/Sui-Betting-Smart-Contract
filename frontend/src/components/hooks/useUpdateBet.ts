import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";

interface UseUpdateBetProps {
  betId: string;
  result: string;
}

interface UseUpdateBetResult {
  isSuccess: boolean;
  isPending: boolean;
  updateBet: () => Promise<void>;
}

const BET_ADMIN_STRUCT_TYPE = `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::BetAdmin`;

export const useUpdateBet = ({
  betId,
  result,
}: UseUpdateBetProps): UseUpdateBetResult => {
  const [adminId, setAdminId] = useState<string>("");
  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  useEffect(() => {
    if (account?.address) {
      fetchAdminId(account.address);
    }
  }, [account]);

  const fetchAdminId = async (address: string): Promise<void> => {
    try {
      const response = await client.getOwnedObjects({
        owner: address,
        filter: { StructType: BET_ADMIN_STRUCT_TYPE },
        options: { showType: true, showContent: true },
      });

      const matchingAdmin = response.data.find(
        (item) => item.data?.content?.fields?.bet_id === betId
      );

      setAdminId(matchingAdmin?.data?.objectId || "");
    } catch (error) {
      console.error("Error fetching admin ID:", error);
      setAdminId("");
    }
  };

  const updateBet = async (): Promise<void> => {
    if (!account) {
      console.error("Wallet not connected");
      return;
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::service::update_bet_with_result`,
      arguments: [
        tx.object(adminId),
        tx.object(betId),
        tx.pure(bcs.string().serialize(result)),
      ],
    });

    try {
      await signAndExecute(
        { transaction: tx },
        {
          onSuccess: async ({ digest }) => {
            const { effects, objectChanges } =
              await suiClient.waitForTransaction({
                digest,
                options: { showEffects: true, showObjectChanges: true },
              });

            console.log("Transaction successful!", effects, objectChanges);
            return effects?.sharedObjects?.[0]?.objectId;
          },
          onError: (error) => {
            console.error("Transaction failed", error);
          },
        }
      );
    } catch (error) {
      console.error("Error in signAndExecute:", error);
    }
  };

  return { isSuccess, isPending, updateBet };
};
