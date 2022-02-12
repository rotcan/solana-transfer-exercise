use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

// #[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
// pub struct Counter {
//     pub count: u64,
// }

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct BlockAccount {
    pub account_key: Pubkey,
}

impl BlockAccount {
    pub fn save(&self, ai: &AccountInfo) -> ProgramResult {
        Ok(self.serialize(&mut *ai.data.borrow_mut())?)
    }
}

pub const ADMIN_KEY_BASE58: &str = "9cnSj92djjErbqUahBcoTxmc5mL31hcaePDq971AmDEF";
