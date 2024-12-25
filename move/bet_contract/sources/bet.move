module bet_contract::bet{
    use std::string::String;
    
    public enum BetCoices has store,drop,copy{
        Home,
        Away,
        Draw,
    }

    public struct Bet has key,store{
        id:UID,
        owner:address,
        bet_service_id:ID,
        choice: String,
        amount:u64,
   


    }

    public struct BetRecipt has key,store{
        id:UID,
        owner:address,
        bet_service_id:ID,
        choice: String,
        amount:u64,
        claimed:bool
   


    }
    #[allow(lint(self_transfer))]
    public (package) fun place_bet(bet_service_id:ID,choice:String,amount:u64, ctx:&mut TxContext):Bet{   
        //todo add assert 
        let new_bet =Bet{
            id:object::new(ctx),
            owner:tx_context::sender(ctx),
            bet_service_id,
            choice,
            amount,
            
        };

        let recipt=BetRecipt{
            id:object::new(ctx),
            owner:tx_context::sender(ctx),
            bet_service_id,
            choice,
            amount,
            claimed:false
        };
        
        transfer::public_transfer(recipt,tx_context::sender(ctx));

        new_bet
    }

    public (package) fun update_bet(bet:&mut Bet,choice:String,){
        bet.choice=choice;
        
       
    }

    public fun get_id(bet: &Bet): ID {
        bet.id.to_inner()
    }

    public(package) fun get_bet_amount(bet:&Bet,result:String):u64{
        let mut total = 0;

     
        if (bet.choice == result) {
            total = total + bet.amount;
        };
        total


    }

    public(package) fun update_recipt_claim(recipt:&mut BetRecipt):bool{

        recipt.claimed =true;
        true
    }

    public(package) fun delete_recipt(recipt: BetRecipt):bool{

        let BetRecipt{id,owner:_,bet_service_id:_,choice:_,amount:_,claimed:_}=recipt;
        object::delete(id);
        true
    }

    public (package) fun get_bet_info(bet:&BetRecipt):(ID,u64,String,address,bool){
        let bet_id=bet.bet_service_id;
        let bet_amount= bet.amount;
        let choice =bet.choice;
        let owner =bet.owner;
        let claimed =bet.claimed;
        (bet_id,bet_amount,choice,owner,claimed)
    }
}