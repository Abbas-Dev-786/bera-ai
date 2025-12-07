# BeraAI

**Your AI-Powered Web3 Copilot for Research → Contract Gen → Audit → On-Chain Execution (BNB)**
Built for the **Quack × ChainGPT “Super Web3 Agent”** bounty track.
This project turns natural-language chat into safe, policy-controlled blockchain actions using ChainGPT and Quack x402.

---

## 🚀 Project Summary

**Super Web3 Agent** is a chat-first Web3 automation assistant that can:

* Understand & answer Web3 questions
* Generate Solidity smart contracts
* Ingest + audit existing contracts with AI
* Build safe, multi-step on-chain flows *(swap → stake → transfer)*
* Execute via x402 sign-to-pay on BNB Testnet
* Enforce safety policies *(spend caps, allowlists, previews)*

It satisfies all required areas of the bounty track:
agent capabilities, safety, audit integration, and x402 execution flow.

---

## 🌟 Features

### 🔍 1. Web3 Research & Explanation

* Token analysis
* Contract logic breakdowns
* Protocol strategy explanations

### 🛠️ 2. Contract Generation

* Describe the contract in plain English
* Agent generates full Solidity source (Upgradeable optional)

### 🔎 3. Smart-Contract AI Audit

* Severity-ranked findings
* Auto-generated fixes & improved code
* Checks for approval patterns, reentrancy, unsafe calls, etc.

### 🔗 4. On-Chain Execution (BNB + x402)

* Transfers, swaps, approvals, contract writes
* Safe bundles *(e.g., Swap 50 USDT → BNB, then stake in pool)*
* Human-readable previews
* User signs once using Quack x402

### 🛡️ 5. Safety & Policy System

* Spend caps (per-tx + daily)
* Allowlist/denylist for addresses & tokens
* Testnet/Mainnet lock
* Logging for all agent operations & transactions

---

## 🧱 Architecture Overview

```
[User UI: Web]
        |
        v
[Frontend Chat Layer]
        |
REST / WebSocket Interface
        |
        v
[Backend Agent Orchestrator]
   |          |           |
   |          |           |
ChainGPT API  Quack x402  BNB Chain
(chat,        flows       (tx exec,
contract gen, (sign-to-    logs)
auditing)      pay)
        |
        v
[Database / Logs]
```

---

## 🛠️ Tech Stack

* **Frontend:** React
* **Backend:** Node.js (Express)
* **Agents:** Custom logic calling ChainGPT APIs
* **Blockchain:** BNB Chain Testnet
* **Execution Layer:** Quack x402
* **Database:** MongoDB

---

## 🔐 Security

* No private key storage
* Human-validated action previews
* Contract risk scoring
* Allowlist/denylist mechanisms
* Spend caps
* Full action & transaction logging
* Testnet-first safe mode

---

## 📦 Deliverables Included (Hackathon)

* Full source code
* This README
* Architecture diagrams
* Demo video (2–3 minutes)
* Public demo link
* Test wallets + instructions
* Example scripts for x402 flows

---

## 📘 Future Improvements

* Stronger autonomous policy engine
* Auto-refactoring for optimized gas usage
* Expanded multi-chain support
* Full Telegram/Discord conversational agent


