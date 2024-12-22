import React, { useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";

interface PlaceBetProps {
  betServiceId: string;
  moduleName: string;
  packageId: string;
  choice: string | null;
  amount: number;
}

const PlaceBet: React.FC<PlaceBetProps> = ({
  betServiceId,
  moduleName,
  packageId,
  choice,
  amount,
}) => {
  const account = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handlePlaceBet = async () => {
    if (!account) {
      setStatus("Please connect your wallet.");
      return;
    }

    if (!choice) {
      setStatus("Please select a bet choice.");
      return;
    }

    if (amount <= 0) {
      setStatus("Please enter a valid bet amount.");
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${moduleName}::place_new_bet`,
        arguments: [
          tx.object(betServiceId), // BetService ID
          tx.pure(bcs.string().serialize(choice)), // Bet choice
          tx.pure(bcs.u64().serialize(amount)), // Amount to bet
        ],
      });

      const response = await account.signAndExecuteTransactionBlock({
        transactionBlock: tx,
      });

      if (response?.effects?.status?.status === "success") {
        setStatus("Bet placed successfully!");
      } else {
        setStatus("Failed to place bet.");
      }
    } catch (error) {
      console.error(error);
      setStatus("An error occurred while placing the bet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePlaceBet}
        disabled={loading || !choice || amount <= 0}
        className={`w-full px-4 py-2 rounded-md text-white ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-800"
        }`}
      >
        {loading ? "Placing Bet..." : "Place Bet"}
      </button>
      {status && (
        <p className="mt-4 text-center text-sm text-red-600">{status}</p>
      )}
    </div>
  );
};

export default PlaceBet;
