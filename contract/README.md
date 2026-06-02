# Casper Smart Contract - x402 API Usage Logger

This is a simple smart contract for the Casper Network that logs API usage and payments on-chain.

## Purpose

This contract satisfies the "transaction-producing on-chain component" requirement for the Casper Agentic Buildathon by recording:

- API call counts
- Payment amounts in CSPR motes
- Caller addresses
- Timestamps

## Building

### Prerequisites

- Rust toolchain (rustup, cargo)
- Odra CLI

### Build Contract

```bash
cd contract
odra build
```

The WASM file will be generated at:
`target/wasm32-unknown-unknown/release/x402_api_logger.wasm`

## Deployment

### 1. Get Testnet CSPR

Visit: https://cspr.live/faucet

### 2. Deploy using Casper CLI

```bash
# Get testnet funds first
casper-client get-balance \
  --node-address https://node.testnet.casper.network/rpc \
  --purse-protocol <your-uref> \
  --account-hash <your-account-hash>

# Deploy the contract
casper-client put-deploy \
  --node-address https://node.testnet.casper.network/rpc \
  --chain-name casper-test \
  --payment-amount 2000000000 \
  --session-path ./contract/target/wasm32-unknown-unknown/release/x402_api_logger.wasm \
  --secret-key ./your-secret-key.pem
```

### 3. Update Environment

After deployment, add the contract hash to your `.env`:

```
CONTRACT_HASH=<deployed-contract-hash>
RPC_URL=https://node.testnet.casper.network/rpc
```

## Contract Functions

| Function | Description |
|----------|-------------|
| `init()` | Initialize the contract |
| `log_api_call(endpoint, amount)` | Log an API call (called by API server) |
| `get_total_calls()` | Get total number of API calls |
| `get_total_revenue()` | Get total CSPR revenue (in motes) |
| `get_recent_calls(limit)` | Get recent API calls |
| `get_info()` | Get contract statistics |

## Integration

The API server (`server.js`) will call this contract after successful x402 payment verification to record usage on-chain.

## Security Notes

- Add proper access control in production
- Validate caller is authorized service
- Consider rate limiting
- Add emergency pause functionality
