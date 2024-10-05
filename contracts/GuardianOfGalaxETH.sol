// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract GuardianOfGalaxETH is ReentrancyGuard, Ownable {
    struct Player {
        uint256 stakedAmount;
        uint256 gethBalance;
        uint256 reputation;
        bool isActive;
    }

    struct Alliance {
        address[] members;
        uint256 formationTime;
    }

    struct Community {
        address[] members;
        uint256 formationTime;
        uint256 totalStake;
    }

    struct Moloch {
        uint256 attackPower;
        string weakness;
        bool isDefeated;
    }

    struct Artifact {
        string name;
        uint256 power;
    }

    struct Vote {
        uint256 artifactIndex;
        uint256 voteCount;
    }

    mapping(address => Player) public players;
    mapping(address => address[]) public playerAlliances;
    mapping(bytes32 => Alliance) public alliances;
    mapping(bytes32 => Community) public communities;
    mapping(address => bytes32) public playerCommunity;
    mapping(bytes32 => mapping(address => Vote)) public communityVotes;
    mapping(bytes32 => uint256) public communityVotingEndTime;
    Moloch public currentMoloch;
    Artifact[] public artifacts;
    mapping(address => uint256) public lastCollectionTime;
    uint256 public constant MINERAL_RATE = 1 ether; // 1 GETH per second
    mapping(address => uint256) public lastUpdateTime;

    uint256 public constant COLLECTION_COOLDOWN = 1 hours;
    uint256 public constant BASE_COLLECTION_AMOUNT = 100; // 基础收集量
    uint256 public constant ALLIANCE_COOLDOWN = 1 days;
    uint256 public constant OBSTACLE_BASE_DIFFICULTY = 1000;
    uint256 public constant MIN_COMMUNITY_SIZE = 3;
    uint256 public constant VOTING_PERIOD = 1 days;
    uint256 public constant MIN_STAKE = 0.00001 ether;

    event PlayerJoined(address indexed player, uint256 stakedAmount);
    event PlayerCollected(address indexed player, uint256 amount);
    event AllianceFormed(address indexed player1, address indexed player2);
    event ObstacleDefeated(address indexed player, uint256 difficulty, uint256 reward);
    event CommunityFormed(bytes32 indexed communityId, address[] members, uint256 totalStake);
    event MolochAppeared(uint256 attackPower, string weakness);
    event MolochDefeated(bytes32 indexed communityId, uint256 reward);
    event ArtifactAdded(string name, uint256 power);
    event VoteCast(address indexed voter, bytes32 indexed communityId, uint256 artifactIndex, uint256 voteCount);
    event VotingEnded(bytes32 indexed communityId, uint256 winningArtifactIndex);
    event MineralsCollected(address indexed player, uint256 amount);
    event PlayerLeft(address indexed player, uint256 totalAmount);

    constructor() Ownable(msg.sender) {
    }

    function joinGame() external payable nonReentrant {
        require(!players[msg.sender].isActive, "Player already in game");
        require(msg.value >= MIN_STAKE, "Insufficient stake");

        players[msg.sender] = Player({
            stakedAmount: msg.value,
            gethBalance: 0,
            reputation: 0,
            isActive: true
        });
        lastUpdateTime[msg.sender] = block.timestamp;

        emit PlayerJoined(msg.sender, msg.value);
    }

    function updateMinerals(address player) public {
        require(players[player].isActive, "Player not in game");
        uint256 elapsedTime = block.timestamp - lastUpdateTime[player];
        uint256 newMinerals = elapsedTime * MINERAL_RATE / 1 ether;
        players[player].gethBalance += newMinerals;
        lastUpdateTime[player] = block.timestamp;
    }

    function getMinerals(address player) public view returns (uint256) {
        if (!players[player].isActive) return 0;
        uint256 elapsedTime = block.timestamp - lastUpdateTime[player];
        uint256 newMinerals = elapsedTime * MINERAL_RATE / 1 ether;
        return players[player].gethBalance + newMinerals;
    }

    // TODO: Implement collect, alliance, and fight mechanics

    function leaveGame() external nonReentrant {
        Player storage player = players[msg.sender];
        require(player.isActive, "Player not in game");

        uint256 totalAmount = player.stakedAmount + player.gethBalance;
        player.isActive = false;
        player.stakedAmount = 0;
        player.gethBalance = 0;

        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");

        emit PlayerLeft(msg.sender, totalAmount);
    }

    // Additional functions will be implemented here

    function collectMinerals() external nonReentrant {
        Player storage player = players[msg.sender];
        require(player.isActive, "Player not in game");
        require(block.timestamp >= lastCollectionTime[msg.sender] + COLLECTION_COOLDOWN, "Collection cooldown not met");

        uint256 collectionAmount = calculateCollectionAmount(player.stakedAmount);
        player.gethBalance += collectionAmount;
        lastCollectionTime[msg.sender] = block.timestamp;

        emit MineralsCollected(msg.sender, collectionAmount);
    }

    function calculateCollectionAmount(uint256 stakedAmount) internal pure returns (uint256) {
        // 简单的计算公式：基础收集量 + 质押量的平方根
        return BASE_COLLECTION_AMOUNT + sqrt(stakedAmount);
    }

    // 辅助函数：计算平方根
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function proposeAlliance(address _otherPlayer) external nonReentrant {
        require(players[msg.sender].isActive && players[_otherPlayer].isActive, "Both players must be active");
        require(!isAllied(msg.sender, _otherPlayer), "Already allied");

        bytes32 allianceId = keccak256(abi.encodePacked(msg.sender, _otherPlayer));
        require(alliances[allianceId].formationTime == 0, "Alliance already proposed");

        address[] memory members = new address[](2);
        members[0] = msg.sender;
        members[1] = _otherPlayer;
        alliances[allianceId] = Alliance(members, block.timestamp);
    }

    function acceptAlliance(address _proposer) external nonReentrant {
        bytes32 allianceId = keccak256(abi.encodePacked(_proposer, msg.sender));
        Alliance storage alliance = alliances[allianceId];
        
        require(alliance.formationTime != 0, "No alliance proposed");
        require(block.timestamp <= alliance.formationTime + ALLIANCE_COOLDOWN, "Proposal expired");

        playerAlliances[msg.sender].push(_proposer);
        playerAlliances[_proposer].push(msg.sender);

        emit AllianceFormed(_proposer, msg.sender);
        delete alliances[allianceId];
    }

    function defeatObstacle(address _ally) external nonReentrant {
        require(isAllied(msg.sender, _ally), "Not allied");
        
        uint256 difficulty = calculateObstacleDifficulty(msg.sender, _ally);
        uint256 totalStrength = players[msg.sender].gethBalance + players[_ally].gethBalance;
        
        require(totalStrength > difficulty, "Not strong enough to defeat obstacle");

        uint256 reward = calculateReward(difficulty);
        distributeReward(msg.sender, _ally, reward);

        emit ObstacleDefeated(msg.sender, difficulty, reward);
    }

    function isAllied(address _player1, address _player2) public view returns (bool) {
        address[] memory allies = playerAlliances[_player1];
        for (uint i = 0; i < allies.length; i++) {
            if (allies[i] == _player2) {
                return true;
            }
        }
        return false;
    }

    function calculateObstacleDifficulty(address _player1, address _player2) internal view returns (uint256) {
        return OBSTACLE_BASE_DIFFICULTY + (players[_player1].gethBalance + players[_player2].gethBalance) / 2;
    }


    function distributeReward(address _player1, address _player2, uint256 _reward) internal {
        uint256 halfReward = _reward / 2;
        players[_player1].gethBalance += halfReward;
        players[_player2].gethBalance += halfReward;
    }

    // Additional functions will be implemented here

    function formCommunity(address[] memory _members) external nonReentrant {
        require(_members.length >= MIN_COMMUNITY_SIZE, "Community size too small");
        bytes32 communityId = keccak256(abi.encode(_members));
        require(communities[communityId].formationTime == 0, "Community already exists");

        uint256 totalStake = 0;
        for (uint i = 0; i < _members.length; i++) {
            require(players[_members[i]].isActive, "All members must be active players");
            totalStake += players[_members[i]].stakedAmount;
            playerCommunity[_members[i]] = communityId;
        }

        communities[communityId] = Community({
            members: _members,
            formationTime: block.timestamp,
            totalStake: totalStake
        });

        emit CommunityFormed(communityId, _members, totalStake);
    }

    function generateMoloch() external onlyOwner {
        require(currentMoloch.attackPower == 0, "Moloch already exists");
        uint256 attackPower = uint256(keccak256(abi.encodePacked(block.timestamp))) % 1000 + 500;
        string memory weakness = generateWeakness();
        currentMoloch = Moloch(attackPower, weakness, false);
        emit MolochAppeared(attackPower, weakness);
    }

    function generateWeakness() internal view returns (string memory) {
        string[3] memory weaknesses = ["Privacy", "Scalability", "Decentralization"];
        uint256 index = uint256(keccak256(abi.encodePacked(block.timestamp))) % 3;
        return weaknesses[index];
    }

    function voteForArtifact(bytes32 _communityId, uint256 _artifactIndex, uint256 _voteCount) external nonReentrant {
        require(communityVotingEndTime[_communityId] != 0, "Voting has not started");
        require(_artifactIndex < artifacts.length, "Invalid artifact index");
        Community storage community = communities[_communityId];
        require(isCommunitymember(_communityId, msg.sender), "Not a community member");

        uint256 voteCost = _voteCount * _voteCount;
        require(players[msg.sender].gethBalance >= voteCost, "Insufficient GETH balance");

        players[msg.sender].gethBalance -= voteCost;
        communityVotes[_communityId][msg.sender] = Vote(_artifactIndex, _voteCount);

        emit VoteCast(msg.sender, _communityId, _artifactIndex, _voteCount);
    }

    function fightMoloch(uint256 _artifactIndex) external nonReentrant {
        bytes32 communityId = playerCommunity[msg.sender];
        require(communityId != bytes32(0), "Not part of a community");
        require(!currentMoloch.isDefeated, "No active Moloch");

        Community storage community = communities[communityId];
        Artifact memory chosenArtifact = artifacts[_artifactIndex];

        uint256 communityPower = community.totalStake + chosenArtifact.power;
        require(communityPower > currentMoloch.attackPower, "Not strong enough to defeat Moloch");

        uint256 reward = calculateReward(currentMoloch.attackPower);
        distributeCommunityReward(communityId, reward);

        currentMoloch.isDefeated = true;
        emit MolochDefeated(communityId, reward);
    }

    function calculateReward(uint256 _molochPower) internal pure returns (uint256) {
        return _molochPower * 3;
    }

    function distributeCommunityReward(bytes32 _communityId, uint256 _reward) internal {
        Community storage community = communities[_communityId];
        uint256 rewardPerMember = _reward / community.members.length;
        for (uint i = 0; i < community.members.length; i++) {
            players[community.members[i]].gethBalance += rewardPerMember;
        }
    }

    function addArtifact(string memory _name, uint256 _power) external onlyOwner {
        artifacts.push(Artifact(_name, _power));
        emit ArtifactAdded(_name, _power);
    }

    function startVoting(bytes32 _communityId) external {
        Community storage community = communities[_communityId];
        require(community.members.length > 0, "Community does not exist");
        require(communityVotingEndTime[_communityId] == 0, "Voting already started");
        communityVotingEndTime[_communityId] = 1; // Set to 1 to indicate voting has started
    }

    function endVoting(bytes32 _communityId) external {
        require(communityVotingEndTime[_communityId] != 0, "Voting never started");

        uint256[] memory voteCounts = new uint256[](artifacts.length);
        Community storage community = communities[_communityId];

        for (uint i = 0; i < community.members.length; i++) {
            address member = community.members[i];
            Vote memory vote = communityVotes[_communityId][member];
            voteCounts[vote.artifactIndex] += vote.voteCount;
        }

        uint256 winningArtifactIndex = 0;
        uint256 maxVotes = 0;
        for (uint i = 0; i < voteCounts.length; i++) {
            if (voteCounts[i] > maxVotes) {
                maxVotes = voteCounts[i];
                winningArtifactIndex = i;
            }
        }

        emit VotingEnded(_communityId, winningArtifactIndex);
        delete communityVotingEndTime[_communityId];
    }

    function isCommunitymember(bytes32 _communityId, address _player) internal view returns (bool) {
        Community storage community = communities[_communityId];
        for (uint i = 0; i < community.members.length; i++) {
            if (community.members[i] == _player) {
                return true;
            }
        }
        return false;
    }

    function getCommunityMember(bytes32 _communityId, uint256 _index) external view returns (address) {
        require(_index < communities[_communityId].members.length, "Index out of bounds");
        return communities[_communityId].members[_index];
    }

    function getCommunityInfo(bytes32 _communityId) public view returns (address[] memory, uint256, uint256) {
        Community storage community = communities[_communityId];
        return (community.members, community.formationTime, community.totalStake);
    }

    // Additional functions will be implemented here
}