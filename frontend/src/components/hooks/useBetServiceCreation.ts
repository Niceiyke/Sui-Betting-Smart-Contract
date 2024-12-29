import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/bcs";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";

// Define the interface for the bet service creation hook
interface BetServiceCreationHook {
  isSuccess: boolean;
  isPending: boolean;
  createNewService: (
    home: string,
    away: string,
    startTime: number
  ) => Promise<string | undefined>;
}

/**
 * Custom hook for creating a new bet service
 * @returns {BetServiceCreationHook} An object containing the state and function to create a new service
 */
export const useBetServiceCreation = (): BetServiceCreationHook => {
  const suiClient = useSuiClient();
  const {
    mutate: signAndExecute,
    isSuccess,
    isPending,
  } = useSignAndExecuteTransaction();

  /**
   * Creates a new bet service
   * @param {string} home - The home team name
   * @param {string} away - The away team name
   * @param {number} startTime - The start time of the bet
   * @returns {Promise<string | undefined>} The object ID of the created service, or undefined if creation fails
   */
  const createNewService = async (
    home: string,
    away: string,
    startTime: number
  ): Promise<string | undefined> => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::manager::add_bet`,
      arguments: [
        tx.object(DEPLOYED_OBJECTS.BET_MANAGER_ID),
        tx.pure(bcs.string().serialize(home)),
        tx.pure(bcs.string().serialize(away)),
        tx.pure.u64(startTime),
      ],
    });

    return new Promise((resolve) => {
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

            console.log("Transaction result:", { objectChanges, effects });

            resolve(effects?.created[0]?.reference.objectId);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            resolve(undefined);
          },
        }
      );
    });
  };

  return {
    isSuccess,
    isPending,
    createNewService,
  };
};
