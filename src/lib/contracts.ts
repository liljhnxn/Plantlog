import { PLANTLOG_ABI } from "./contractAbi";
import contractAddressConfig from "./contractAddress.json";

// Default to deployed address or env variable or null address placeholder
export const PLANTLOG_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS ||
  (contractAddressConfig as { address?: string }).address ||
  "0x0000000000000000000000000000000000000000"
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

