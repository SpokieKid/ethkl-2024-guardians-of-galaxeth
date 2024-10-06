// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract GuardianOfGalaxETH is ReentrancyGuard, Ownable  {
    struct Player {
        bool isActive;
        uint256 stakedAmount;
        uint256 gethBalance;
        uint256 reputation;
        uint256 pendingGETH; // Add this line
    }
    mapping(address => uint256) public lastUpdateTime;
    uint256 public constant GETH_RATE = uint256(1 ether) / uint256(1 hours); // 1 GETH per hour

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
        address creator;
        uint256 attackPower;
        string weakness;
        bool isDefeated;
    }

    struct Artifact {
        uint256 id;  // 添加这一行
        string name;
        uint256 power;
    }

    struct Vote {
        uint256 artifactIndex;
        uint256 voteCount;
    }

    struct Obstacle {
        uint256 difficulty;
        uint256 reward;
    }

    mapping(address => Player) public players;
    mapping(address => address[]) public playerAlliances;
    mapping(bytes32 => Alliance) public alliances;
    mapping(bytes32 => Community) public communities;
    mapping(address => bytes32) public playerCommunity;
    mapping(bytes32 => mapping(address => Vote)) public communityVotes;
    mapping(bytes32 => uint256) public communityVotingEndTime;
    Moloch[] public molochs;
    Artifact[] public artifacts;
    mapping(address => uint256) public lastCollectionTime;
    uint256 public constant GETH_PER_COLLECTION = 1 ether; // 每次收集获得 1 GETH

    uint256 public constant COLLECTION_COOLDOWN = 1 hours;
    uint256 public constant BASE_COLLECTION_AMOUNT = 100; // 基础收集量
    uint256 public constant ALLIANCE_COOLDOWN = 1 days;
    uint256 public constant OBSTACLE_BASE_DIFFICULTY = 1000;
    uint256 public constant MIN_COMMUNITY_SIZE = 2; // Changed from 3 to 2
    uint256 public constant VOTING_PERIOD = 1 days;
    uint256 public constant MIN_STAKE = 0.00001 ether;

    Obstacle public currentObstacle;

    event PlayerJoined(address indexed player, uint256 stakedAmount);
    event GETHCollected(address indexed player, uint256 amount);
    event AllianceFormed(address indexed player1, address indexed player2);
    event ObstacleDefeated(address indexed player1, address indexed player2, uint256 difficulty, uint256 reward);
    event CommunityFormed(bytes32 indexed communityId, address[] members, uint256 totalStake);
    event MolochGenerated(uint256 indexed molochId, address indexed creator, uint256 attackPower);
    event MolochDefeated(uint256 indexed molochId, bytes32 indexed communityId, uint256 reward);
    event ArtifactAdded(uint256 indexed id, string name, uint256 power);
    event VoteCast(address indexed voter, bytes32 indexed communityId, uint256 artifactIndex, uint256 voteCount);
    event VotingEnded(bytes32 indexed communityId, uint256 winningArtifactIndex);
    event PlayerLeft(address indexed player, uint256 totalAmount);
    event ObstacleGenerated(uint256 difficulty, uint256 reward);
    event GETHAdded(address indexed player, uint256 amount);

    // 添加这个映射来跟踪所有玩家的地址
    mapping(uint256 => address) public playerAddresses;
    uint256 public playerCount;

    // 在 GuardianOfGalaxETH.sol 中添加
    mapping(address => uint256) public userVotingPower;
    mapping(uint256 => uint256) public artifactVotes;

    constructor() Ownable(msg.sender) {
    }

    function joinGame() external payable nonReentrant {
        require(!players[msg.sender].isActive, "Player already in game");
        require(msg.value >= MIN_STAKE, "Insufficient stake");

        players[msg.sender] = Player({
            isActive: true,
            stakedAmount: msg.value,
            gethBalance: 0,
            reputation: 0,
            pendingGETH: 0  // 添加这一行
        });

        playerAddresses[playerCount] = msg.sender;
        playerCount++;

        emit PlayerJoined(msg.sender, msg.value);
    }

    function updateGETH(address player) public {
        require(players[player].isActive, "Player not in game");
        uint256 elapsedTime = block.timestamp - lastUpdateTime[player];
        uint256 newGETH = elapsedTime * GETH_RATE / 1 ether;
        players[player].gethBalance += newGETH;
        lastUpdateTime[player] = block.timestamp;
    }

    // Remove or comment out the getMinerals function as it's redundant with getGETH

    // Update collectGETH function
    function collectGETH() public {
        require(players[msg.sender].isActive, "Player is not active");
        uint256 gethToCollect = (block.timestamp - lastUpdateTime[msg.sender]) * GETH_RATE / 1 ether;
        players[msg.sender].gethBalance += gethToCollect + players[msg.sender].pendingGETH; // Add pendingGETH
        players[msg.sender].pendingGETH = 0; // Reset pendingGETH
        lastUpdateTime[msg.sender] = block.timestamp;
        emit GETHCollected(msg.sender, gethToCollect + players[msg.sender].pendingGETH);
    }

    // Add this new function
    function addPendingGETH(address _player, uint256 _amount) public {
        require(players[_player].isActive, "Player is not active");
        players[_player].pendingGETH += _amount;
    }

    // TODO: Implement collect, alliance, and fight mechanics

    function leaveGame() external nonReentrant {
        Player storage player = players[msg.sender];
        require(player.isActive, "Player not in game");

        uint256 totalAmount = player.stakedAmount + player.gethBalance;
        player.isActive = false;
        player.stakedAmount = 0;
        player.gethBalance = 0;

        (bool success, ) = payable(msg.sender).call{value: totalAmount}("");
        require(success, "Transfer failed");

        emit PlayerLeft(msg.sender, totalAmount);
    }

    // Additional functions will be implemented here

    function addGETH(address _player, uint256 _amount) external onlyOwner {
        require(_player != address(0), "Invalid player address");
        require(_amount > 0, "Amount must be greater than zero");
        players[_player].gethBalance += _amount;
        emit GETHAdded(_player, _amount);
    }

    function calculateCollectionAmount(uint256 stakedAmount) internal pure returns (uint256) {
        // 简单的计算公式：基础收集量 + 质押量的平根
        return BASE_COLLECTION_AMOUNT + sqrt(stakedAmount);
    }

    // 辅助数：计算平方根
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
        require(isAllied(msg.sender, _ally), "Not allied with this player");
        require(currentObstacle.difficulty > 0, "No active obstacle");
        
        uint256 totalPower = players[msg.sender].gethBalance + players[_ally].gethBalance;
        require(totalPower >= currentObstacle.difficulty, "Not enough power to defeat obstacle");
        
        uint256 reward = currentObstacle.reward;
        players[msg.sender].gethBalance += reward / 2;
        players[_ally].gethBalance += reward / 2;
        
        emit ObstacleDefeated(msg.sender, _ally, currentObstacle.difficulty, reward);
        
        generateObstacleInternal();
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
            playerCommunity[_members[i]] = communityId;  // Set community ID for each member
        }

        communities[communityId] = Community({
            members: _members,
            formationTime: block.timestamp,
            totalStake: totalStake
        });

        emit CommunityFormed(communityId, _members, totalStake);
    }

    function generateMoloch() external {
        require(players[msg.sender].isActive, "Player is not active");
        uint256 attackPower = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 1000 + 500;
        string memory weakness = generateWeakness();
        molochs.push(Moloch(msg.sender, attackPower, weakness, false));
        emit MolochGenerated(molochs.length - 1, msg.sender, attackPower);
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

    function fightMoloch(uint256 _molochId, uint256 _artifactIndex) external nonReentrant {
        require(_molochId < molochs.length, "Invalid Moloch ID");
        Moloch storage moloch = molochs[_molochId];
        require(!moloch.isDefeated, "Moloch already defeated");

        bytes32 communityId = playerCommunity[msg.sender];
        require(communityId != bytes32(0), "Not part of a community");

        Community storage community = communities[communityId];
        Artifact memory chosenArtifact = artifacts[_artifactIndex];

        // Calculate total GETH balance of all community members
        uint256 communityPower = 0;
        for (uint i = 0; i < community.members.length; i++) {
            communityPower += players[community.members[i]].gethBalance;
        }

        // Add artifact power to community power
        uint256 totalCommunityPower = communityPower + chosenArtifact.power;
        require(totalCommunityPower > moloch.attackPower, "Not strong enough to defeat Moloch");

        uint256 reward = calculateReward(moloch.attackPower);
        distributeCommunityReward(communityId, reward);

        moloch.isDefeated = true;
        emit MolochDefeated(_molochId, communityId, reward);
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

    function addArtifact(string memory _name, uint256 _power) public onlyOwner {
        uint256 newArtifactId = artifacts.length;
        artifacts.push(Artifact({
            id: newArtifactId,
            name: _name,
            power: _power
        }));
        emit ArtifactAdded(newArtifactId, _name, _power);
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

        for (uint i = 0; i < communities[_communityId].members.length; i++) {
            address member = communities[_communityId].members[i];
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

    function getCommunityInfo() public view returns (address[] memory, uint256, uint256, uint256) {
        address[] memory members = new address[](1);
        members[0] = msg.sender;
        uint256 totalGETH = players[msg.sender].gethBalance;
        return (members, block.timestamp, 0, totalGETH);
    }

    function generateObstacleInternal() internal {
        uint256 difficulty = uint256(keccak256(abi.encodePacked(block.timestamp))) % 1000 + 500;
        uint256 reward = difficulty * 2;
        currentObstacle = Obstacle(difficulty, reward);
        emit ObstacleGenerated(difficulty, reward);
    }

    // Keep the public function if it's needed for external calls
    function generateObstacle() public onlyOwner {
        uint256 difficulty = uint256(keccak256(abi.encodePacked(block.timestamp))) % 1000 + 500;
        uint256 reward = difficulty * 2;
        currentObstacle = Obstacle(difficulty, reward);
        emit ObstacleGenerated(difficulty, reward);
    }

    function getCurrentObstacle() external view returns (Obstacle memory) {
        return currentObstacle;
    }

    function getActivePlayers() public view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < playerCount; i++) {
            if (players[playerAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        address[] memory activePlayers = new address[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < playerCount; i++) {
            if (players[playerAddresses[i]].isActive) {
                activePlayers[index] = playerAddresses[i];
                index++;
            }
        }
        
        return activePlayers;
    }

    // 获取玩家的矿物数量
    function getGETH(address player) public view returns (uint256) {
        return players[player].gethBalance;
    }

    function getArtifactCount() public view returns (uint256) {
        return artifacts.length;
    }

    function getAllyCount(address player) public view returns (uint256) {
        return playerAlliances[player].length;
    }

    function getAlly(address player, uint256 index) public view returns (address) {
        require(index < playerAlliances[player].length, "Index out of bounds");
        return playerAlliances[player][index];
    }

    function isPlayerInCommunity() public pure returns (bool) {
        return true; // 始终返回 true
    }

    function getPlayerCommunityId(address _player) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_player)); // 返回一个基于玩家地址的固定社区ID
    }

    function setPlayerCommunity(address _player, bytes32 _communityId) public onlyOwner {
        playerCommunity[_player] = _communityId;
    }

    function getUserVotingPower(address user) public view returns (uint256) {
        return userVotingPower[user];
    }

    function submitVotes(address user, uint256[] memory artifactIds, uint256[] memory votes) public {
        require(artifactIds.length == votes.length, "Invalid input");
        uint256 totalCost = 0;
        for (uint256 i = 0; i < votes.length; i++) {
            totalCost += votes[i] * votes[i];
        }
        require(userVotingPower[user] >= totalCost, "Not enough voting power");
        
        userVotingPower[user] -= totalCost;
        for (uint256 i = 0; i < votes.length; i++) {
            artifactVotes[artifactIds[i]] += votes[i] * votes[i];
        }
    }

    function tallyVotes() public view returns (uint256 winningArtifactId, uint256 maxVotes) {
        for (uint256 i = 0; i < artifacts.length; i++) {
            if (artifactVotes[i] > maxVotes) {  // 使用索引 i 而不是 artifacts[i].id
                maxVotes = artifactVotes[i];
                winningArtifactId = i;  // 使用索引 i 作为 artifact ID
            }
        }
    }

    // Add a function to get all active Molochs
    function getActiveMolochs() public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < molochs.length; i++) {
            if (!molochs[i].isDefeated) {
                activeCount++;
            }
        }
        
        uint256[] memory activeMolochIds = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < molochs.length; i++) {
            if (!molochs[i].isDefeated) {
                activeMolochIds[index] = i;
                index++;
            }
        }
        
        return activeMolochIds;
    }
}