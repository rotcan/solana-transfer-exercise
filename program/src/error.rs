use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone, PartialEq)]
pub enum TransferErrorType {
    #[error("Instruction not implemented.")]
    NotImplemented,
    #[error("Account Blocked.")]
    AccountBlocked,
    #[error("Program Not Allowed.")]
    UnknownProgram,
    #[error("Account Not Allowed.")]
    AccountNotAllowed,
    #[error("Not enough Sol.")]
    NotEnoughSol,
}

impl From<TransferErrorType> for ProgramError {
    fn from(e: TransferErrorType) -> Self {
        ProgramError::Custom(e as u32)
    }
}
