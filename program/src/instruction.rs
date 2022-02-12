use crate::error::TransferErrorType;
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{program_error::ProgramError, pubkey::Pubkey};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum CounterInstruction {
    Increment, // unsigned byte
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub enum TransferInstruction {
    Transfer { amount: u64 },
    Block { account_key: Pubkey },
}

impl TransferInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (tag, rest) = input
            .split_first()
            .ok_or(TransferErrorType::NotImplemented)?;

        Ok(match tag {
            0 => Self::Transfer {
                amount: Self::unpack_amount(rest)?,
            },
            1 => Self::Block {
                account_key: Pubkey::new(rest),
            },
            _ => return Err(TransferErrorType::NotImplemented.into()),
        })
    }

    fn unpack_amount(input: &[u8]) -> Result<u64, ProgramError> {
        let amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(TransferErrorType::NotImplemented)?;
        Ok(amount)
    }

    // fn unpack_key(input: &[u8]) -> Result<Pubkey, ProgramError> {
    //     if input.len() >= 32 {
    //         let (key, _) = input.split_at(32);
    //         let pk = Pubkey::new(key);
    //         Ok(pk)
    //     } else {
    //         Err(TransferErrorType::NotImplemented.into())
    //     }
    // }
}
