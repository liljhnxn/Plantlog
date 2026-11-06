import hre from "hardhat";
const { ethers } = hre;
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("-----------------------------------------------");
  console.log("🌱 Deploying PlantLog Smart Contract...");
  console.log("-----------------------------------------------");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "native tokens");

  const PlantLogFactory = await ethers.getContractFactory("PlantLog");
  const plantLog = await PlantLogFactory.deploy();

  await plantLog.waitForDeployment();

  const contractAddress = await plantLog.getAddress();
  console.log("✅ PlantLog deployed successfully to:", contractAddress);

  // Save the deployed address to a shared config file for the Next.js frontend
  const deployedConfig = {
    address: contractAddress,
    network: "botchain",
    chainId: 968,
    deployedAt: new Date().toISOString(),
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
