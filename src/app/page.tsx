"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { activeChain, botchainMainnet, botchainTestnet } from "@/lib/chains";
import {
  PLANTLOG_CONFIG,
  PLANTLOG_CONTRACT_ADDRESS,
  PlantData,
  ActivityData,
} from "@/lib/contracts";
import {
  Sprout,
  Droplets,
  Ruler,
  Calendar,
  Plus,
  ExternalLink,
  RefreshCw,
  Archive,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Wallet,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function PlantLogApp() {
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPlantForWater, setSelectedPlantForWater] = useState<PlantData | null>(null);
  const [selectedPlantForGrowth, setSelectedPlantForGrowth] = useState<PlantData | null>(null);
  const [selectedPlantForDetails, setSelectedPlantForDetails] = useState<PlantData | null>(null);
  const [selectedPlantForRemove, setSelectedPlantForRemove] = useState<PlantData | null>(null);

  // Form states
  const [regName, setRegName] = useState("");
  const [regSpecies, setRegSpecies] = useState("");
  const [regDesc, setRegDesc] = useState("");

  const [waterAmount, setWaterAmount] = useState<string>("200");
  const [waterNotes, setWaterNotes] = useState<string>("");

  const [growthHeight, setGrowthHeight] = useState<string>("15");
  const [growthNotes, setGrowthNotes] = useState<string>("");

  // Filter state: "active" | "all"
  const [filterMode, setFilterMode] = useState<"active" | "all">("active");

  // Contract write hook
  const {
    data: txHash,
    writeContract,
    isPending: isWritePending,
    reset: resetWrite,
    error: writeError,
  } = useWriteContract();

  // Transaction receipt hook
  const {
    isLoading: isTxConfirming,
    isSuccess: isTxSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Feedback notification
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
    txHash?: string;
  } | null>(null);

  // Read Global stats
  const {
    data: globalStats,
    refetch: refetchGlobalStats,
    isLoading: isStatsLoading,
  } = useReadContract({
    ...PLANTLOG_CONFIG,
    functionName: "getGlobalStats",
  });

  // Read User Plants
  const {
    data: userPlantsRaw,
    refetch: refetchUserPlants,
    isLoading: isPlantsLoading,
  } = useReadContract({
    ...PLANTLOG_CONFIG,
    functionName: "getPlantsByOwner",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read Activities for detailed view modal
  const {
    data: plantActivitiesRaw,
    refetch: refetchActivities,
    isLoading: isActivitiesLoading,
  } = useReadContract({
    ...PLANTLOG_CONFIG,
    functionName: "getPlantActivities",
    args: selectedPlantForDetails ? [selectedPlantForDetails.id] : undefined,
    query: {
      enabled: !!selectedPlantForDetails,
    },
  });

  // Auto-refetch on tx success
  useEffect(() => {
    if (isTxSuccess && txHash) {
      setNotification({
        type: "success",
        message: "Transaction confirmed successfully on Botchain Testnet!",
        txHash,
      });
      refetchGlobalStats();
      if (address) {
        refetchUserPlants();
      }
      if (selectedPlantForDetails) {
        refetchActivities();
      }
      // Close forms
      setIsRegisterModalOpen(false);
      setSelectedPlantForWater(null);
      setSelectedPlantForGrowth(null);
      setSelectedPlantForRemove(null);
      resetForms();
    }
  }, [isTxSuccess, txHash]);

  // Handle write error
  useEffect(() => {
    if (writeError) {
      const errMessage = writeError.message.includes("User rejected")
        ? "Transaction rejected by user in MetaMask."
        : writeError.message.slice(0, 140);
      setNotification({
        type: "error",
        message: errMessage,
      });
    }
  }, [writeError]);

  const resetForms = () => {
    setRegName("");
    setRegSpecies("");
    setRegDesc("");
    setWaterAmount("200");
    setWaterNotes("");
    setGrowthHeight("15");
    setGrowthNotes("");
  };

  const isWrongNetwork = isConnected && Number(chain?.id) !== Number(activeChain.id);
  const explorerBaseUrl = chain?.blockExplorers?.default?.url || activeChain.blockExplorers.default.url;

  // Format plants
  const userPlants: PlantData[] = useMemo(() => {
    if (!userPlantsRaw) return [];
    return (userPlantsRaw as unknown as PlantData[]).map((p) => ({
      id: BigInt(p.id),
      owner: p.owner,
      name: p.name,
      species: p.species,
      description: p.description,
      registrationDate: BigInt(p.registrationDate),
      isActive: p.isActive,
      wateringCount: BigInt(p.wateringCount),
      growthCount: BigInt(p.growthCount),
      lastWatered: BigInt(p.lastWatered),
      currentHeight: BigInt(p.currentHeight),
    }));
  }, [userPlantsRaw]);

  const filteredPlants = useMemo(() => {
    if (filterMode === "active") {
      return userPlants.filter((p) => p.isActive);
    }
    return userPlants;
  }, [userPlants, filterMode]);

  // Handlers
  const handleRegisterPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regSpecies.trim()) {
      alert("Please provide both a plant name and species.");
      return;
    }
    resetWrite();
    writeContract({
      ...PLANTLOG_CONFIG,
      functionName: "registerPlant",
      args: [regName.trim(), regSpecies.trim(), regDesc.trim()],
    });
  };

  const handleWaterPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantForWater) return;
    const amount = BigInt(waterAmount || "0");
    resetWrite();
    writeContract({
      ...PLANTLOG_CONFIG,
      functionName: "waterPlant",
      args: [selectedPlantForWater.id, amount, waterNotes.trim()],
    });
  };

  const handleRecordGrowth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantForGrowth) return;
    const height = BigInt(growthHeight || "0");
    resetWrite();
    writeContract({
      ...PLANTLOG_CONFIG,
      functionName: "recordGrowth",
      args: [selectedPlantForGrowth.id, height, growthNotes.trim()],
    });
  };

  const handleRemovePlant = () => {
    if (!selectedPlantForRemove) return;
    resetWrite();
    writeContract({
      ...PLANTLOG_CONFIG,
      functionName: "removePlant",
      args: [selectedPlantForRemove.id],
    });
  };

  // Helper date formatters
  const formatDate = (timestampBig: bigint) => {
    if (!timestampBig || timestampBig === BigInt(0)) return "Never";
    const date = new Date(Number(timestampBig) * 1000);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (timestampBig: bigint) => {
    if (!timestampBig || timestampBig === BigInt(0)) return "Never";
    const date = new Date(Number(timestampBig) * 1000);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#233d2c] flex flex-col font-sans selection:bg-nature-200">
      {/* Botanical Decorative Background Patterns */}
      <div className="fixed inset-0 pointer-events-none bg-botanical-dots opacity-60 z-0" />

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5]/90 backdrop-blur-md border-b border-nature-200/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-nature-600 to-nature-800 text-cream-100 flex items-center justify-center shadow-md shadow-nature-700/20 border border-nature-500/30">
              <Sprout className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-serif font-bold tracking-tight text-nature-950">
                  PlantLog
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-nature-100 text-nature-800 border border-nature-200">
                  {chain?.name || activeChain.name}
                </span>
              </div>
              <p className="text-xs text-earth-700 font-medium tracking-wide">
                Grow Something. Track Every Step.
              </p>
            </div>
          </div>

          {/* Wallet and Network Controls */}
          <div className="flex items-center space-x-3">
            {isConnected && isWrongNetwork && (
              <button
                onClick={() => switchChain?.({ chainId: activeChain.id })}
                className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/15 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold hover:bg-amber-500/25 transition-colors animate-pulse"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch to Mainnet</span>
              </button>
            )}

            {!isConnected ? (
              <button
                onClick={() => {
                  const metaMaskConnector =
                    connectors.find((c) => c.id === "metaMask" || c.name === "MetaMask") ||
                    connectors[0];
                  if (metaMaskConnector) {
                    connect({ connector: metaMaskConnector });
                  }
                }}
                disabled={isConnecting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-nature-700 hover:bg-nature-800 text-white font-medium text-sm shadow-sm hover:shadow transition-all border border-nature-800 active:scale-95 disabled:opacity-60"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-cream-100 border border-nature-200 rounded-xl shadow-xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <span className="text-xs font-mono font-medium text-nature-900">
                    {formatShortAddress(address!)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="px-3 py-1.5 rounded-xl bg-earth-100 hover:bg-earth-200 text-earth-800 text-xs font-medium border border-earth-300/60 transition-colors"
                  title="Disconnect wallet"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10 space-y-12">
        {/* Banner Alert for Notification / Pending Tx */}
        {(notification || isWritePending || isTxConfirming) && (
          <div
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between shadow-sm ${
              isWritePending || isTxConfirming
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : notification?.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}
          >
            <div className="flex items-start space-x-3">
              {isWritePending || isTxConfirming ? (
                <RefreshCw className="w-5 h-5 animate-spin text-amber-700 mt-0.5" />
              ) : notification?.type === "error" ? (
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-semibold">
                  {isWritePending
                    ? "Awaiting MetaMask confirmation..."
                    : isTxConfirming
                    ? "Submitting and confirming block on Botchain..."
                    : notification?.message}
                </p>
                {(txHash || notification?.txHash) && (
                  <a
                    href={`${explorerBaseUrl}/tx/${txHash || notification?.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs underline font-medium hover:opacity-80"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            {notification && !isWritePending && !isTxConfirming && (
              <button
                onClick={() => setNotification(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-nature-900 via-nature-800 to-earth-900 text-cream-50 p-8 sm:p-12 shadow-xl border border-nature-700/60">
          {/* Subtle leaf art overlay */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <svg width="400" height="400" viewBox="0 0 200 200" fill="none">
              <path
                d="M40 180 C40 100 120 40 180 20 C180 80 120 160 40 180 Z"
                fill="currentColor"
              />
              <path
                d="M40 180 C80 140 130 100 180 20"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-nature-700/60 border border-nature-500/40 text-nature-200 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-nature-300" />
              <span>Immutable On-Chain Botanical Log</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-cream-50 leading-[1.15]">
              A Little Care Goes a Long Way.
            </h1>
            <p className="text-nature-200/90 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
              Register each companion plant permanently to the blockchain. Log
              every watering session, measure weekly growth milestones, and build
              a lifelong immutable history of your living garden.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isConnected ? (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-cream-100 hover:bg-white text-nature-950 font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Register New Plant</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const metaMaskConnector =
                      connectors.find((c) => c.id === "metaMask") || connectors[0];
                    if (metaMaskConnector) connect({ connector: metaMaskConnector });
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-cream-100 hover:bg-white text-nature-950 font-semibold text-sm shadow-md transition-all active:scale-95"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet to Begin</span>
                </button>
              )}

              <a
                href={`${explorerBaseUrl}/address/${PLANTLOG_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-nature-800/80 hover:bg-nature-700/80 text-cream-100 font-medium text-sm border border-nature-600/50 transition-colors"
              >
                <span>Verified Contract</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Counters & On-chain Statistics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-white border border-nature-200/80 shadow-xs flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-nature-100 text-nature-700 flex items-center justify-center border border-nature-200">
              <Sprout className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                Total Plants
              </p>
              <p className="text-2xl font-serif font-bold text-nature-950 mt-0.5">
                {isStatsLoading ? "..." : globalStats ? Number(globalStats[0]) : 0}
              </p>
              <p className="text-[11px] text-stone-500">Registered on Botchain</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-nature-200/80 shadow-xs flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <Droplets className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                Watering Records
              </p>
              <p className="text-2xl font-serif font-bold text-nature-950 mt-0.5">
                {isStatsLoading ? "..." : globalStats ? Number(globalStats[1]) : 0}
              </p>
              <p className="text-[11px] text-stone-500">Sessions recorded</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-nature-200/80 shadow-xs flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Ruler className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                Growth Milestones
              </p>
              <p className="text-2xl font-serif font-bold text-nature-950 mt-0.5">
                {isStatsLoading ? "..." : globalStats ? Number(globalStats[2]) : 0}
              </p>
              <p className="text-[11px] text-stone-500">Height & leaf logs</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-nature-200/80 shadow-xs flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-earth-100 text-earth-800 flex items-center justify-center border border-earth-200">
              <BookOpen className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-earth-700 uppercase tracking-wider">
                Your Greenery
              </p>
              <p className="text-2xl font-serif font-bold text-nature-950 mt-0.5">
                {isConnected ? userPlants.filter((p) => p.isActive).length : 0}
              </p>
              <p className="text-[11px] text-stone-500">Active tracked plants</p>
            </div>
          </div>
        </section>

        {/* My Plants Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-nature-200/80">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-nature-950">
                  My Plants
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-nature-100 text-nature-800 border border-nature-200">
                  {filteredPlants.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-earth-700 mt-1">
                Your living botanical collection recorded on-chain.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-cream-200/80 border border-nature-200">
                <button
                  onClick={() => setFilterMode("active")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filterMode === "active"
                      ? "bg-white text-nature-900 shadow-xs font-semibold"
                      : "text-earth-700 hover:text-nature-900"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filterMode === "all"
                      ? "bg-white text-nature-900 shadow-xs font-semibold"
                      : "text-earth-700 hover:text-nature-900"
                  }`}
                >
                  All ({userPlants.length})
                </button>
              </div>

              {isConnected && (
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-nature-700 hover:bg-nature-800 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Plant</span>
                </button>
              )}
            </div>
          </div>

          {/* Plant Grid or Empty States */}
          {!isConnected ? (
            <div className="rounded-3xl border-2 border-dashed border-nature-200 bg-white/60 p-12 text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-cream-100 border border-nature-200 flex items-center justify-center text-nature-700">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-serif font-bold text-nature-900">
                  Wallet Not Connected
                </h3>
                <p className="text-xs sm:text-sm text-earth-700 leading-relaxed">
                  Connect your MetaMask wallet to view your personal botanical
                  records, water your plants, and track their growth.
                </p>
              </div>
              <button
                onClick={() => {
                  const metaMaskConnector =
                    connectors.find((c) => c.id === "metaMask") || connectors[0];
                  if (metaMaskConnector) connect({ connector: metaMaskConnector });
                }}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-nature-700 hover:bg-nature-800 text-white font-medium text-sm shadow-xs transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect MetaMask</span>
              </button>
            </div>
          ) : isPlantsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-nature-100 p-6 space-y-4 animate-pulse"
                >
                  <div className="h-6 w-3/4 bg-nature-100 rounded-lg" />
                  <div className="h-4 w-1/2 bg-cream-200 rounded" />
                  <div className="h-16 bg-cream-100 rounded-xl" />
                  <div className="h-10 bg-nature-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-nature-200 bg-white/70 p-12 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-nature-100 text-nature-700 flex items-center justify-center border border-nature-200">
                <Sprout className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-serif font-bold text-nature-950">
                  {filterMode === "active"
                    ? "No Active Plants Found"
                    : "Your Garden is Fresh & Ready"}
                </h3>
                <p className="text-xs sm:text-sm text-earth-700 leading-relaxed">
                  {filterMode === "active"
                    ? "You do not have any currently active plants. Register a new plant or view archived plants."
                    : "Register your first houseplant, herb, or outdoor companion to start your journey."}
                </p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-nature-700 hover:bg-nature-800 text-white font-medium text-sm shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Register Plant Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlants.map((plant) => (
                <div
                  key={plant.id.toString()}
                  className={`group relative rounded-3xl bg-white border p-6 plant-card-shadow plant-card-hover flex flex-col justify-between ${
                    plant.isActive
                      ? "border-nature-200/80"
                      : "border-stone-200 opacity-75 bg-stone-50/70"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header badge & status */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-cream-200 text-earth-800 border border-nature-200 font-semibold">
                        #{plant.id.toString()}
                      </span>
                      {plant.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                          <span>Archived</span>
                        </span>
                      )}
                    </div>

                    {/* Plant Titles */}
                    <div>
                      <h3 className="text-xl font-serif font-bold text-nature-950 group-hover:text-nature-700 transition-colors">
                        {plant.name}
                      </h3>
                      <p className="text-xs font-serif italic text-earth-700 mt-0.5">
                        {plant.species}
                      </p>
                    </div>

                    {/* Description excerpt */}
                    {plant.description && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-cream-50 p-2.5 rounded-xl border border-nature-100">
                        {plant.description}
                      </p>
                    )}

                    {/* Plant Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-nature-50/70 border border-nature-100 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-nature-700 flex items-center space-x-1">
                          <Droplets className="w-3 h-3 text-sky-600" />
                          <span>Waterings</span>
                        </span>
                        <p className="font-semibold text-nature-950 text-sm">
                          {plant.wateringCount.toString()} times
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-nature-50/70 border border-nature-100 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-nature-700 flex items-center space-x-1">
                          <Ruler className="w-3 h-3 text-amber-600" />
                          <span>Current Height</span>
                        </span>
                        <p className="font-semibold text-nature-950 text-sm">
                          {plant.currentHeight > BigInt(0)
                            ? `${plant.currentHeight.toString()} cm`
                            : "Not measured"}
                        </p>
                      </div>
                    </div>

                    {/* Registration & Care timestamps */}
                    <div className="space-y-1 pt-1 text-[11px] text-earth-700 border-t border-nature-100">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1 text-stone-500">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>Registered:</span>
                        </span>
                        <span className="font-medium text-stone-700">
                          {formatDate(plant.registrationDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1 text-stone-500">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Last Watered:</span>
                        </span>
                        <span className="font-medium text-stone-700">
                          {formatDate(plant.lastWatered)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-4 border-t border-nature-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedPlantForWater(plant)}
                        disabled={!plant.isActive}
                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-medium text-xs border border-sky-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={plant.isActive ? "Log watering" : "Plant is archived"}
                      >
                        <Droplets className="w-3.5 h-3.5 text-sky-600" />
                        <span>Water</span>
                      </button>

                      <button
                        onClick={() => setSelectedPlantForGrowth(plant)}
                        disabled={!plant.isActive}
                        className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-xs border border-amber-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={plant.isActive ? "Log growth" : "Plant is archived"}
                      >
                        <Ruler className="w-3.5 h-3.5 text-amber-600" />
                        <span>Growth</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setSelectedPlantForDetails(plant)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-nature-700 hover:text-nature-900 group-hover:underline"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Activity History</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>

                      {plant.isActive && (
                        <button
                          onClick={() => setSelectedPlantForRemove(plant)}
                          className="text-stone-400 hover:text-rose-600 p-1 transition-colors rounded-lg"
                          title="Remove from active tracking"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-nature-200/80 bg-[#f8f5ef] py-8 text-xs text-earth-700 z-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-nature-700" />
            <span className="font-serif font-bold text-nature-900">PlantLog</span>
            <span>—</span>
            <span>Grow Something. Track Every Step.</span>
          </div>

          <div className="flex items-center space-x-4 text-stone-600">
            <span>{activeChain.name} (ID {activeChain.id})</span>
            <span>•</span>
            <a
              href={activeChain.blockExplorers.default.url}
              target="_blank"
              rel="noreferrer"
              className="hover:underline flex items-center space-x-1"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* ================= MODAL: REGISTER PLANT ================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-nature-200 space-y-6">
            <div className="flex items-center justify-between border-b border-nature-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="h-10 w-10 rounded-xl bg-nature-100 text-nature-700 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-nature-950">
                    Register a New Plant
                  </h3>
                  <p className="text-xs text-earth-700">
                    Creates a permanent on-chain botanical record.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPlant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Plant Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monstera Deliciosa, Desk Basil"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nature-500 text-sm text-nature-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Species / Variety <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monstera deliciosa, Ocimum basilicum"
                  value={regSpecies}
                  onChange={(e) => setRegSpecies(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nature-500 text-sm text-nature-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Care Notes / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Placed in living room with bright indirect sunlight. Water every 7 days."
                  value={regDesc}
                  onChange={(e) => setRegDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-nature-500 text-sm text-nature-950 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWritePending || isTxConfirming}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-nature-700 hover:bg-nature-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {isWritePending || isTxConfirming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Recording On-Chain...</span>
                    </>
                  ) : (
                    <>
                      <Sprout className="w-4 h-4" />
                      <span>Confirm Registration</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WATER PLANT ================= */}
      {selectedPlantForWater && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-nature-200 space-y-6">
            <div className="flex items-center justify-between border-b border-nature-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-nature-950">
                    Water {selectedPlantForWater.name}
                  </h3>
                  <p className="text-xs text-earth-700">
                    Record hydration & fertilizer details on-chain.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlantForWater(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWaterPlant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Water Volume (ml)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="200"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-nature-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Watering Notes / Nutrients
                </label>
                <input
                  type="text"
                  placeholder="e.g. Added seaweed extract, bottom-watered soak"
                  value={waterNotes}
                  onChange={(e) => setWaterNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm text-nature-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlantForWater(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWritePending || isTxConfirming}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {isWritePending || isTxConfirming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Logging...</span>
                    </>
                  ) : (
                    <>
                      <Droplets className="w-4 h-4" />
                      <span>Log Watering</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD GROWTH ================= */}
      {selectedPlantForGrowth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-nature-200 space-y-6">
            <div className="flex items-center justify-between border-b border-nature-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-nature-950">
                    Measure Growth: {selectedPlantForGrowth.name}
                  </h3>
                  <p className="text-xs text-earth-700">
                    Record plant height and physical progress.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlantForGrowth(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordGrowth} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="15"
                  value={growthHeight}
                  onChange={(e) => setGrowthHeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-nature-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-800 uppercase tracking-wider mb-1.5">
                  Growth Observation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Two new leaves unfurled, vibrant green stem"
                  value={growthNotes}
                  onChange={(e) => setGrowthNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-nature-200 bg-cream-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-nature-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlantForGrowth(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs sm:text-sm font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWritePending || isTxConfirming}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50"
                >
                  {isWritePending || isTxConfirming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Logging...</span>
                    </>
                  ) : (
                    <>
                      <Ruler className="w-4 h-4" />
                      <span>Log Milestone</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PLANT DETAILS & ACTIVITY HISTORY ================= */}
      {selectedPlantForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-nature-200 space-y-6 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-nature-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-serif font-bold text-nature-950">
                    {selectedPlantForDetails.name}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-cream-200 text-earth-800">
                    ID #{selectedPlantForDetails.id.toString()}
                  </span>
                </div>
                <p className="text-xs font-serif italic text-earth-700 mt-0.5">
                  {selectedPlantForDetails.species}
                </p>
              </div>
              <button
                onClick={() => setSelectedPlantForDetails(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview stats pill */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-cream-50 border border-nature-100 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-700">
                  Registered
                </span>
                <p className="font-semibold text-nature-950 mt-0.5">
                  {formatDate(selectedPlantForDetails.registrationDate)}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-700">
                  Waterings
                </span>
                <p className="font-semibold text-nature-950 mt-0.5">
                  {selectedPlantForDetails.wateringCount.toString()} sessions
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-700">
                  Height
                </span>
                <p className="font-semibold text-nature-950 mt-0.5">
                  {selectedPlantForDetails.currentHeight > BigInt(0)
                    ? `${selectedPlantForDetails.currentHeight.toString()} cm`
                    : "Not logged"}
                </p>
              </div>
            </div>

            {selectedPlantForDetails.description && (
              <div className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-100">
                <span className="font-semibold text-earth-800 block mb-0.5">
                  Care Guidelines:
                </span>
                {selectedPlantForDetails.description}
              </div>
            )}

            {/* Activity History Log */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-serif font-bold text-nature-950 uppercase tracking-wide">
                  Plant Activity History
                </h4>
                <button
                  onClick={() => refetchActivities()}
                  className="text-xs text-nature-700 hover:text-nature-900 flex items-center space-x-1"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isActivitiesLoading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
              </div>

              {isActivitiesLoading ? (
                <div className="py-8 text-center text-xs text-stone-500 animate-pulse">
                  Loading on-chain activity timeline...
                </div>
              ) : !plantActivitiesRaw ||
                (plantActivitiesRaw as unknown as ActivityData[]).length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-cream-50/60 border border-dashed border-nature-200 space-y-1">
                  <p className="text-xs text-earth-800 font-semibold">
                    No activities recorded yet
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Log your first watering or growth observation to begin the
                    timeline.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-nature-200">
                  {(plantActivitiesRaw as unknown as ActivityData[])
                    .slice()
                    .reverse()
                    .map((act, index) => {
                      const isWatering = Number(act.activityType) === 0;
                      return (
                        <div
                          key={index}
                          className="relative flex items-start space-x-4 pl-8"
                        >
                          <div
                            className={`absolute left-1.5 top-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                              isWatering
                                ? "bg-sky-500 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            {isWatering ? (
                              <Droplets className="w-2.5 h-2.5" />
                            ) : (
                              <Ruler className="w-2.5 h-2.5" />
                            )}
                          </div>
                          <div className="flex-1 p-3 rounded-2xl bg-white border border-nature-100 shadow-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-semibold ${
                                  isWatering ? "text-sky-800" : "text-amber-800"
                                }`}
                              >
                                {isWatering
                                  ? `Watered ${
                                      BigInt(act.value) > BigInt(0)
                                        ? `(${act.value.toString()} ml)`
                                        : ""
                                    }`
                                  : `Growth Logged ${
                                      BigInt(act.value) > BigInt(0)
                                        ? `(${act.value.toString()} cm)`
                                        : ""
                                    }`}
                              </span>
                              <span className="text-[10px] text-stone-500">
                                {formatDateTime(BigInt(act.timestamp))}
                              </span>
                            </div>
                            {act.notes && (
                              <p className="text-xs text-stone-600">
                                {act.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-nature-100 flex justify-end">
              <button
                onClick={() => setSelectedPlantForDetails(null)}
                className="px-5 py-2 rounded-xl bg-nature-700 hover:bg-nature-800 text-white text-xs font-semibold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ARCHIVE / REMOVE PLANT ================= */}
      {selectedPlantForRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nature-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Remove from Active Tracking?
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Are you sure you want to remove <strong>{selectedPlantForRemove.name}</strong> from
              active tracking? The records and activity history will remain permanently on-chain,
              but further waterings and updates will be deactivated.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedPlantForRemove(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePlant}
                disabled={isWritePending || isTxConfirming}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isWritePending || isTxConfirming ? "Confirming..." : "Deactivate Plant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

