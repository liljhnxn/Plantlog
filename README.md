# 🌱 PlantLog

> **"Grow Something. Track Every Step."**

**PlantLog** is a lightweight, fully decentralized Web3 botanical application where gardeners and plant enthusiasts register plants and permanently record their watering sessions and growth milestones directly on-chain.

---

## 🪴 Architecture & Design Highlights

- **Exactly One Webpage**: Built using Next.js App Router (`src/app/page.tsx`) with zero separate sub-pages.
- **Exactly One Smart Contract**: `PlantLog.sol` stores all plant registrations, watering histories, and growth milestones directly on the blockchain.
- **No Backend / No Database**: All state is retrieved directly from Botchain Mainnet via RPC and wagmi/viem.
- **No Tokens / No NFTs**: Pure, clean on-chain data tracking without tokenomics or NFT clutter.
- **Gardening-Inspired Interface**: Tailored natural color palette featuring deep botanical greens, warm creams, soft whites, and earthy terracotta browns with subtle foliage motifs.
- **Ecosystem Integration**: Displays BOT Chain logo and direct links to both the BOT Chain Website and Explorer.

---

## 🌐 Network Information: Botchain Mainnet

- **Network Name**: Botchain Mainnet
- **Chain ID**: `677`
- **RPC Endpoint**: [https://rpc.botchain.ai](https://rpc.botchain.ai)
- **Currency Symbol**: `BOT`
- **Total Supply**: 150 Million BOT
- **Official Website**: [https://botchain.ai](https://botchain.ai)
- **Block Explorer**: [https://scan.botchain.ai](https://scan.botchain.ai)
- **Verified Contract**: [`0xd366385F4d44E1250CCAF37566b690E996849769`](https://scan.botchain.ai/address/0xd366385F4d44E1250CCAF37566b690E996849769#code)

---

## 📜 Smart Contract: `PlantLog.sol`

The single smart contract implements:
1. **Plant Registration**: Users register their plant with a `name`, `species`, and `description` (or care notes).
2. **Watering Activities**: Owners record water volume in milliliters (`amountMl`) and hydration/nutrient notes.
3. **Growth Updates**: Owners log measured plant height in centimeters (`heightCm`) and observational milestones.
4. **Plant Activity History**: Maintains a chronological on-chain log of all events per plant.
5. **Plant Deactivation / Removal**: Allows plant owners to retire plants from active tracking while keeping history immutable.
6. **Strict Access Control**: Only the registered owner of a plant can log watering, record growth, or deactivate it.
7. **Event Emits**: `PlantRegistered`, `PlantWatered`, `GrowthRecorded`, and `PlantRemoved`.
8. **Global Statistics**: Real-time counter of total plants registered, total watering sessions, and total growth logs across the network.

---

## 💻 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Web3 Layer**: [wagmi v2](https://wagmi.sh/), [viem](https://viem.sh/), [MetaMask](https://metamask.io/) connector
- **Smart Contracts & Testing**: [Solidity 0.8.20](https://soliditylang.org/), [Hardhat](https://hardhat.org/), [Ethers v6](https://docs.ethers.org/), [Chai](https://www.chaijs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** v18+ (tested up to v25)
- **MetaMask** browser extension configured with Botchain Mainnet (Chain ID 677)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Settings:
```env
BOTCHAIN_MAINNET_RPC_URL=https://rpc.botchain.ai
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.botchain.ai
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS=0xd366385F4d44E1250CCAF37566b690E996849769
```

---

## 🧪 Testing Smart Contracts

Run the comprehensive Hardhat test suite (15 unit tests covering registration, access control, watering, growth, removal, and queries):

```bash
npm test
```

---

## 🛠️ Deploying to Botchain Mainnet

Compile contracts:
```bash
npm run compile
```

Deploy to Botchain Mainnet (Chain ID 677):
```bash
npm run deploy
```

---

## 🖥️ Running the Frontend

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
npm start
```

---

## 🌿 User Interface Walkthrough

1. **Navigation**: Displays PlantLog branding, current network badge (Botchain Mainnet 677), and one-click MetaMask connect/disconnect button.
2. **Hero Headline**: *"A Little Care Goes a Long Way."* with instant action buttons to register a plant or view the verified contract on Botchain Explorer.
3. **Live Stats Counters**: Total plants registered, total watering records, growth milestones, and user's active garden count.
4. **My Plants Collection**:
   - Filter between **Active** and **All (including archived)** plants.
   - Clean botanical cards showing plant name, species, registration date, watering count, current height, and last watered timestamp.
5. **Interactive Modals**:
   - **Register Plant Modal**: Name, species, and care guidelines.
   - **Water Plant Modal**: Enter water volume (ml) and optional nutrient notes.
   - **Record Growth Modal**: Enter measured height (cm) and progress notes.
   - **Plant Details & Activity History**: Chronological timeline displaying all past waterings, growth notes, and timestamps.
   - **Archive Confirmation Modal**: Safely deactivate a plant from active care.
6. **BOT Chain Ecosystem & Footer**:
   - Direct link to **BOT Chain Website**: [https://botchain.ai](https://botchain.ai)
   - Direct link to **BOT Chain Explorer**: [https://scan.botchain.ai](https://scan.botchain.ai)
   - Direct link to **Verified Contract**: [`0xd366385F4d44E1250CCAF37566b690E996849769`](https://scan.botchain.ai/address/0xd366385F4d44E1250CCAF37566b690E996849769#code)
   - Real-time transaction confirmation notifications with direct links to the Botchain Block Explorer (`https://scan.botchain.ai/tx/...`).
