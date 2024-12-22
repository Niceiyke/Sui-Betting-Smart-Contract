import {Transaction} from "@mysten/sui/transactions"
import { bcs } from "@mysten/bcs";
import { useSignAndExecuteTransaction, useSuiClient,} from "@mysten/dapp-kit";
import DEPLOYED_OBJECTS from "../../../src/components/constants/deployed_objects.json";
export const useBetServiceCreation =()=>{
      const suiClient = useSuiClient();
      const {
        mutate: signAndExecute,
        isSuccess,
        isPending,
      } = useSignAndExecuteTransaction();





const createNewService = async (home: string, away: string) => {
  const tx = new Transaction();

  const result:string =''

  tx.moveCall({
    target: `${DEPLOYED_OBJECTS.PACKAGE_ID}::manager::add_bet`,
    arguments: [
      tx.object(`${DEPLOYED_OBJECTS.BET_MANAGER_ID}`),
      tx.pure(bcs.string().serialize(home)),
      tx.pure(bcs.string().serialize(away)),
      tx.pure(bcs.string().serialize(result)),
    ],
  });

  signAndExecute(
    {
      transaction: tx,
    },
    {
      onSuccess: async ({ digest }) => {
        const { effects, objectChanges } = await suiClient.waitForTransaction({
          digest,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        console.log(objectChanges, effects);

        return effects?.created[0]?.reference.objectId;
      },

      onError: (error) => {
        console.error("Transaction failed", error);
      },
    }
  );
};

return{
    isSuccess,
    isPending,
    createNewService

}
}