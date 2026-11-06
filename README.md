# 🌱 PlantLog

> **"Grow Something. Track Every Step."**

**PlantLog** is a lightweight, fully decentralized Web3 botanical application where gardeners and plant enthusiasts register plants and permanently record their watering sessions and growth milestones directly on-chain.

---

## 🪴 Architecture & Design Highlights

- **Exactly One Webpage**: Built using Next.js App Router (`src/app/page.tsx`) with zero separate sub-pages.
- **Exactly One Smart Contract**: `PlantLog.sol` stores all plant registrations, watering histories, and growth milestones directly on the blockchain.
- **No Backend / No Database**: All state is retrieved directly from Botchain Testnet via RPC and wagmi/viem.
- **No Tokens / No NFTs**: Pure, clean on-chain data tracking without tokenomics or NFT clutter.
- **Gardening-Inspired Interface**: Tailored natural color palette featuring deep botanical greens, warm creams, soft whites, and earthy terracotta browns with subtle foliage motifs.

---

## 🌐 Network Information: Botchain Testnet

- **Network Name**: Botchain Testnet
- **Chain ID**: `968`
- **RPC Endpoint**: [https://rpc.bohr.life](https://rpc.bohr.life)
- **Currency Symbol**: `BOT`
- **Block Explorer**: [https://scan.bohr.life](https://scan.bohr.life)

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
- **MetaMask** browser extension configured with Botchain Testnet (Chain ID 968)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your deployer private key (for contract deployment) and the deployed contract address:
```env
BOTCHAIN_RPC_URL=https://rpc.bohr.life
NEXT_PUBLIC_BOTCHAIN_RPC_URL=https://rpc.bohr.life
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS=0x3Aa5ebB10DC797CAC828524e59A333d0A371443c
```

---

## 🧪 Testing Smart Contracts

Run the comprehensive Hardhat test suite (15 unit tests covering registration, access control, watering, growth, removal, and queries):

```bash
npm test
# or: npx hardhat test
```

Test coverage includes:
- ✅ Successful registration with valid name & species
- ✅ Rejection of empty name/species
- ✅ Incremental plant ID and global counter tracking
- ✅ Owner logging watering with volume & notes
- ✅ Owner recording growth with height & notes
- ✅ Emission of `PlantRegistered`, `PlantWatered`, `GrowthRecorded`, and `PlantRemoved`
- ✅ Unauthorized write attempts reverted with `"PlantLog: Not plant owner"`
- ✅ Removing plants from active tracking and rejecting writes to archived plants
- ✅ Retrieval of user plants, active plants, and global stats

---

## 🛠️ Deploying to Botchain Testnet

Compile contracts:
```bash
npm run compile
```

Deploy to Botchain Testnet (Chain ID 968):
```bash
npm run deploy:botchain
```
The deployment script will automatically print the deployed contract address and save it to `src/lib/contractAddress.json` for the frontend.

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

1. **Navigation**: Displays PlantLog branding, current network badge (Botchain 968), and one-click MetaMask connect/disconnect button.
2. **Hero Headline**: *"A Little Care Goes a Long Way."* with instant action buttons to register a plant or view the contract on Botchain Explorer.
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
6. **Live Blockchain Feedback**: Real-time transaction confirmation notifications with direct links to the Botchain Block Explorer (`https://scan.bohr.life/tx/...`).

