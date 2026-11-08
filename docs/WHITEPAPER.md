# 🌿 PlantLog: Decentralized Botanical Care Ledger
### Technical Whitepaper v1.0
**Tagline:** *"Grow Something. Track Every Step."*  
**Date:** November 2026  
**Network:** Botchain Testnet (Chain ID: 968)  
**Contract Address:** `0xDcc711256542E56B9c0BeF58A9808AB4e33BBE9a`  

---

## 1. Abstract
PlantLog is an ultra-lightweight, decentralized on-chain plant care ledger built on Ethereum-compatible blockchain technology. Conventional plant tracking tools rely heavily on centralized databases, ad-supported freemium platforms, and proprietary ecosystems prone to data loss and corporate shutdowns. PlantLog eliminates database dependency, subscription fees, and artificial financialization (no tokens, no NFTs) in favor of pure, immutable on-chain utility. Through a single smart contract and a single-page reactive interface, users register botanical specimens, track watering volume and nutrients, record height and leaf growth milestones, and maintain a permanent, verifiable proof-of-care history.

---

## 2. Problem Statement
1. **Ephemeral Care Data & Centralized Risk:** Houseplant and urban gardening mobile applications frequently suffer from database deprecation, vendor lock-in, and privacy exploitation. When a service shuts down, years of care records disappear.
2. **Artificial Tokenization & NFT Clutter:** Many Web3 agricultural and green tech attempts introduce unnecessary speculative tokens, minting friction, or expensive NFT layers that distract from utility and introduce volatility.
3. **Lack of Care Provenance:** In rare plant trading (e.g., variegated monstera, rare bonsai, heritage orchids), buyers have no verifiable history of care schedules, watering consistency, or growth trajectory.
4. **Bloated Web3 Architectures:** Most decentralized applications require complex subgraphs, multi-node backend indexing, and relational caches that re-introduce single points of failure.

---

## 3. The PlantLog Solution
PlantLog provides a minimal, self-sustaining protocol governed by three core design tenets:
- **Zero Backend / Zero Database:** Direct RPC communication between client browser (MetaMask / viem) and the blockchain.
- **Zero Tokens / Zero NFTs:** Pure data ledger utilizing standard EVM transactions and gas optimization.
- **Permanent Botanical Provenance:** Every hydration event, measurement milestone, and status alteration is signed by the plant's owner and permanently stored on-chain.

```
+-------------------------------------------------------------+
|                      PlantLog Frontend                       |
|   (Next.js App Router + Tailwind CSS + Wagmi v2 / Viem)     |
+-------------------------------------------------------------+
                               |
               Injected Provider (MetaMask)
                               |
                               v
+-------------------------------------------------------------+
|                   Botchain Testnet (ID 968)                  |
|                 RPC: https://rpc.bohr.life                   |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                       PlantLog.sol                           |
|       (Registration | Watering | Growth | Removal)           |
+-------------------------------------------------------------+
```

---

## 4. Smart Contract Architecture (`PlantLog.sol`)

The protocol is implemented as a single, gas-optimized Solidity smart contract (`0.8.20`) deployed at `0xDcc711256542E56B9c0BeF58A9808AB4e33BBE9a`.

### 4.1 Data Structures
```solidity
enum ActivityType { Watering, Growth }

struct Activity {
    ActivityType activityType;
    uint256 timestamp;
    string notes;
    uint256 value; // Watering: amount in ml; Growth: height in cm
}

struct Plant {
    uint256 id;
    address owner;
    string name;
    string species;
    string description;
    uint256 registrationDate;
    bool isActive;
    uint256 wateringCount;
    uint256 growthCount;
    uint256 lastWatered;
    uint256 currentHeight;
}
```

### 4.2 Security Modifiers & Access Controls
* `onlyPlantOwner(uint256 plantId)`: Strict check guaranteeing `msg.sender == plant.owner`. Reverts with `"PlantLog: Not plant owner"` on unauthorized writes.
* `onlyActivePlant(uint256 plantId)`: Prevents logging against archived or deactivated specimens.

### 4.3 Key Interface Methods
| Method | Type | Description |
| :--- | :--- | :--- |
| `registerPlant(name, species, description)` | State-Changing | Registers new specimen, allocates plant ID, emits `PlantRegistered`. |
| `waterPlant(plantId, amountMl, notes)` | State-Changing | Records hydration timestamp, volume, emits `PlantWatered`. |
| `recordGrowth(plantId, heightCm, notes)` | State-Changing | Updates plant height, appends observation, emits `GrowthRecorded`. |
| `removePlant(plantId)` | State-Changing | Retires plant from active tracking, emits `PlantRemoved`. |
| `getPlant(plantId)` | View | Returns complete plant profile tuple. |
| `getPlantActivities(plantId)` | View | Returns chronological activity log array. |
| `getPlantsByOwner(address)` | View | Returns all user plants (both active and archived). |
| `getActivePlantsByOwner(address)` | View | Returns actively tracked plants only. |
| `getGlobalStats()` | View | Returns total registered plants, waterings, and growth logs. |

---

## 5. Frontend & User Experience
* **Framework:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS.
* **Palette:** Natural botanical greens (`#233d2c`, `#3d724d`), warm creams (`#faf7f0`), soft whites, and earthy terracotta (`#ad7d57`).
* **Wallet Integration:** Automatic Botchain Testnet detection, chain switching to ID 968, and transaction hash monitoring with Bohr Scan links.
* **Responsive Modals:** Accessible dialogs for plant registration, hydration logging, height milestones, and archival confirmation.

---

## 6. Tokenomics
**There is no token.**
* Zero ERC-20 utility tokens, zero governance tokens, zero speculation.
* Users only pay standard network gas fees in native `BOT` tokens to execute state changes.
* Maximizes long-term protocol viability without regulatory risk, inflation, or economic decay.

---

## 7. Roadmap
- **Phase 1 (Completed):** Core contract development, 15 unit tests, Botchain Testnet deployment, contract verification, responsive single-page dApp.
- **Phase 2:** PWA (Progressive Web App) offline caching for offline notes preview, QR code generator per plant ID for physical pot labeling.
- **Phase 3:** Multi-chain deployments on eco-friendly, low-gas Layer 2 networks.
- **Phase 4:** Open botanical taxonomy registry integration and community care guides.

---

## 8. Conclusion
PlantLog demonstrates that blockchain technology excels at simple, durable, verifiable data logging without the baggage of speculative tokens or heavy backend infrastructure. By uniting an elegant gardening design with immutable smart contracts, PlantLog provides gardeners with an unshakeable digital companion for their living plants.
