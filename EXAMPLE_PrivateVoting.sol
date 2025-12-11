// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title PrivateVoting
 * @notice Demonstrates private voting using encrypted ballots
 * @dev Shows confidential voting mechanism with encrypted vote counts
 */
contract PrivateVoting {
    // Voting proposal
    struct Proposal {
        string description;
        uint256 deadline;
        bool executed;
        uint256 proposalId;
    }

    // Proposal tracking
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Encrypted vote counts for each proposal
    mapping(uint256 => euint256) private yesVotes;
    mapping(uint256 => euint256) private noVotes;

    // Voter tracking per proposal
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // Admin
    address public admin;

    // Events
    event ProposalCreated(uint256 indexed proposalId, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event VotingEnded(uint256 indexed proposalId);

    /**
     * @notice Initialize voting contract
     */
    function initialize() external {
        admin = msg.sender;
        proposalCount = 0;
    }

    /**
     * @notice Create new proposal
     * @param description Proposal description
     * @param votingDuration Duration of voting in seconds
     */
    function createProposal(string memory description, uint256 votingDuration) external {
        require(msg.sender == admin, "Only admin");
        require(votingDuration > 0, "Invalid duration");

        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            description: description,
            deadline: block.timestamp + votingDuration,
            executed: false,
            proposalId: proposalId
        });

        // Initialize encrypted vote counts
        yesVotes[proposalId] = TFHE.asEuint256(0);
        noVotes[proposalId] = TFHE.asEuint256(0);

        TFHE.allowThis(yesVotes[proposalId]);
        TFHE.allowThis(noVotes[proposalId]);

        emit ProposalCreated(proposalId, description);
    }

    /**
     * @notice Cast encrypted vote
     * @param proposalId ID of proposal
     * @param voteEuint256 Encrypted vote (1 = yes, 0 = no)
     * @param voteProof Zero-knowledge proof
     */
    function castVote(uint256 proposalId, externalEuint256 voteEuint256, bytes calldata voteProof) external {
        require(proposalId < proposalCount, "Invalid proposal");
        require(block.timestamp < proposals[proposalId].deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        euint256 vote = TFHE.fromExternal(voteEuint256, voteProof);

        // vote is encrypted so we count it directly
        // If vote = 1, add to yesVotes
        // If vote = 0, add to noVotes

        // Create encrypted 1 - vote for no votes
        euint256 inverseVote = TFHE.sub(TFHE.asEuint256(1), vote);

        // Encrypted conditional logic
        yesVotes[proposalId] = TFHE.add(yesVotes[proposalId], vote);
        noVotes[proposalId] = TFHE.add(noVotes[proposalId], inverseVote);

        TFHE.allowThis(yesVotes[proposalId]);
        TFHE.allowThis(noVotes[proposalId]);

        hasVoted[proposalId][msg.sender] = true;

        emit VoteCast(proposalId, msg.sender);
    }

    /**
     * @notice Get encrypted yes votes (admin only)
     * @param proposalId Proposal ID
     * @return Encrypted vote count
     */
    function getYesVotes(uint256 proposalId) external returns (euint256) {
        require(proposalId < proposalCount, "Invalid proposal");
        require(msg.sender == admin, "Only admin");

        euint256 votes = yesVotes[proposalId];

        TFHE.allowThis(votes);
        TFHE.allow(votes, admin);

        return votes;
    }

    /**
     * @notice Get encrypted no votes (admin only)
     * @param proposalId Proposal ID
     * @return Encrypted vote count
     */
    function getNoVotes(uint256 proposalId) external returns (euint256) {
        require(proposalId < proposalCount, "Invalid proposal");
        require(msg.sender == admin, "Only admin");

        euint256 votes = noVotes[proposalId];

        TFHE.allowThis(votes);
        TFHE.allow(votes, admin);

        return votes;
    }

    /**
     * @notice Check if voter has voted
     * @param proposalId Proposal ID
     * @param voter Voter address
     * @return true if voter has voted
     */
    function hasVoterVoted(uint256 proposalId, address voter) external view returns (bool) {
        require(proposalId < proposalCount, "Invalid proposal");
        return hasVoted[proposalId][voter];
    }

    /**
     * @notice Check if voting is active
     * @param proposalId Proposal ID
     * @return true if voting is ongoing
     */
    function isVotingActive(uint256 proposalId) external view returns (bool) {
        require(proposalId < proposalCount, "Invalid proposal");
        return block.timestamp < proposals[proposalId].deadline && !proposals[proposalId].executed;
    }

    /**
     * @notice Get voting deadline
     * @param proposalId Proposal ID
     * @return Deadline timestamp
     */
    function getDeadline(uint256 proposalId) external view returns (uint256) {
        require(proposalId < proposalCount, "Invalid proposal");
        return proposals[proposalId].deadline;
    }

    /**
     * @notice Get time remaining for voting
     * @param proposalId Proposal ID
     * @return Seconds remaining
     */
    function getTimeRemaining(uint256 proposalId) external view returns (uint256) {
        require(proposalId < proposalCount, "Invalid proposal");

        if (block.timestamp >= proposals[proposalId].deadline) {
            return 0;
        }

        return proposals[proposalId].deadline - block.timestamp;
    }

    /**
     * @notice End voting (admin only)
     * @param proposalId Proposal ID
     */
    function endVoting(uint256 proposalId) external {
        require(msg.sender == admin, "Only admin");
        require(proposalId < proposalCount, "Invalid proposal");
        require(block.timestamp >= proposals[proposalId].deadline, "Voting not ended");

        proposals[proposalId].executed = true;

        emit VotingEnded(proposalId);
    }

    /**
     * @notice Get proposal description
     * @param proposalId Proposal ID
     * @return Proposal description
     */
    function getProposalDescription(uint256 proposalId) external view returns (string memory) {
        require(proposalId < proposalCount, "Invalid proposal");
        return proposals[proposalId].description;
    }

    /**
     * @notice Get proposal count
     * @return Total number of proposals
     */
    function getProposalCount() external view returns (uint256) {
        return proposalCount;
    }

    /**
     * @notice Compare vote counts (admin only, encrypted)
     * @param proposalId Proposal ID
     * @return Result of yes > no comparison
     */
    function yesVotesGreater(uint256 proposalId) external returns (ebool) {
        require(msg.sender == admin, "Only admin");
        require(proposalId < proposalCount, "Invalid proposal");

        ebool result = TFHE.gt(yesVotes[proposalId], noVotes[proposalId]);

        TFHE.allowThis(result);
        TFHE.allow(result, admin);

        return result;
    }
}
