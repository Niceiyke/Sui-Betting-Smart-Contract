import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { SuiMoveObject, SuiObjectData } from "@mysten/sui/client";
// Initialize the provider
const provider = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

/*
// Function to fetch all bets
async function fetchAllBets() {
  try {
    // Query all objects of the specified type
    const allObjects = await provider.getDynamicFields({
      parentId:
        "0xf2914e33947498589288b13c07ce8c21c05a6d67751555d1011c659ebf2058de",
    });
    //console.log(allObjects.data[0])

    // Fetch detailed data for each Bet object
    const bets = await Promise.all(
      allObjects.data.map(async (obj) => {
        console.log(obj.objectId);
        const details = await provider.getObject({
        id:obj.objectId ,
        options: {
          showContent: true,
        },
      });
      console.log(details.data?.content?.fields.value);
      let match = {
        id: (
          (details.data?.content?.fields.value as SuiMoveObject).fields as {
            id: { id: string };
          }
        ).id.id,

        owner: (
          (details.data?.content?.fields.value as SuiMoveObject).fields as {
            owner: { owner: string };
          }
        ).owner,
        choice: (
          (details.data?.content?.fields.value as SuiMoveObject).fields as {
            choice: { choice: string };
          }
        ).choice,
        
      };

      console.log(match)
   
        return details;
      })
    );

    return bets;
  } catch (error) {
    console.error("Error fetching bets:", error);
    return [];
  }
}

// Call the function
fetchAllBets().then((bets) => {
  //console.log("All Bets:", bets);
});

*/

const getBet = async (BetId: string, owner: string, betResult:string) => {
  const allObjects = await provider.getDynamicFields({
    parentId: BetId,
  });
  // Fetch detailed data for each Bet object
  const bets = await Promise.all(
    allObjects.data.map(async (obj) => {
      //console.log(obj.objectId);
      const details = await provider.getObject({
        id: obj.objectId,
        options: {
          showContent: true,
        },
      });
      console.log(details?.data?.content.fields.value.fields);
      if (
        details?.data?.content.fields.value.fields.owner == owner &&
        details?.data?.content.fields.value.fields.choice == betResult
      ) {
        return details?.data?.content.fields.value.fields.bet_service_id;
      }
    })
  );

  return bets.filter((c)=>                                                                   c !=undefined);
};

console.log(
  await getBet(
    "0xe857ac54144338f8b3d2e592566a20251ed5ccd0096a49625981287a9f81c968",
    "0xa1502fc893c81103e493ed72349dc7593cad55bd551ed949f6fc7eabf51ccb9a",
    "Crystal Palace"
  )
);


