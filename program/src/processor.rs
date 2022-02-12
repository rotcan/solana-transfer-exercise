use crate::error::TransferErrorType;
use crate::instruction::TransferInstruction;
use crate::state::{BlockAccount, ADMIN_KEY_BASE58};
use borsh::{BorshDeserialize, BorshSerialize};
use rust_base58::FromBase58;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};
use std::str;
pub struct Processor {}

pub fn assert_with_msg(statement: bool, err: ProgramError, msg: &str) -> ProgramResult {
    if !statement {
        msg!(msg);
        Err(err)
    } else {
        Ok(())
    }
}

pub fn throw_err(err: ProgramError, msg: &str) -> ProgramResult {
    msg!(msg);
    Err(err)
}

impl Processor {
    pub fn process_instruction(
        _program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = TransferInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        // match instruction {
        //     CounterInstruction::Increment => {
        //         msg!("Instruction: Increment");
        //         let accounts_iter = &mut accounts.iter();
        //         let counter_ai = next_account_info(accounts_iter)?;
        //         let mut counter = Counter::try_from_slice(&counter_ai.data.borrow())?;
        //         counter.count += 1;
        //         msg!("Updating count {}", counter.count);
        //         counter.serialize(&mut *counter_ai.data.borrow_mut())?;
        //     }
        // }
        match instruction {
            TransferInstruction::Block { account_key } => {
                //block user
                //check if user is admin then add to block
                let accounts_iter = &mut accounts.iter();
                let admin_ai = next_account_info(accounts_iter)?;
                let xs: [u8; 32] = [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0,
                ];

                let mut block_account = match BlockAccount::try_from_slice(&admin_ai.data.borrow())
                {
                    Ok(data) => data,
                    Err(_) => {
                        //panic!("Block account should be a default pubkey or account pubkey");
                        BlockAccount {
                            account_key: Pubkey::new(&xs),
                        }
                    }
                };

                assert_with_msg(
                    admin_ai.owner == _program_id,
                    TransferErrorType::UnknownProgram.into(),
                    "Unknown Program Attempting to edit the account",
                )?;

                let admin_pub_str = String::from(ADMIN_KEY_BASE58);
                let admin_u8 = admin_pub_str.from_base58().unwrap();
                let admin_pub_key = Pubkey::new(&admin_u8[..]);

                let account_public_key =
                    Pubkey::create_with_seed(&admin_pub_key, "1", &_program_id).unwrap();

                msg!("{:?}", admin_ai.key.to_bytes());
                msg!("{:?}", admin_pub_key.to_bytes());
                assert_with_msg(
                    *admin_ai.key == account_public_key,
                    TransferErrorType::AccountNotAllowed.into(),
                    "Non Admin attempting to edit the account",
                )?;

                block_account.account_key = account_key;
                //msg!("Updating blocked account {}", account_key);
                block_account.serialize(&mut *admin_ai.data.borrow_mut())?
                //block_account.serialize(&mut &mut admin_ai.data.borrow_mut()[..])?;
                //block_account.save(admin_ai)?
            }
            TransferInstruction::Transfer { amount } => {
                msg!("Instruction: Transfer");

                let accounts_iter = &mut accounts.iter();

                let from_ai = next_account_info(accounts_iter)?;
                let to_ai = next_account_info(accounts_iter)?;
                let block_ai = next_account_info(accounts_iter)?;
                let system_program = next_account_info(accounts_iter)?;

                let block_account = match BlockAccount::try_from_slice(&block_ai.data.borrow()) {
                    Ok(data) => data,
                    Err(_) => {
                        panic!("Block account should be a default pubkey or account pubkey");
                    }
                };

                //msg!(block_account.account_key.into());
                assert_with_msg(
                    block_account.account_key != *to_ai.key,
                    TransferErrorType::AccountBlocked.into(),
                    "Attempted to transfer money to blocked account",
                )?;

                // assert_with_msg(
                //     from_ai.lamports() > to_ai.lamports(),
                //     TransferErrorType::NotEnoughSol.into(),
                //     "Not enough sol to transfer",
                // )?;
                invoke(
                    &system_instruction::transfer(from_ai.key, to_ai.key, amount),
                    &[from_ai.clone(), to_ai.clone(), system_program.clone()],
                )?;
            }
        }
        Ok(())
    }
}
