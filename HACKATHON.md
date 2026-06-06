# Casper Agentic Buildathon - Submission Details

## Project: x402-Crypto-API-Casper

### Team Information
- **Team Name**: onchain-shadow
- **GitHub**: qanzhi111
- **Registration Platform**: DoraHacks (https://dorahacks.io/hackathon/2202/detail)

### Project Category
- **Primary**: Agentic AI — x402 Payments + AI Agents
- **Secondary**: DeFi & Payments Infrastructure

### Submission Links
- **GitHub Repository**: https://github.com/qanzhi111/x402-api-casper
- **Live Demo (Base version)**: https://x402-crypto-api-production.up.railway.app
- **Demo Video**: ⏳ To be recorded before submission

### Project Summary

x402-Crypto-API-Casper brings the x402 micropayment protocol to the Casper Network, enabling AI agents to autonomously pay for on-chain intelligence services using CSPR/CEP-18 tokens — no API keys, no subscriptions, no human in the loop.

Built on our production-proven [x402-crypto-api (Base/USDC)](https://github.com/qanzhi111/x402-crypto-api), this Casper adaptation leverages the official Casper x402 Facilitator and the Odra smart contract framework to deliver a complete AI agent payment pipeline on Casper Testnet.

### Why This Matters

The Casper AI Toolkit vision is a machine economy where agents transact autonomously. We provide the **service layer** — the APIs that agents pay to use. Our project closes the loop:

- Agents **discover** services via MCP
- Agents **pay** via x402 (CSPR/CEP-18)
- Services **settle** on Casper Testnet
- Usage is **logged** on-chain via Odra smart contract

This is not a demo — it's a production-grade API infrastructure that any AI agent can plug into today.

### Key Features Delivered

1. **6 API Endpoints** with x402 payment protection
   - Crypto price lookup (1 CSPR per call)
   - Market data overview (2 CSPR per call)
   - Address analysis (5 CSPR per call)
   - Token security checks (5 CSPR per call)
   - Contract risk analysis (10 CSPR per call)
   - Full on-chain investigation (25 CSPR per call)

2. **MCP Server** for AI agent integration
   - Native Model Context Protocol support
   - Automatic x402 payment handling
   - 6 tool definitions for AI agents
   - Compatible with Claude Desktop, Cursor, and any MCP client

3. **On-chain Component** (Rust/Odra)
   - Smart contract logs all API usage on Casper Testnet
   - Tracks total calls, revenue, and per-endpoint statistics
   - Satisfies "transaction-producing on-chain component" requirement

4. **Casper x402 Integration**
   - Uses official Casper x402 Facilitator
   - EIP-712 signature verification
   - CEP-18 token payments on Casper Testnet

5. **Production-Proven Architecture**
   - Base/USDC version running on Railway since May 2026
   - Listed on MCP directories (awesome-mcp-servers, Agent402 marketplace)
   - Real API traffic from AI agents

### Technical Stack

| Component | Technology |
|-----------|------------|
| API Server | Node.js/Express |
| Payment Protocol | x402 v2 |
| Blockchain | Casper Network (Testnet) |
| Smart Contract | Rust/Odra Framework |
| AI Integration | MCP (Model Context Protocol) |
| Payment Verification | Casper x402 Facilitator |
| Data Sources | CoinGecko, Etherscan, BscScan |

### Hackathon Requirements Checklist

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Working prototype on Casper Testnet | ✅ | API server + x402 payment flow |
| Transaction-producing on-chain component | ✅ | Odra smart contract + usage logging |
| Open-source GitHub repo | ✅ | github.com/qanzhi111/x402-api-casper |
| AI agent integration | ✅ | MCP server with 6 tools |
| x402 payment flow | ✅ | Casper Facilitator + EIP-712 |
| Demo video | ⏳ | To be recorded |

### Competition Tracks Alignment

| Track | Relevance | How We Fit |
|-------|-----------|------------|
| **Agentic AI** | ⭐⭐⭐ | AI agents pay for services via MCP + x402 |
| **DeFi & Payments** | ⭐⭐⭐ | Micropayment infrastructure on Casper |
| **Cross-Chain** | ⭐⭐ | Multi-chain data (ETH + BSC + Casper) |
| **RWA Tokenization** | ⭐ | Potential for tokenized API access rights |

### Differentiators vs Other Submissions

1. **Not just a demo** — production Base version has real users
2. **Complete payment loop** — discovery → payment → settlement → logging
3. **MCP-native** — not REST-only; AI agents can use it directly
4. **Dual-chain** — works on both Base/USDC and Casper/CSPR
5. **On-chain transparency** — all API usage logged to smart contract

### Funding & Resources
- Casper Testnet CSPR from faucet
- No external funding required
- Sponsored x402 Facilitator usage (per hackathon rules)

---

**Submitted by**: onchain-shadow (qanzhi111)  
**Date**: June 2026  
**Hackathon**: Casper Agentic Buildathon — $150,000 Prize Pool
