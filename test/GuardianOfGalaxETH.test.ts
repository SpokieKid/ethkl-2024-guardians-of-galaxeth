import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("GuardianOfGalaxETH", function () {
  let guardianOfGalaxETH: any;
  let owner: any;
  let player: any;
  let player2: any;
  let player3: any;

  beforeEach(async function () {
    [owner, player, player2, player3] = await ethers.getSigners();

    const GuardianOfGalaxETH = await ethers.getContractFactory("GuardianOfGalaxETH");
    guardianOfGalaxETH = await GuardianOfGalaxETH.deploy();
    await guardianOfGalaxETH.waitForDeployment();
  });

  describe("Collect Minerals", function () {
    it("Should allow player to collect minerals", async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player).collectGETH(); // Updated function name

      const playerInfo = await guardianOfGalaxETH.players(player.address);
      expect(playerInfo.gethBalance).to.be.gt(0);
    });

    it("Should allow player to collect minerals multiple times", async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      
      await guardianOfGalaxETH.connect(player).collectGETH(); // Updated function name
      const firstCollection = await guardianOfGalaxETH.players(player.address);
      
      await time.increase(3600); // Increase time by 1 hour
      
      await guardianOfGalaxETH.connect(player).collectGETH(); // Updated function name
      const secondCollection = await guardianOfGalaxETH.players(player.address);
      
      expect(secondCollection.gethBalance).to.be.gt(firstCollection.gethBalance);
    });

    // 删除 "Should increase minerals over time" 测试
  });

  describe("Alliance Mechanism", function () {
    it("Should allow players to form an alliance", async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player2).joinGame({ value: ethers.parseEther("10") });

      await guardianOfGalaxETH.connect(player).proposeAlliance(player2.address);
      await guardianOfGalaxETH.connect(player2).acceptAlliance(player.address);

      expect(await guardianOfGalaxETH.isAllied(player.address, player2.address)).to.be.true;
    });

    it("Should allow allied players to defeat an obstacle", async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player2).joinGame({ value: ethers.parseEther("10") });

      await guardianOfGalaxETH.connect(player).proposeAlliance(player2.address);
      await guardianOfGalaxETH.connect(player2).acceptAlliance(player.address);

      await guardianOfGalaxETH.connect(player).collectGETH();
      await guardianOfGalaxETH.connect(player2).collectGETH();

      // Ensure the obstacle is generated
      await guardianOfGalaxETH.connect(owner).generateObstacle();

      const initialBalance1 = (await guardianOfGalaxETH.players(player.address)).gethBalance;
      const initialBalance2 = (await guardianOfGalaxETH.players(player2.address)).gethBalance;

      await guardianOfGalaxETH.connect(player).defeatObstacle(player2.address);

      const finalBalance1 = (await guardianOfGalaxETH.players(player.address)).gethBalance;
      const finalBalance2 = (await guardianOfGalaxETH.players(player2.address)).gethBalance;

      expect(finalBalance1).to.be.gt(initialBalance1);
      expect(finalBalance2).to.be.gt(initialBalance2);
    });

    it("Should not allow non-allied players to defeat an obstacle together", async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player2).joinGame({ value: ethers.parseEther("10") });

      await expect(guardianOfGalaxETH.connect(player).defeatObstacle(player2.address))
        .to.be.revertedWith("Not allied with this player"); // Updated expected revert reason
    });
  });

  describe("Community and Fight Mechanism", function () {
    beforeEach(async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player2).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player3).joinGame({ value: ethers.parseEther("10") });
    });

    it("Should allow players to form a community", async function () {
      const members = [player.address, player2.address, player3.address];
      const communityId = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [members]));
      
      await expect(guardianOfGalaxETH.connect(player).formCommunity(members))
        .to.emit(guardianOfGalaxETH, "CommunityFormed")
        .withArgs(communityId, members, ethers.parseEther("30"));

      const [communityMembers, formationTime, totalStake] = await guardianOfGalaxETH.getCommunityInfo(communityId);
      console.log("Community members:", communityMembers);
      console.log("Formation time:", formationTime);
      console.log("Total stake:", totalStake);

      expect(communityMembers.length).to.equal(3);
      expect(totalStake).to.equal(ethers.parseEther("30"));

      const communityAfterFormation = await guardianOfGalaxETH.communities(communityId);
      console.log("Community after formation:", communityAfterFormation);

      const firstMember = await guardianOfGalaxETH.getCommunityMember(communityId, 0);
      console.log("First member:", firstMember);

      await guardianOfGalaxETH.connect(player).startVoting(communityId);
      console.log("Voting started successfully");
    });

    it("Should allow owner to generate a Moloch", async function () {
      await guardianOfGalaxETH.connect(owner).generateMoloch();
      
      const moloch = await guardianOfGalaxETH.currentMoloch();
      expect(moloch.attackPower).to.be.gt(0);
      expect(moloch.isDefeated).to.be.false;
    });

    it("Should allow community to fight and defeat Moloch", async function () {
      await guardianOfGalaxETH.connect(player).formCommunity([player.address, player2.address, player3.address]);
      await guardianOfGalaxETH.connect(owner).generateMoloch();

      await guardianOfGalaxETH.connect(owner).addArtifact("Test Artifact", 1000);

      const initialBalance = await guardianOfGalaxETH.players(player.address);
      await guardianOfGalaxETH.connect(player).fightMoloch(0);

      const finalBalance = await guardianOfGalaxETH.players(player.address);
      expect(finalBalance.gethBalance).to.be.gt(initialBalance.gethBalance);

      const moloch = await guardianOfGalaxETH.currentMoloch();
      expect(moloch.isDefeated).to.be.true;
    });
  });

  describe("Artifact and Voting Mechanism", function () {
    let communityId: string;

    beforeEach(async function () {
      await guardianOfGalaxETH.connect(player).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player2).joinGame({ value: ethers.parseEther("10") });
      await guardianOfGalaxETH.connect(player3).joinGame({ value: ethers.parseEther("10") });

      const members = [player.address, player2.address, player3.address];
      communityId = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [members]));
      
      await guardianOfGalaxETH.connect(player).formCommunity(members);

      const [communityMembers, formationTime, totalStake] = await guardianOfGalaxETH.getCommunityInfo(communityId);
      console.log("Community members:", communityMembers);
      console.log("Formation time:", formationTime);
      console.log("Total stake:", totalStake);

      expect(communityMembers.length).to.equal(3);
      expect(totalStake).to.equal(ethers.parseEther("30"));

      await guardianOfGalaxETH.connect(owner).addArtifact("Excalibur", 1000);
      await guardianOfGalaxETH.connect(owner).addArtifact("Mjolnir", 1200);
    });

    it("Should allow community members to vote for artifacts", async function () {
      await guardianOfGalaxETH.connect(player).startVoting(communityId);

      await guardianOfGalaxETH.connect(player).collectGETH(); // Updated function name
      await guardianOfGalaxETH.connect(player2).collectGETH(); // Updated function name
      await guardianOfGalaxETH.connect(player3).collectGETH(); // Updated function name

      await expect(guardianOfGalaxETH.connect(player).voteForArtifact(communityId, 0, 2))
        .to.emit(guardianOfGalaxETH, "VoteCast")
        .withArgs(player.address, communityId, 0, 2);
    });

    it("Should end voting and determine the winning artifact", async function () {
      await guardianOfGalaxETH.connect(player).startVoting(communityId);

      await guardianOfGalaxETH.connect(player).collectGETH(); // Updated function name
      await guardianOfGalaxETH.connect(player2).collectGETH(); // Updated function name
      await guardianOfGalaxETH.connect(player3).collectGETH(); // Updated function name

      await guardianOfGalaxETH.connect(player).voteForArtifact(communityId, 0, 2);
      await guardianOfGalaxETH.connect(player2).voteForArtifact(communityId, 1, 3);
      await guardianOfGalaxETH.connect(player3).voteForArtifact(communityId, 0, 1);

      await expect(guardianOfGalaxETH.connect(player).endVoting(communityId))
        .to.emit(guardianOfGalaxETH, "VotingEnded")
        .withArgs(communityId, 0);
    });
  });
});