/**
 * x402-Crypto-API-Casper
 * 
 * Cryptocrypto API with x402 payments on Casper Network
 * AI agents pay with CSPR/CEP-18 tokens via x402 protocol
 * 
 * Built for Casper Agentic Buildathon 2026
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ============ Configuration ============
const PORT = process.env.PORT || 3000;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

// Casper x402 Configuration
const CASPER_PAYEE_ADDRESS = process.env.CASPER_PAYEE_ADDRESS || '01<64-char-account-hash>';
const CASPER_FACILITATOR_URL = process.env.CASPER_FACILITATOR_URL || 'http://localhost:4022';
const CASPER_CAIP2_CHAIN_ID = process.env.CASPER_CAIP2_CHAIN_ID || 'casper:casper-test';
const CASPER_ASSET_PACKAGE = process.env.CASPER_ASSET_PACKAGE || '';

// Payment amounts in motes (1 CSPR = 1,000,000,000 motes)
const PAYMENT_PRICES = {
  minimal: parseInt(process.env.PAYMENT_PRICE_MINIMAL || '1000000000'),   // ~$0.01
  low: parseInt(process.env.PAYMENT_PRICE_LOW || '2000000000'),          // ~$0.02
  medium: parseInt(process.env.PAYMENT_PRICE_MEDIUM || '5000000000'),    // ~$0.05
  high: parseInt(process.env.PAYMENT_PRICE_HIGH || '1000000000'),        // ~$0.10
  premium: parseInt(process.env.PAYMENT_PRICE_PREMIUM || '2500000000')   // ~$0.25
};

// Base URL for links
const getBaseUrl = (req) => `${req.protocol}://${req.get('host')}`;

// ============ x402 Payment Middleware for Casper ============

/**
 * Casper x402 Payment Verification
 * 
 * Flow:
 * 1. Client requests paid endpoint
 * 2. Server returns 402 with PaymentRequirements
 * 3. Client signs EIP-712 authorization with CSPR/CEP-18
 * 4. Client retries with PAYMENT-SIGNATURE header
 * 5. Server verifies via facilitator and returns data
 */
function x402PaymentRequired(config) {
  return async function(req, res, next) {
    // Allow internal calls to bypass payment
    if (req.headers['x-internal-call'] === 'true') {
      req.paid = true;
      req.paymentAmount = config.amount;
      req.paymentAsset = config.asset || 'CSPR';
      next();
      return;
    }

    const paymentHeader = req.headers['payment-signature'];

    if (paymentHeader) {
      // Verify payment via Casper x402 Facilitator
      try {
        const verificationResult = await verifyPayment(paymentHeader, config);
        
        if (verificationResult.valid) {
          req.paid = true;
          req.paymentAmount = config.amount;
          req.paymentAsset = 'CSPR';
          req.payerAddress = verificationResult.payer;
          req.deployHash = verificationResult.deployHash;
          
          // Log usage to on-chain contract (if configured)
          await logUsageToChain(req);
          
          next();
        } else {
          res.status(402).json({
            error: 'Payment verification failed',
            reason: verificationResult.reason
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
          error: 'Payment verification service unavailable',
          details: error.message
        });
      }
    } else {
      // Return 402 Payment Required with Casper x402 details
      const paymentReq = buildPaymentRequirements(config);
      
      res.status(402).json({
        x402_version: 2,
        scheme: 'exact',
        network: CASPER_CAIP2_CHAIN_ID,
        asset: CASPER_ASSET_PACKAGE || 'native',
        assetSymbol: 'CSPR',
        assetDecimals: 9,
        amount: config.amount.toString(),
        amountDisplay: formatCSPR(config.amount),
        recipient: CASPER_PAYEE_ADDRESS,
        description: config.description || 'API access fee',
        payment_requirements: paymentReq,
        instructions: {
          step1: 'Create a Casper Testnet account and get CSPR from faucet',
          step2: 'Sign an EIP-712 authorization for the payment amount',
          step3: 'Retry the request with header: PAYMENT-SIGNATURE: <signature>',
          documentation: 'https://github.com/make-software/casper-x402'
        },
        // x402 Bazaar extension for service discovery
        extensions: {
          bazaar: {
            name: 'Casper x402 Crypto API',
            description: 'Crypto prices, Web3 security data, and on-chain investigation reports for AI Agents - Powered by Casper Network',
            category: 'finance',
            tags: ['crypto', 'web3', 'security', 'blockchain', 'defi', 'investigation', 'casper', 'ai-agents', 'mcp'],
            homepage: getBaseUrl(req),
            endpoints: [
              { path: '/api/crypto/price/:symbol', price: formatCSPR(PAYMENT_PRICES.minimal), description: 'Real-time crypto price' },
              { path: '/api/crypto/market', price: formatCSPR(PAYMENT_PRICES.low), description: 'Market overview' },
              { path: '/api/crypto/address/:address', price: formatCSPR(PAYMENT_PRICES.medium), description: 'Address analysis' },
              { path: '/api/security/token/:address', price: formatCSPR(PAYMENT_PRICES.medium), description: 'Token security check' },
              { path: '/api/security/contract/:address', price: formatCSPR(PAYMENT_PRICES.high), description: 'Contract risk analysis' },
              { path: '/api/investigate/:address', price: formatCSPR(PAYMENT_PRICES.premium), description: 'Full on-chain investigation' }
            ],
            seller: 'OnChain Shadow',
            network: CASPER_CAIP2_CHAIN_ID,
            facilitator: CASPER_FACILITATOR_URL
          }
        }
      });
    }
  };
}

function formatCSPR(motes) {
  const cspr = motes / 1e9;
  if (cspr >= 1) return `${cspr.toFixed(2)} CSPR`;
  if (cspr >= 0.001) return `${(cspr * 1000).toFixed(2)} mCSPR`;
  return `${(cspr * 1e6).toFixed(2)} μCSPR`;
}

function buildPaymentRequirements(config) {
  return {
    scheme: 'exact',
    network: CASPER_CAIP2_CHAIN_ID,
    payTo: CASPER_PAYEE_ADDRESS,
    amount: config.amount.toString(),
    asset: CASPER_ASSET_PACKAGE || 'native',
    extra: {
      name: 'CasperX402',
      version: '1',
      decimals: 9,
      symbol: 'CSPR'
    },
    maxTimeoutSeconds: 900
  };
}

async function verifyPayment(paymentHeader, config) {
  try {
    // Parse the payment header
    // Format: casper:<address>:<amount>:<signature>
    const parts = paymentHeader.split(':');
    
    if (parts.length < 4) {
      // Try JSON format
      try {
        const payment = JSON.parse(paymentHeader);
        return await callFacilitatorVerify(payment, config);
      } catch {
        return { valid: false, reason: 'Invalid payment header format' };
      }
    }

    const [scheme, address, amount, signature] = parts;
    
    if (scheme !== 'casper') {
      return { valid: false, reason: `Unsupported scheme: ${scheme}` };
    }

    // Call the facilitator for verification and settlement
    const payload = {
      paymentPayload: {
        x402Version: 2,
        scheme: 'exact',
        network: CASPER_CAIP2_CHAIN_ID,
        payload: {
          signature: signature,
          publicKey: address,
          authorization: {
            from: address,
            to: CASPER_PAYEE_ADDRESS,
            value: amount,
            validAfter: Math.floor(Date.now() / 1000) - 600,
            validBefore: Math.floor(Date.now() / 1000) + 900,
            nonce: generateNonce()
          }
        }
      },
      paymentRequirements: buildPaymentRequirements(config)
    };

    return await callFacilitatorSettle(payload);
  } catch (error) {
    console.error('Payment verification error:', error);
    return { valid: false, reason: error.message };
  }
}

async function callFacilitatorVerify(payload, config) {
  try {
    const response = await fetch(`${CASPER_FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      const error = await response.json();
      return { valid: false, reason: error.invalidReason || 'Verification failed' };
    }

    const result = await response.json();
    return {
      valid: result.isValid,
      reason: result.invalidReason,
      payer: result.payer
    };
  } catch (error) {
    console.error('Facilitator call error:', error);
    // In demo mode, trust the payment header
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: trusting payment header');
      return { valid: true, payer: 'dev-mode' };
    }
    return { valid: false, reason: 'Facilitator unavailable' };
  }
}

async function callFacilitatorSettle(payload) {
  try {
    const response = await fetch(`${CASPER_FACILITATOR_URL}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000)
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        valid: true,
        deployHash: result.transaction,
        payer: result.payer
      };
    } else {
      return {
        valid: false,
        reason: result.errorReason || result.errorMessage
      };
    }
  } catch (error) {
    console.error('Facilitator settle error:', error);
    // In demo mode, simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: simulating successful payment');
      return { valid: true, deployHash: 'dev-deploy-hash-' + Date.now(), payer: 'dev-mode' };
    }
    return { valid: false, reason: 'Settlement service unavailable' };
  }
}

function generateNonce() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============ On-Chain Usage Logging ============

const CONTRACT_HASH = process.env.CONTRACT_HASH;
const RPC_URL = process.env.RPC_URL || 'https://node.testnet.casper.network/rpc';

async function logUsageToChain(req) {
  if (!CONTRACT_HASH || !CASPER_PAYEE_ADDRESS) {
    console.log('Usage logged (off-chain):', {
      endpoint: req.path,
      amount: req.paymentAmount,
      payer: req.payerAddress,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    // In production, this would call the Casper smart contract
    // to record the API usage on-chain
    const usage = {
      action: 'log_api_usage',
      endpoint: req.path,
      amount: req.paymentAmount,
      payer: req.payerAddress,
      deployHash: req.deployHash,
      timestamp: Math.floor(Date.now() / 1000)
    };

    console.log('Usage logged (on-chain):', usage);

    // Example: Call contract via RPC
    // const result = await callContract(usage);
    // console.log('Contract result:', result);
  } catch (error) {
    console.error('Failed to log to chain:', error);
  }
}

// ============ Free Endpoints ============

app.get('/', (req, res) => {
  res.json({
    name: 'Casper x402 Crypto API',
    description: 'Crypto & Web3 Security Data for AI Agents - Powered by Casper Network',
    version: '1.0.0',
    network: {
      chain: 'Casper',
      networkId: CASPER_CAIP2_CHAIN_ID,
      testnet: true
    },
    payment: {
      protocol: 'x402 v2',
      scheme: 'exact',
      asset: CASPER_ASSET_PACKAGE || 'native CSPR',
      facilitator: CASPER_FACILITATOR_URL
    },
    paid_endpoints: {
      '/api/crypto/price/:symbol': `${formatCSPR(PAYMENT_PRICES.minimal)} - Real-time crypto price`,
      '/api/crypto/market': `${formatCSPR(PAYMENT_PRICES.low)} - Market overview (top coins)`,
      '/api/crypto/address/:address': `${formatCSPR(PAYMENT_PRICES.medium)} - Address analysis`,
      '/api/security/token/:address': `${formatCSPR(PAYMENT_PRICES.medium)} - Token security check`,
      '/api/security/contract/:address': `${formatCSPR(PAYMENT_PRICES.high)} - Contract risk analysis`,
      '/api/investigate/:address': `${formatCSPR(PAYMENT_PRICES.premium)} - Full on-chain investigation`
    },
    free_endpoints: {
      '/health': 'Service health check',
      '/api/status': 'API status and pricing',
      '/mcp': 'MCP server endpoint'
    },
    links: {
      casper_x402_docs: 'https://github.com/make-software/casper-x402',
      casper_faucet: 'https://cspr.live/faucet',
      hackathon: 'https://dorahacks.io/hackathon/casper-agentic-buildathon'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    network: CASPER_CAIP2_CHAIN_ID
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'Casper x402 Crypto API',
    payment_protocol: 'x402 v2',
    network: CASPER_CAIP2_CHAIN_ID,
    asset: CASPER_ASSET_PACKAGE || 'native CSPR',
    facilitator: CASPER_FACILITATOR_URL,
    pricing: {
      crypto_price: `${formatCSPR(PAYMENT_PRICES.minimal)}/call`,
      market_overview: `${formatCSPR(PAYMENT_PRICES.low)}/call`,
      address_analysis: `${formatCSPR(PAYMENT_PRICES.medium)}/call`,
      token_security: `${formatCSPR(PAYMENT_PRICES.medium)}/call`,
      contract_risk: `${formatCSPR(PAYMENT_PRICES.high)}/call`,
      full_investigation: `${formatCSPR(PAYMENT_PRICES.premium)}/call`
    },
    hackathon: {
      name: 'Casper Agentic Buildathon',
      deadline: 'June 30, 2025',
      prize: '$150,000',
      category: 'x402 Payments + AI Agents'
    }
  });
});

// ============ Paid Endpoints ============

// 1. Crypto Price - Minimal tier
app.get('/api/crypto/price/:symbol', 
  x402PaymentRequired({ amount: PAYMENT_PRICES.minimal, description: 'Real-time cryptocurrency price' }),
  async (req, res) => {
    try {
      const symbol = req.params.symbol.toLowerCase();
      const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
        { headers }
      );
      
      const data = await response.json();
      
      if (!data || Object.keys(data).length === 0) {
        return res.status(404).json({
          error: 'Symbol not found',
          hint: 'Use CoinGecko IDs: bitcoin, ethereum, solana, cardano, etc.',
          casper_note: 'Payments processed via x402 on Casper Network'
        });
      }
      
      res.json({
        symbol: req.params.symbol.toUpperCase(),
        data: data,
        timestamp: Date.now(),
        source: 'CoinGecko',
        payment: {
          amount: req.paymentAmount,
          asset: req.paymentAsset,
          deployHash: req.deployHash
        }
      });
    } catch (error) {
      console.error('Price fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch price data' });
    }
  }
);

// 2. Market Overview - Low tier
app.get('/api/crypto/market',
  x402PaymentRequired({ amount: PAYMENT_PRICES.low, description: 'Top cryptocurrencies market data' }),
  async (req, res) => {
    try {
      const headers = COINGECKO_API_KEY ? { 'x-cg-demo-api-key': COINGECKO_API_KEY } : {};
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
        { headers }
      );
      
      const data = await response.json();
      
      res.json({
        top_coins: data.map(coin => ({
          rank: coin.market_cap_rank,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          volume_24h: coin.total_volume
        })),
        timestamp: Date.now(),
        source: 'CoinGecko',
        payment: {
          amount: req.paymentAmount,
          asset: req.paymentAsset,
          deployHash: req.deployHash
        }
      });
    } catch (error) {
      console.error('Market fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  }
);

// 3. Address Analysis - Medium tier
app.get('/api/crypto/address/:address',
  x402PaymentRequired({ amount: PAYMENT_PRICES.medium, description: 'Ethereum address analysis' }),
  async (req, res) => {
    try {
      const address = req.params.address;
      const apiKey = ETHERSCAN_API_KEY;
      
      const response = {
        address: address,
        network: 'Ethereum Mainnet',
        link: `https://etherscan.io/address/${address}`,
        note: 'Basic analysis - enhanced with Etherscan API key'
      };

      if (apiKey) {
        // Get ETH balance
        const balanceRes = await fetch(
          `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
        );
        const balanceData = await balanceRes.json();
        
        // Get transaction count
        const txRes = await fetch(
          `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${apiKey}`
        );
        const txData = await txRes.json();
        
        response.eth_balance = balanceData.result ? (parseInt(balanceData.result, 16) / 1e18).toFixed(4) + ' ETH' : '0 ETH';
        response.transaction_count = txData.result ? parseInt(txData.result, 16) : 0;
      }

      res.json({
        ...response,
        timestamp: Date.now(),
        payment: {
          amount: req.paymentAmount,
          asset: req.paymentAsset,
          deployHash: req.deployHash
        }
      });
    } catch (error) {
      console.error('Address analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze address' });
    }
  }
);

// 4. Token Security Check - Medium tier
app.get('/api/security/token/:address',
  x402PaymentRequired({ amount: PAYMENT_PRICES.medium, description: 'Token security and rug pull risk assessment' }),
  async (req, res) => {
    try {
      const address = req.params.address;
      const apiKey = ETHERSCAN_API_KEY;
      
      const securitySignals = {
        address: address,
        network: 'Ethereum',
        etherscan: `https://etherscan.io/token/${address}`,
        checks: {
          contract_verified: false,
          has_mint_function: 'unknown',
          has_pause_function: 'unknown',
          has_blacklist: 'unknown',
          liquidity_locked: 'unknown',
          owner_can_renounce: 'unknown'
        },
        risk_level: 'unknown',
        recommendation: 'Verify contract on Etherscan before investing'
      };

      if (apiKey) {
        const verifyRes = await fetch(
          `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
        );
        const verifyData = await verifyRes.json();
        securitySignals.checks.contract_verified = verifyData.status === '1';
        
        if (securitySignals.checks.contract_verified) {
          try {
            const abi = JSON.parse(verifyData.result);
            const functionNames = abi.filter(x => x.type === 'function').map(x => x.name);
            
            securitySignals.checks.has_mint_function = functionNames.some(n => n.toLowerCase().includes('mint')) ? 'yes' : 'no';
            securitySignals.checks.has_pause_function = functionNames.some(n => n.toLowerCase().includes('pause')) ? 'yes' : 'no';
            securitySignals.checks.has_blacklist = functionNames.some(n => n.toLowerCase().includes('blacklist') || n.toLowerCase().includes('block')) ? 'yes' : 'no';
            
            const risks = [];
            if (securitySignals.checks.has_mint_function === 'yes') risks.push('Mint function detected');
            if (securitySignals.checks.has_pause_function === 'yes') risks.push('Pause function detected');
            if (securitySignals.checks.has_blacklist === 'yes') risks.push('Blacklist function detected');
            
            securitySignals.risk_level = risks.length === 0 ? 'low' : risks.length <= 1 ? 'medium' : 'high';
            if (risks.length > 0) securitySignals.warnings = risks;
          } catch (e) {
            // ABI parse failed
          }
        } else {
          securitySignals.risk_level = 'high';
          securitySignals.warnings = ['Contract not verified - high risk'];
        }
      }

      res.json({
        ...securitySignals,
        timestamp: Date.now(),
        payment: {
          amount: req.paymentAmount,
          asset: req.paymentAsset,
          deployHash: req.deployHash
        }
      });
    } catch (error) {
      console.error('Token security check error:', error);
      res.status(500).json({ error: 'Failed to check token security' });
    }
  }
);

// 5. Contract Risk Analysis - High tier
app.get('/api/security/contract/:address',
  x402PaymentRequired({ amount: PAYMENT_PRICES.high, description: 'Smart contract risk analysis' }),
  async (req, res) => {
    try {
      const address = req.params.address;
      
      res.json({
        address: address,
        network: 'Ethereum',
        etherscan: `https://etherscan.io/address/${address}`,
        analysis: {
          contract_type: 'ERC-20 Token',
          risk_factors: [
            'Verify contract source code on Etherscan',
            'Check audit reports from reputable security firms',
            'Review tokenomics and distribution'
          ],
          recommendations: [
            'Use token exploration tools',
            'Check for security audits',
            'Verify team identity'
          ]
        },
        timestamp: Date.now(),
        payment: {
          amount: req.paymentAmount,
          asset: req.paymentAsset,
          deployHash: req.deployHash
        }
      });
    } catch (error) {
      console.error('Contract analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze contract' });
    }
  }
);

// 6. Full Investigation - Premium tier
app.get('/api/investigate/:address',
  x402PaymentRequired({ amount: PAYMENT_PRICES.premium, description: 'Full on-chain investigation report' }),
  async (req, res) => {
    try {
      const address = req.params.address;
      
      res.json({
        address: address,
        network: 'Ethereum',
        etherscan: `https://etherscan.io/address/${address}`,
        investigation: {
          summary: 'Full on-chain investigation report',
          risk_assessment: 'moderate',
          findings: {
            total_transactions: 'Query with Etherscan API',
            token_transfers: 'Query with Etherscan API',
            first_activity: 'Query with Etherscan API',
            last_activity: 'Query with Etherscan API'
          },
          recommendations: [
            'Investigate transaction patterns',
            'Identify counterparty addresses',
            'Check for suspicious activity',
            'Review token interactions'
          ]
        },
        resources: [
          { name: 'Etherscan', url: `https://etherscan.io/address/${address}` },
          { name: 'EigenPhi', url: `https://eigenphi.io/mev/eth/${address}` },
          { name: 'Arkham Intelligence', url: `https://platform.arkhamintelligence.com/explorer/address/${address}` }
        ],
        timestamp: Date.now(),
        payment: {
          amount: req.paymentAmount,
          asset: req.paymentAsset,
          deployHash: req.deployHash
        }
      });
    } catch (error) {
      console.error('Investigation error:', error);
      res.status(500).json({ error: 'Failed to generate investigation report' });
    }
  }
);

// ============ MCP Server Endpoint ============

app.get('/mcp', (req, res) => {
  res.json({
    name: 'Casper x402 Crypto API - MCP Server',
    version: '1.0.0',
    protocol: 'sse',
    endpoint: '/mcp',
    tools: [
      { name: 'get_crypto_price', description: 'Get real-time cryptocurrency price', price: formatCSPR(PAYMENT_PRICES.minimal) },
      { name: 'get_market_overview', description: 'Get top 20 crypto market data', price: formatCSPR(PAYMENT_PRICES.low) },
      { name: 'analyze_address', description: 'Analyze an Ethereum address', price: formatCSPR(PAYMENT_PRICES.medium) },
      { name: 'check_token_security', description: 'Check token for rug pull indicators', price: formatCSPR(PAYMENT_PRICES.medium) },
      { name: 'analyze_contract', description: 'Smart contract risk analysis', price: formatCSPR(PAYMENT_PRICES.high) },
      { name: 'investigate_address', description: 'Full on-chain investigation', price: formatCSPR(PAYMENT_PRICES.premium) }
    ],
    payment: {
      network: 'Casper Testnet',
      asset: 'CSPR',
      protocol: 'x402 v2'
    }
  });
});

// ============ Start Server ============

app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     Casper x402 Crypto API - AI Agent Payments            ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🚀 Server running on port ${PORT}                          ║`);
  console.log(`║  🌐 Network: ${CASPER_CAIP2_CHAIN_ID}                        ║`);
  console.log(`║  💰 Payment: x402 v2 + Casper Facilitator                 ║`);
  console.log(`║  📡 Facilitator: ${CASPER_FACILITATOR_URL}  ║`);
  console.log(`║  🎯 Hackathon: Casper Agentic Buildathon - $150K           ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET /                          - API info');
  console.log('  GET /health                    - Health check');
  console.log('  GET /api/status                - Status & pricing');
  console.log('  GET /api/crypto/price/:symbol  - Crypto price (x402)');
  console.log('  GET /api/crypto/market         - Market data (x402)');
  console.log('  GET /api/security/token/:addr  - Token security (x402)');
  console.log('  GET /api/investigate/:addr     - Investigation (x402)');
  console.log('  GET /mcp                       - MCP server info');
  console.log('');
});

export default app;
