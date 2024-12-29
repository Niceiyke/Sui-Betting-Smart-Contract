module bet_contract::manager {
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use bet_contract::service;
    use std::string::String;
    use sui::dynamic_field as df;

    /// The main structure representing the BetManager
    public struct BetManager has key, store {
        id: UID,
        pot: Balance<SUI>,
        fee_percentage: u64,
        pot_fee_percentage: u64
    }

    /// The structure representing the BetManager owner
    public struct BetManagerOwner has key {
        id: UID
    }

    /// Initializes the BetManager and BetManagerOwner
   fun init(ctx: &mut TxContext) {
        let bet_manager = BetManager {
            id: object::new(ctx),
            pot: balance::zero(),
            fee_percentage: 10,
            pot_fee_percentage: 20
        };

        transfer::transfer(
            BetManagerOwner { id: object::new(ctx) },
            tx_context::sender(ctx),
        );

        transfer::transfer(bet_manager, tx_context::sender(ctx));
    }

    /// Adds a new bet to the manager
    public fun add_bet(
        manager: &mut BetManager,
        home: String,
        away: String,
        start_time: u64,
        ctx: &mut TxContext
    ): ID {
        let fee = manager.fee_percentage;
        let bet_id = service::create_bet_service(home, away, fee, start_time, ctx);
        register_bet_with_manager(manager, bet_id);
        bet_id
    }

    /// Registers a bet with the manager
    fun register_bet_with_manager(db: &mut BetManager, service_id: ID) {
        df::add(&mut db.id, service_id, service_id);
    }

    /// Collects the manager fee from a bet
    public fun collect_manager_fee(bet: &mut service::BetService, ctx: &mut TxContext) {
        service::take_manager_fee(bet, ctx);
    }
}