import "dotenv/config"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { fromBase64 } from "@mysten/sui/utils"
import { SuiClient } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import path, { dirname } from "path"
import { writeFileSync } from "fs"
import { execSync } from "child_process"
import { fileURLToPath } from "url"


const priv_key = process.env.PRIVATE_KEY

if (!priv_key) {
    console.log("Error:Private Key not set in .env")
    process.exit(1)
}

const keypair = Ed25519Keypair.fromSecretKey(fromBase64(priv_key).slice(1))
const client = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" })

const path_to_script = `${dirname(fileURLToPath(import.meta.url))}`
const path_to_contract = path.join(path_to_script, "../../move/bet_contract")

console.log("Building contract ....")
const { dependencies, modules } = JSON.parse(execSync(
    `sui move build --dump-bytecode-as-base64 --path ${path_to_contract}`, { encoding: "utf-8" }
))

console.log("Deploying contract ....")

console.log(`Deploying from  ${keypair.toSuiAddress()}`)

const deploy_trx = new Transaction();
const [upgrade_cap] = deploy_trx.publish({ modules, dependencies });
import { fromHex } from '@mysten/sui/utils';

// Convert the address string to a Uint8Array
const addressBytes = fromHex('385bbbc4e5befaa96d005c0f203d4db40e6aa796c7fa9983be25c89ec878844b');

// Use the `pure` method with the correct type
const serializedAddress = deploy_trx.pure(addressBytes);

deploy_trx.transferObjects([upgrade_cap], serializedAddress);

// Import necessary modules


const { objectChanges, balanceChanges } = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: deploy_trx,
    options: {
        showBalanceChanges: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showInput: false,
        showRawEffects: false,
        showRawInput: false
    }
});


console.log(balanceChanges, objectChanges)

if (!balanceChanges) {
    console.log("Error: Balance changes was undefined")
    process.exit(1)
}




function parse_amount(amount: string): number {
    return parseInt(amount) / 1000000000
}

console.log(`spent ${Math.abs(parse_amount(balanceChanges[0].amount))} sui on deploy`)

const published_change = objectChanges?.find(change => change.type == "published")
const bet_manager_id = objectChanges
  ?.filter((change) => change.type == "created")
  ?.filter((obj) => !obj.objectType.includes("::BetManagerOwner"))[0];
const bet_manager_cap = objectChanges
  ?.filter((change) => change.type == "created")
  ?.filter((obj) => obj.objectType.includes("::BetManagerOwner"))[0];

if (!published_change) {
    console.log("Error: Did not find correct published change")
    process.exit(1)
}


const deployes_address = {
    PACKAGE_ID: published_change?.packageId,
    BET_MANAGER_ID: bet_manager_id?.objectId,
    BET_MANAGER_CAP_ID: bet_manager_cap?.objectId

}

const deployed_path = path.join(path_to_script, "../src/components/constants/deployed_objects.json")

writeFileSync(deployed_path, JSON.stringify(deployes_address, null, 4))


