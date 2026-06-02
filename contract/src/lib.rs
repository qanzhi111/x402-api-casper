/**
 * Casper x402 API Usage Logger
 * 
 * Smart contract to record API usage and payments on Casper Network
 * Built with Odra Framework for Casper Agentic Buildathon 2025
 * 
 * This contract logs:
 * - API calls with endpoint identifiers
 * - Payment amounts in CSPR
 * - Caller addresses
 * - Timestamps
 * 
 * Deploy to Casper Testnet to satisfy the "transaction-producing on-chain component" requirement
 */

#![no_std]
#![no_main]

use odra::types::{Address, U256};
use odra::contract_env::{get_caller, block_time};

// Contract storage
#[odra::module]
pub struct X402ApiLogger {
    // Total API calls counter
    total_calls: U256,
    // Total CSPR received (in motes)
    total_revenue: U256,
    // Mapping of endpoint to call count
    endpoint_calls: odra::Vec<(odra::String, U256)>,
    // Recent calls for transparency
    recent_calls: odra::Vec<ApiCall>,
    // Authorized service addresses
    authorized_services: odra::Vec<Address>,
}

#[odra::module]
impl X402ApiLogger {
    // Initialize the contract
    pub fn init(&mut self) {
        self.total_calls = U256::ZERO;
        self.total_revenue = U256::ZERO;
    }

    // Log an API call (called by the API server after payment verification)
    // endpoint: identifier for the API endpoint (e.g., "crypto_price", "investigate")
    // amount: payment amount in motes
    // payer: the address that paid
    pub fn log_api_call(&mut self, endpoint: odra::String, amount: U256) {
        let caller = get_caller();
        
        // Increment total calls
        self.total_calls += U256::from(1);
        
        // Add to revenue
        self.total_revenue += amount;
        
        // Record the call
        let call = ApiCall {
            caller,
            endpoint: endpoint.clone(),
            amount,
            timestamp: block_time(),
        };
        
        self.recent_calls.push(call);
        
        // Keep only last 100 calls
        if self.recent_calls.len() > 100 {
            self.recent_calls.remove(0);
        }
    }

    // Register an authorized API service
    pub fn add_service(&mut self, service: Address) {
        // In production, add access control here
        self.authorized_services.push(service);
    }

    // Get total API calls
    pub fn get_total_calls(&self) -> U256 {
        self.total_calls
    }

    // Get total revenue
    pub fn get_total_revenue(&self) -> U256 {
        self.total_revenue
    }

    // Get recent calls
    pub fn get_recent_calls(&self, limit: u32) -> odra::Vec<ApiCall> {
        let limit = limit as usize;
        let start = if self.recent_calls.len() > limit {
            self.recent_calls.len() - limit
        } else {
            0
        };
        
        let mut result = odra::Vec::new();
        for i in start..self.recent_calls.len() {
            result.push(self.recent_calls.get(i));
        }
        result
    }

    // Get contract info
    pub fn get_info(&self) -> ContractInfo {
        ContractInfo {
            total_calls: self.total_calls,
            total_revenue: self.total_revenue,
            recent_calls_count: self.recent_calls.len() as u32,
            authorized_services: self.authorized_services.len() as u32,
        }
    }
}

// Data structures
#[odra::types]
struct ApiCall {
    caller: Address,
    endpoint: odra::String,
    amount: U256,
    timestamp: u64,
}

#[odra::types]
struct ContractInfo {
    total_calls: U256,
    total_revenue: U256,
    recent_calls_count: u32,
    authorized_services: u32,
}
