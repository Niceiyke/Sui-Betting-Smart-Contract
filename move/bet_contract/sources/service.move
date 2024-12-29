module bet_contract::service {
    use sui::balance::{Self, Balance};
    use sui::coin::{Self, Coin};
    use sui::clock::Clock;
    use sui::dynamic_field as df;
    use sui::sui::SUI;
    use std::string::String;
    use std::string::utf8;
    use bet_contract::bet::{Self, BetReceipt,Bet};

    // Error codes
    const E_BET_NOT_RESOLVED: u64 = 1;
    const E_NOT_BET_OWNER: u64 = 2;
    const E_INVALID_CHOICE: u64 = 3;
    const E_ALREADY_CLAIMED_WINNING: u64 = 4;
    const E_MATCH_ALREADY_STARTED: u64 = 5;

    // Bet status enum
    public enum BetStatus has store, drop, copy {
        Pending,
        Resolved,
        Canceled,
        Finalized
    }

    // BetService struct
    public struct BetService has key, store {
        id: UID,
        home: String,
        away: String,
        result: String,
        status: BetStatus,
        pot_balance: Balance<SUI>,
        service_fee_pot_balance: Balance<SUI>,
        total_winning_pot: u64,
        total_lossing_pot: u64,
        manager_tax_fee: u64,
        bet_count: u64,
        start_time: u64
    }

    // BetAdmin struct
    public struct BetAdmin has key, store {
        id: UID,
        bet_id: ID
    }

    // ===== Initialization =====

    /// Creates a new BetService with the given parameters.
    /// 
    /// # Arguments
    /// * `home` - The name of the home team.
    /// * `away` - The name of the away team.
    /// * `result` - The initial result of the bet (can be updated later).
    /// * `fee` - The manager tax fee percentage.
    /// * `start_time` - The start time of the bet in milliseconds.
    /// * `ctx` - The transaction context.
    ///
    /// # Returns
    /// The ID of the newly created BetService.
   #[allow(lint(self_transfer))]
    public(package) fun create_bet_service(
        home: String,
        away: String,
        fee: u64,
        start_time: u64,
        ctx: &mut TxContext
    ): ID {
        let bet_service = BetService {
            id: object::new(ctx),
            home,
            away,
            result:utf8(b""),
            status: BetStatus::Pending,
            pot_balance: balance::zero(),
            service_fee_pot_balance: balance::zero(),
            total_winning_pot: 0,
            total_lossing_pot: 0,
            manager_tax_fee: fee,
            bet_count: 0,
            start_time
        };

        let bet_id = object::uid_to_inner(&bet_service.id);
        let admin = BetAdmin {
            id: object::new(ctx),
            bet_id
        };

        transfer::public_transfer(admin, tx_context::sender(ctx));
        transfer::share_object(bet_service);

        bet_id
    }

    // ===== Bet Operations =====

    /// Places a new bet on the given BetService.
    /// 
    /// # Arguments
    /// * `bet_service` - The BetService to place the bet on.
    /// * `choice` - The user's choice for the bet.
    /// * `amount` - The amount of SUI to bet.
    /// * `clock` - The current clock to check the bet's start time.
    /// * `ctx` - The transaction context.
    ///
    /// # Returns
    /// The ID of the BetService.
    public fun place_new_bet(
        bet_service: &mut BetService,
        choice: String,
        mut amount: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ): ID {
        assert!(bet_service.start_time > clock.timestamp_ms(), E_MATCH_ALREADY_STARTED);

        let bet_id = object::uid_to_inner(&bet_service.id);
        let amount_value = coin::value(&amount);
        let fee = (amount_value / 100) * bet_service.manager_tax_fee;
        let betting_amount = amount_value - fee;

        let fee_coin = coin::split( &mut amount, fee, ctx);
        let fee_balance = coin::into_balance(fee_coin);
        balance::join(&mut bet_service.service_fee_pot_balance, fee_balance);

        let betting_balance = coin::into_balance(amount);
        balance::join(&mut bet_service.pot_balance, betting_balance);

        let new_bet = bet::place_bet(bet_id, choice, betting_amount, ctx);
        bet_service.bet_count = bet_service.bet_count + 1;

        df::add(&mut bet_service.id, bet_service.bet_count, new_bet);

        bet_id
    }

    /// Updates the BetService with the final result.
    /// 
    /// # Arguments
    /// * `admin` - The BetAdmin who is authorized to update the result.
    /// * `bet_service` - The BetService to update.
    /// * `result` - The final result of the bet.
    public fun update_bet_with_result(
        admin: &BetAdmin,
        bet_service: &mut BetService,
        result: String
    ) {
        assert!(admin.bet_id == object::uid_to_inner(&bet_service.id), 0);

        bet_service.result = result;
        bet_service.status = BetStatus::Resolved;

        let bet_pot = balance::value(&bet_service.pot_balance);
        let winning = calculate_total_winning_amount(bet_service);
        
        bet_service.total_winning_pot = winning;
        bet_service.total_lossing_pot = bet_pot - winning;
    }

    /// Claims the winnings for a bet.
    /// 
    /// # Arguments
    /// * `bet_service` - The BetService from which to claim winnings.
    /// * `receipt` - The BetReceipt for the bet.
    /// * `ctx` - The transaction context.
    #[allow(lint(self_transfer))]
    public fun claim_winning(
        bet_service: &mut BetService,
        receipt: &mut BetReceipt,
        bet: Bet,
        ctx: &mut TxContext
    ) {
        assert!(bet_service.status == BetStatus::Resolved, E_BET_NOT_RESOLVED);

        let claimer = tx_context::sender(ctx);
        let result = &bet_service.result;
        
        let (bet_id, bet_amount, choice, owner, claimed) = bet::get_receipt_info(receipt);
        
        assert!(bet_id == object::uid_to_inner(&bet_service.id), 0);
        assert!(owner == claimer, E_NOT_BET_OWNER);
        assert!(choice == *result, E_INVALID_CHOICE);
        assert!(!claimed, E_ALREADY_CLAIMED_WINNING);

        let total_pot = balance::value(&bet_service.pot_balance);
        let share = (bet_amount as u128) * (total_pot as u128) / (bet_service.total_winning_pot as u128);

        let winnings = coin::take(&mut bet_service.pot_balance, (share as u64), ctx);
        let claimed = bet::mark_receipt_as_claimed(receipt);

        if (claimed) {
            if (balance::value(&bet_service.pot_balance) == 0) {
                bet_service.status = BetStatus::Finalized;
            };
            bet::delete_bet(bet);
            transfer::public_transfer(winnings, claimer);
        } else {
            abort 0
        }
    }

    // ===== Helper Functions =====

    /// Calculates the total winning amount for the BetService.
    /// 
    /// # Arguments
    /// * `bet_service` - The BetService to calculate winnings for.
    ///
    /// # Returns
    /// The total winning amount.
    fun calculate_total_winning_amount(bet_service: &BetService): u64 {
        let mut total = 0;
        let bettors_count = bet_service.bet_count;
        let result_choice = bet_service.result;

        let mut i = 1;
        while (i <= bettors_count) {
            let bet = df::borrow(&bet_service.id, i);
            total = total + bet::calculate_bet_payout(bet, result_choice);
            i = i + 1;
        };

        total
    }

    /// Takes the manager fee from the BetService.
    /// 
    /// # Arguments
    /// * `bet_service` - The BetService from which to take the manager fee.
    /// * `ctx` - The transaction context.
    #[allow(lint(self_transfer))]
    public(package) fun take_manager_fee(bet_service: &mut BetService, ctx: &mut TxContext) {
        let amount = balance::value(&bet_service.pot_balance);
        let fee = coin::take(&mut bet_service.pot_balance, amount, ctx);
        transfer::public_transfer(fee, tx_context::sender(ctx));
    }
}