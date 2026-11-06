import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;
import { PlantLog } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PlantLog Smart Contract", function () {
  let plantLog: PlantLog;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const PlantLogFactory = await ethers.getContractFactory("PlantLog");
    plantLog = (await PlantLogFactory.deploy()) as PlantLog;
    await plantLog.waitForDeployment();
  });

  describe("1. Plant Registration", function () {
    it("should allow a user to register a new plant", async function () {
      const tx = await plantLog
        .connect(user1)
        .registerPlant("Monstera Deliciosa", "Monstera deliciosa", "Living room window, indirect sunlight");

      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const plant = await plantLog.getPlant(1);
      expect(plant.id).to.equal(1);
      expect(plant.owner).to.equal(user1.address);
      expect(plant.name).to.equal("Monstera Deliciosa");
      expect(plant.species).to.equal("Monstera deliciosa");
      expect(plant.description).to.equal("Living room window, indirect sunlight");
      expect(plant.isActive).to.be.true;
      expect(plant.wateringCount).to.equal(0);
      expect(plant.growthCount).to.equal(0);
    });

    it("should emit PlantRegistered event", async function () {
      await expect(
        plantLog.connect(user1).registerPlant("Basil", "Ocimum basilicum", "Kitchen garden")
      )
        .to.emit(plantLog, "PlantRegistered")
        .withArgs(1, user1.address, "Basil", "Ocimum basilicum", (val: any) => val > 0);
    });

    it("should increment global totalPlantsRegistered", async function () {
      expect(await plantLog.totalPlantsRegistered()).to.equal(0);
      await plantLog.connect(user1).registerPlant("Pothos", "Epipremnum aureum", "Hanging basket");
      expect(await plantLog.totalPlantsRegistered()).to.equal(1);
      await plantLog.connect(user2).registerPlant("Snake Plant", "Sansevieria trifasciata", "Bedroom");
      expect(await plantLog.totalPlantsRegistered()).to.equal(2);
    });

    it("should revert if name or species is empty", async function () {
      await expect(
        plantLog.connect(user1).registerPlant("", "Species", "Desc")
      ).to.be.revertedWith("PlantLog: Name cannot be empty");

      await expect(
        plantLog.connect(user1).registerPlant("Name", "", "Desc")
      ).to.be.revertedWith("PlantLog: Species cannot be empty");
    });
  });

  describe("2. Watering Records", function () {
    beforeEach(async function () {
      await plantLog.connect(user1).registerPlant("Fiddle Leaf Fig", "Ficus lyrata", "Near balcony");
    });

    it("should allow owner to log watering activity", async function () {
      const tx = await plantLog.connect(user1).waterPlant(1, 250, "Filtered water, added nutrients");
      await tx.wait();

      const plant = await plantLog.getPlant(1);
      expect(plant.wateringCount).to.equal(1);
      expect(plant.lastWatered).to.be.gt(0);

      const activities = await plantLog.getPlantActivities(1);
      expect(activities.length).to.equal(1);
      expect(activities[0].activityType).to.equal(0); // 0 = Watering
      expect(activities[0].value).to.equal(250);
      expect(activities[0].notes).to.equal("Filtered water, added nutrients");

      expect(await plantLog.totalWateringCount()).to.equal(1);
    });

    it("should emit PlantWatered event", async function () {
      await expect(
        plantLog.connect(user1).waterPlant(1, 300, "Morning mist and soak")
      )
        .to.emit(plantLog, "PlantWatered")
        .withArgs(1, user1.address, 300, "Morning mist and soak", (val: any) => val > 0);
    });

    it("should prevent non-owners from watering a plant", async function () {
      await expect(
        plantLog.connect(user2).waterPlant(1, 200, "Unauthorized water")
      ).to.be.revertedWith("PlantLog: Not plant owner");
    });
  });

  describe("3. Growth Records", function () {
    beforeEach(async function () {
      await plantLog.connect(user1).registerPlant("Bonsai Pine", "Pinus thunbergii", "Desk companion");
    });

    it("should allow owner to record growth milestones", async function () {
      await plantLog.connect(user1).recordGrowth(1, 15, "New bright green shoot sprouted!");

      const plant = await plantLog.getPlant(1);
      expect(plant.growthCount).to.equal(1);
      expect(plant.currentHeight).to.equal(15);

      const activities = await plantLog.getPlantActivities(1);
      expect(activities.length).to.equal(1);
      expect(activities[0].activityType).to.equal(1); // 1 = Growth
      expect(activities[0].value).to.equal(15);
      expect(activities[0].notes).to.equal("New bright green shoot sprouted!");

      expect(await plantLog.totalGrowthCount()).to.equal(1);
    });

    it("should emit GrowthRecorded event", async function () {
      await expect(
        plantLog.connect(user1).recordGrowth(1, 18, "Pruned and measured height")
      )
        .to.emit(plantLog, "GrowthRecorded")
        .withArgs(1, user1.address, 18, "Pruned and measured height", (val: any) => val > 0);
    });

    it("should prevent non-owners from recording growth", async function () {
      await expect(
        plantLog.connect(user2).recordGrowth(1, 20, "Impostor update")
      ).to.be.revertedWith("PlantLog: Not plant owner");
    });
  });

  describe("4. Plant Removal & Status", function () {
    beforeEach(async function () {
      await plantLog.connect(user1).registerPlant("Calathea", "Calathea orbifolia", "High humidity zone");
    });

    it("should allow owner to remove plant from active tracking", async function () {
      await expect(plantLog.connect(user1).removePlant(1))
        .to.emit(plantLog, "PlantRemoved")
        .withArgs(1, user1.address, (val: any) => val > 0);

      const plant = await plantLog.getPlant(1);
      expect(plant.isActive).to.be.false;
    });

    it("should prevent non-owners from removing plant", async function () {
      await expect(plantLog.connect(user2).removePlant(1)).to.be.revertedWith(
        "PlantLog: Not plant owner"
      );
    });

    it("should prevent actions on inactive / removed plants", async function () {
      await plantLog.connect(user1).removePlant(1);

      await expect(
        plantLog.connect(user1).waterPlant(1, 100, "Late water")
      ).to.be.revertedWith("PlantLog: Plant is not actively tracked");

      await expect(
        plantLog.connect(user1).recordGrowth(1, 25, "Ghost growth")
      ).to.be.revertedWith("PlantLog: Plant is not actively tracked");

      await expect(
        plantLog.connect(user1).removePlant(1)
      ).to.be.revertedWith("PlantLog: Plant is not actively tracked");
    });
  });

  describe("5. Querying & Statistics", function () {
    it("should return owner plant lists accurately", async function () {
      await plantLog.connect(user1).registerPlant("Plant A", "Species A", "Notes A");
      await plantLog.connect(user1).registerPlant("Plant B", "Species B", "Notes B");
      await plantLog.connect(user2).registerPlant("Plant C", "Species C", "Notes C");

      const user1Plants = await plantLog.getPlantsByOwner(user1.address);
      expect(user1Plants.length).to.equal(2);
      expect(user1Plants[0].name).to.equal("Plant A");
      expect(user1Plants[1].name).to.equal("Plant B");

      // Deactivate Plant A
      await plantLog.connect(user1).removePlant(1);

      const activePlants = await plantLog.getActivePlantsByOwner(user1.address);
      expect(activePlants.length).to.equal(1);
      expect(activePlants[0].name).to.equal("Plant B");
    });

    it("should return accurate global statistics", async function () {
      await plantLog.connect(user1).registerPlant("A", "SpA", "N");
      await plantLog.connect(user2).registerPlant("B", "SpB", "N");

      await plantLog.connect(user1).waterPlant(1, 100, "W1");
      await plantLog.connect(user1).waterPlant(1, 150, "W2");
      await plantLog.connect(user1).recordGrowth(1, 12, "G1");

      const [totalReg, totalW, totalG] = await plantLog.getGlobalStats();
      expect(totalReg).to.equal(2);
      expect(totalW).to.equal(2);
      expect(totalG).to.equal(1);
    });
  });
});
