module bet_contract::bet {
    use std::string::String;


    // Enum for bet choices
    public enum BetChoice has store, drop, copy {
        Home,
        Away,
        Draw
    }

    // Main Bet struct
    public struct Bet has key, store {
        id: UID,
        owner: address,
        bet_service_id: ID,
        choice: String,
        amount: u64,
        claimed: bool
    }

    // BetReceipt struct for tracking placed bets
    public struct BetReceipt has key, store {
        id: UID,
        owner: address,
        bet_service_id: ID,
        choice: String,
        amount: u64,
        claimed: bool
    }

    // Place a new bet and create a receipt
    #[allow(lint(self_transfer))]
    public(package) fun place_bet(
        bet_service_id: ID,
        choice: String,
        amount: u64,
        ctx: &mut TxContext
    ): Bet {
        // TODO: Add assertions for input validation

        let bet = Bet {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            bet_service_id,
            choice,
            amount,
            claimed: false
        };

        let receipt = BetReceipt {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            bet_service_id,
            choice,
            amount,
            claimed: false
        };

        transfer::public_transfer(receipt, tx_context::sender(ctx));

        bet
    }

    // Update the choice of an existing bet
    public(package) fun update_bet_choice(bet: &mut Bet, new_choice: String) {
        bet.choice = new_choice;
    }

    // Get the ID of a bet
    public fun get_bet_id(bet: &Bet): ID {
        object::uid_to_inner(&bet.id)
    }

    // Calculate the amount won based on the bet result
    public(package) fun calculate_bet_payout(bet: &Bet, result: String): u64 {
        if (bet.choice == result) {
            bet.amount
        } else {
            0
        }
    }

    // Mark a bet receipt as claimed
    public(package) fun mark_receipt_as_claimed(receipt: &mut BetReceipt): bool {
        receipt.claimed = true;
        true
    }

    // Delete a bet receipt
    public(package) fun delete_bet(bet:Bet): bool {
        let Bet { id, owner: _, bet_service_id: _, choice: _, amount: _, claimed: _ } = bet;
        object::delete(id);
        true
    }

    // Get detailed information about a bet receipt
    public(package) fun get_receipt_info(receipt: &BetReceipt): (ID, u64, String, address, bool) {
        (
            receipt.bet_service_id,
            receipt.amount,
            receipt.choice,
            receipt.owner,
            receipt.claimed
        )
    }
}
