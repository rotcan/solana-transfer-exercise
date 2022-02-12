Project done as a part of an exercise

It is a simple application where are using smart contract to transfer lamports from one account to another.

There is a fixed admin account which block another user. Then lamports cannot be transferred to that user.

For testing, few keypairs are already added into the project

To build rust code
run in program folder:
cargo build-bpf 
//to get the same program id everytime on deploy use program-id and mention keypair 
solana program deploy target/deploy/program.so --program-id=program-keypair.json --max-len=200000 

Few limitations:
The admin has to create an account in program before transfer is done to other accounts.
One account can be blocked at a time.
To unblock an account, another account needs to be blocked.


