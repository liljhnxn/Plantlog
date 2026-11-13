import { PLANTLOG_ABI } from "./contractAbi";
import contractAddressConfig from "./contractAddress.json";

// Mainnet Contract Address for PlantLog (Chain ID: 677)
export const PLANTLOG_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS ||
  (contractAddressConfig as { address?: string }).address ||
  "0xd366385F4d44E1250CCAF37566b690E996849769"
) as `0x${string}`;

export const PLANTLOG_CONFIG = {
  address: PLANTLOG_CONTRACT_ADDRESS,
  abi: PLANTLOG_ABI,
} as const;

export interface PlantData {
  id: bigint;
  owner: string;
  name: string;
  species: string;
  description: string;
  registrationDate: bigint;
  isActive: boolean;
  wateringCount: bigint;
  growthCount: bigint;
  lastWatered: bigint;
  currentHeight: bigint;
}

export interface ActivityData {
  activityType: number; // 0 = Watering, 1 = Growth
  timestamp: bigint;
  notes: string;
  value: bigint;
}

