// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PlantLog
 * @notice A decentralized on-chain plant tracker where users register plants and record watering and growth activities.
 * @dev Tagline: "Grow Something. Track Every Step."
 */
contract PlantLog {
    enum ActivityType {
        Watering,
        Growth
    }

    struct Activity {
        ActivityType activityType;
        uint256 timestamp;
        string notes;
        uint256 value; // For Watering: amount in ml; For Growth: height in cm
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
        uint256 currentHeight; // Last recorded height in cm (or 0 if none)
    }

    // Incremental plant ID counter
    uint256 private _plantIdCounter;

    // Global counters
    uint256 public totalPlantsRegistered;
    uint256 public totalWateringCount;
    uint256 public totalGrowthCount;

    // plantId => Plant
    mapping(uint256 => Plant) private _plants;

    // plantId => Activity records
    mapping(uint256 => Activity[]) private _plantActivities;

    // owner address => list of plant IDs
    mapping(address => uint256[]) private _ownerPlantIds;

    // Events
    event PlantRegistered(
        uint256 indexed plantId,
        address indexed owner,
        string name,
        string species,
        uint256 timestamp
    );

    event PlantWatered(
        uint256 indexed plantId,
        address indexed owner,
        uint256 amountMl,
        string notes,
        uint256 timestamp
    );

    event GrowthRecorded(
        uint256 indexed plantId,
        address indexed owner,
        uint256 heightCm,
        string notes,
        uint256 timestamp
    );

    event PlantRemoved(
        uint256 indexed plantId,
        address indexed owner,
        uint256 timestamp
    );

    modifier onlyPlantOwner(uint256 plantId) {
        Plant storage plant = _plants[plantId];
        require(plant.id != 0, "PlantLog: Plant does not exist");
        require(plant.owner == msg.sender, "PlantLog: Not plant owner");
        _;
    }

    modifier onlyActivePlant(uint256 plantId) {
        require(_plants[plantId].isActive, "PlantLog: Plant is not actively tracked");
        _;
    }

    /**
     * @notice Register a new plant with name, species, and description.
     * @param name Name given to the plant (e.g. "Monstera Deliciosa", "Basil Buddy")
     * @param species Plant species or variety (e.g. "Monstera deliciosa", "Ocimum basilicum")
     * @param description Brief notes or care instructions
     * @return plantId The newly assigned plant identifier
     */
    function registerPlant(
        string calldata name,
        string calldata species,
        string calldata description
    ) external returns (uint256 plantId) {
        require(bytes(name).length > 0, "PlantLog: Name cannot be empty");
        require(bytes(species).length > 0, "PlantLog: Species cannot be empty");

        _plantIdCounter++;
        plantId = _plantIdCounter;

        _plants[plantId] = Plant({
            id: plantId,
            owner: msg.sender,
            name: name,
            species: species,
            description: description,
            registrationDate: block.timestamp,
            isActive: true,
            wateringCount: 0,
            growthCount: 0,
            lastWatered: 0,
            currentHeight: 0
        });

        _ownerPlantIds[msg.sender].push(plantId);

        totalPlantsRegistered++;

        emit PlantRegistered(plantId, msg.sender, name, species, block.timestamp);
    }

    /**
     * @notice Record a watering activity for a tracked plant.
     * @param plantId ID of the plant
     * @param amountMl Amount of water given in milliliters (can be 0 if unspecified)
     * @param notes Additional observation (e.g. "Used filtered rain water with light fertilizer")
     */
    function waterPlant(
        uint256 plantId,
        uint256 amountMl,
        string calldata notes
    ) external onlyPlantOwner(plantId) onlyActivePlant(plantId) {
        Plant storage plant = _plants[plantId];
        plant.wateringCount++;
        plant.lastWatered = block.timestamp;

        _plantActivities[plantId].push(
            Activity({
                activityType: ActivityType.Watering,
                timestamp: block.timestamp,
                notes: notes,
                value: amountMl
            })
        );

        totalWateringCount++;

        emit PlantWatered(plantId, msg.sender, amountMl, notes, block.timestamp);
    }

    /**
     * @notice Record a growth progress update for a tracked plant.
     * @param plantId ID of the plant
     * @param heightCm Current measured height in centimeters
     * @param notes Observation on new leaves, buds, color, or health
     */
    function recordGrowth(
        uint256 plantId,
        uint256 heightCm,
        string calldata notes
    ) external onlyPlantOwner(plantId) onlyActivePlant(plantId) {
        Plant storage plant = _plants[plantId];
        plant.growthCount++;
        if (heightCm > 0) {
            plant.currentHeight = heightCm;
        }

        _plantActivities[plantId].push(
            Activity({
                activityType: ActivityType.Growth,
                timestamp: block.timestamp,
                notes: notes,
                value: heightCm
            })
        );

        totalGrowthCount++;

        emit GrowthRecorded(plantId, msg.sender, heightCm, notes, block.timestamp);
    }

    /**
     * @notice Remove a plant from active tracking.
     * @param plantId ID of the plant to deactivate
     */
    function removePlant(uint256 plantId)
        external
        onlyPlantOwner(plantId)
        onlyActivePlant(plantId)
    {
        Plant storage plant = _plants[plantId];
        plant.isActive = false;

        emit PlantRemoved(plantId, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieve an individual plant record.
     * @param plantId ID of the plant
     */
    function getPlant(uint256 plantId) external view returns (Plant memory) {
        Plant memory plant = _plants[plantId];
        require(plant.id != 0, "PlantLog: Plant does not exist");
        return plant;
    }

    /**
     * @notice Retrieve the full activity history for a specific plant.
     * @param plantId ID of the plant
     */
    function getPlantActivities(uint256 plantId)
        external
        view
        returns (Activity[] memory)
    {
        require(_plants[plantId].id != 0, "PlantLog: Plant does not exist");
        return _plantActivities[plantId];
    }

    /**
     * @notice Retrieve all plant IDs owned by an address.
     * @param owner Address of the owner
     */
    function getPlantIdsByOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        return _ownerPlantIds[owner];
    }

    /**
     * @notice Retrieve all plant structs owned by an address.
     * @param owner Address of the owner
     */
    function getPlantsByOwner(address owner)
        external
        view
        returns (Plant[] memory)
    {
        uint256[] memory ids = _ownerPlantIds[owner];
        Plant[] memory userPlants = new Plant[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            userPlants[i] = _plants[ids[i]];
        }

        return userPlants;
    }

    /**
     * @notice Retrieve all actively tracked plant structs owned by an address.
     * @param owner Address of the owner
     */
    function getActivePlantsByOwner(address owner)
        external
        view
        returns (Plant[] memory)
    {
        uint256[] memory ids = _ownerPlantIds[owner];
        uint256 activeCount = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (_plants[ids[i]].isActive) {
                activeCount++;
            }
        }

        Plant[] memory activePlants = new Plant[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            if (_plants[ids[i]].isActive) {
                activePlants[index] = _plants[ids[i]];
                index++;
            }
        }

        return activePlants;
    }

    /**
     * @notice Retrieve global counts in a single multicall-friendly call.
     */
    function getGlobalStats()
        external
        view
        returns (
            uint256 totalRegistered,
            uint256 totalWaterings,
            uint256 totalGrowths
        )
    {
        return (totalPlantsRegistered, totalWateringCount, totalGrowthCount);
    }
}

