module bet_contract::service{
    use sui::balance::{Self,Balance};
    use sui::object_table::{Self, ObjectTable};
    use sui::dynamic_field as df;
    use sui::coin::{Self,Coin};
    use sui::sui::SUI;
    use std::string::String;
    use bet_contract:: bet:: {Self,Bet};
    


    //const ERROR_NOT_FOUND:u64 =1;
    const ERROR_NOT_BET_OWNER:u64 =2;
    const ERROR_INVALID_CHOICE:u64 =3;

    public enum BetStatus has store,drop,copy{
        Pending,
        Resolved,
        Canceled,
    }

    public struct BetService has key, store {
        id: UID,
        home: String,
        away: String,
        result: String,
        status: BetStatus,
        pot_balance: Balance<SUI>,
        service_fee_pot_balance:Balance<SUI>,
        total_winning_pot:u64,
        total_lossing_pot:u64,
        manager_tax_fee:u64,
        bet_count:u64
        
    }

    public struct BetAdmin has key,store{
        id:UID,
        bet_id:ID
    }
    #[allow(lint(self_transfer))]
    public (package) fun create_bet_service(home:String,away:String,result:String,fee:u64,ctx:&mut TxContext,):ID{
        
        let new_bet_uid =object::new(ctx);
        let new_bet_id =object::uid_to_inner(&new_bet_uid);

        let new_bet_service =BetService{
            id:new_bet_uid,
            home,
            away,
            result: result,
            status: BetStatus::Pending,
            pot_balance: balance::zero(),
            service_fee_pot_balance: balance::zero(),
            total_winning_pot:0,
            total_lossing_pot:0,
            manager_tax_fee:fee,
            bet_count:0
            
        };

        let admin =BetAdmin{
            id:object::new(ctx),
            bet_id:new_bet_service.id.to_inner()

        };

        transfer::public_transfer(admin,tx_context::sender(ctx));

        transfer::share_object(new_bet_service);
          new_bet_id
    }

    public fun place_new_bet(bet:&mut BetService,choice: String,mut amount:Coin<SUI>,ctx:&mut TxContext):ID{
      let bet_id =object::uid_to_inner(&bet.id);
      
      let amount_value =coin::value(&amount);
      let fee = (amount_value / 100)* bet.manager_tax_fee;

      let new_betting_amount =amount_value-fee;

      let fee_coin = coin::split(&mut amount, fee,ctx);
      let new_fee =coin::into_balance(fee_coin);


      //Add fee to manager fee_pot
      balance::join(&mut bet.service_fee_pot_balance, new_fee);

      let balance_amount =coin::into_balance(amount);

      
      // add betting amount into betting pot 
      balance::join(&mut bet.pot_balance,balance_amount);
      
      
      let new_bet =bet::place_bet(bet_id,choice,new_betting_amount,ctx);

      bet.bet_count=bet.bet_count +1;


      

      
      df::add(&mut bet.id,bet.bet_count,new_bet);

      bet_id
        
        }

    public fun update_bet_with_result(_:&BetAdmin,bet:&mut BetService,result:String){
        bet.result =result;
        bet.status =BetStatus::Resolved;

        let bet_pot =balance::value(&bet.pot_balance);
        let winning =calculate_total_winning_amount(bet);
        
        bet.total_winning_pot=winning;

        bet.total_lossing_pot =bet_pot-winning

    }
    #[allow(lint(self_transfer))]
    public fun claim_winning(service:&mut BetService,bet:&Bet,ctx:&mut TxContext){
        let claimer =tx_context::sender(ctx);
        let result =service.result;
        let (bet_id,bet_amount,choice,owner)=bet::get_bet_info(bet);
        let total_pot =balance::value(&service.pot_balance);
        assert!(bet_id == service.id.to_inner());
        assert!(owner == claimer,ERROR_NOT_BET_OWNER);
        assert!(choice == result,ERROR_INVALID_CHOICE);

        let share = (bet_amount * total_pot) /service.total_winning_pot;

        let winnings = coin::take(&mut service.pot_balance, share, ctx);
        transfer::public_transfer(winnings, claimer);



    }

    fun calculate_total_winning_amount(bet: &BetService): u64 {
    let mut total = 0;
    let bettors_count = bet.bet_count;
    let result_choice = bet.result;

    let mut i = 0;
    while (i < bettors_count) {
        let bet = df::borrow(&bet.id, i+1);
        let bet_amount=bet::get_bet_amount(bet,result_choice);
        total=total+bet_amount;

        i = i + 1;
    };

    total
}
#[allow(lint(self_transfer))]
public(package) fun take_manager_fee(bet:&mut BetService,ctx:&mut TxContext){
    let amount =balance::value(&bet.pot_balance);

    let fee = coin::take(&mut bet.pot_balance,amount,ctx);

    transfer::public_transfer(fee,tx_context::sender(ctx))
   
}



}
