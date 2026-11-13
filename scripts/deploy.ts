import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  const network = hre.network.name;
  const currentNetwork = await ethers.provider.getNetwork();
  const chainId = Number(currentNetwork.chainId);

  console.log("-----------------------------------------------");
  console.log(`🌱 Deploying PlantLog Smart Contract to ${network} (Chain ID: ${chainId})...`);
  console.log("-----------------------------------------------");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "native tokens");

  // Get network fee data to ensure minimum safe gas price
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || ethers.parseUnits("20", "gwei");
  console.log("Using gas price:", ethers.formatUnits(gasPrice, "gwei"), "gwei (optimized for minimal fee)");

  const PlantLogFactory = await ethers.getContractFactory("PlantLog");
  
  // Estimate gas
  const deployTx = await PlantLogFactory.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deployTx);
  console.log("Estimated deployment gas units:", estimatedGas.toString());
  const estimatedCost = estimatedGas * gasPrice;
  console.log("Estimated deployment fee:", ethers.formatEther(estimatedCost), "native tokens");

  // Deploy with strict, minimal gas price
  const plantLog = await PlantLogFactory.deploy({
    gasPrice: gasPrice,
  });

  console.log("Transaction submitted, waiting for confirmation...");
  await plantLog.waitForDeployment();

  const contractAddress = await plantLog.getAddress();
  const receipt = await plantLog.deploymentTransaction()?.wait();
  const gasUsed = receipt?.gasUsed || estimatedGas;
  const actualFee = gasUsed * gasPrice;

  console.log("✅ PlantLog deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Actual gas used:", gasUsed.toString());
  console.log("Total gas fee spent:", ethers.formatEther(actualFee), "BOT");

  // Save the deployed address to a shared config file for the Next.js frontend
  const deployedConfig = {
    address: contractAddress,
    network: network,
    chainId: chainId,
    deployedAt: new Date().toISOString(),
    gasUsed: gasUsed.toString(),
    actualFeeBot: ethers.formatEther(actualFee),
  };

  const outputDir = path.join(process.cwd(), "src/lib");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "contractAddress.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployedConfig, null, 2));
  console.log(`📝 Contract address saved to: ${outputPath}`);

  // Update .env file if it exists
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    if (envContent.includes("NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS=.*/,
        `NEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      envContent += `\nNEXT_PUBLIC_PLANTLOG_CONTRACT_ADDRESS=${contractAddress}\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log(`📝 Updated .env with contract address: ${contractAddress}`);
  }
  console.log("-----------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
