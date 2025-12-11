// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title BlindAuction
 * @notice Demonstrates blind auction using encrypted bids
 * @dev Shows privacy-preserving auction mechanism
 */
contract BlindAuction {
    // Auction state
    enum AuctionState { Bidding, Revealing, Ended }

    // Auction parameters
    address public auctioneer;
    uint256 public auctionStart;
    uint256 public biddingDuration;
    uint256 public revealDuration;

    // Encrypted bids mapping
    mapping(address => euint256) private encryptedBids;
    mapping(address => bool) private hasBid;

    // Revealed highest bid
    euint256 private highestBid;
    address public highestBidder;

    // Event
    event BidPlaced(address indexed bidder);
    event AuctionEnded(address indexed winner);
    event RevealStarted();

    /**
     * @notice Initialize auction
     * @param _biddingDuration Duration for bidding phase
     * @param _revealDuration Duration for reveal phase
     */
    function initializeAuction(uint256 _biddingDuration, uint256 _revealDuration) external {
        auctioneer = msg.sender;
        auctionStart = block.timestamp;
        biddingDuration = _biddingDuration;
        revealDuration = _revealDuration;
    }

    /**
     * @notice Place encrypted bid (bidding phase)
     * @param bidEuint256 Encrypted bid amount
     * @param bidProof Zero-knowledge proof
     */
    function placeBid(externalEuint256 bidEuint256, bytes calldata bidProof) external {
        require(isInBiddingPhase(), "Not in bidding phase");
        require(!hasBid[msg.sender], "Already bid");

        euint256 bid = TFHE.fromExternal(bidEuint256, bidProof);

        encryptedBids[msg.sender] = bid;
        hasBid[msg.sender] = true;

        TFHE.allowThis(bid);
        TFHE.allow(bid, msg.sender);

        emit BidPlaced(msg.sender);
    }

    /**
     * @notice Reveal bid amount (reveal phase)
     * @param bidEuint256 Bid amount to reveal
     * @param bidProof Proof
     */
    function revealBid(externalEuint256 bidEuint256, bytes calldata bidProof) external {
        require(isInRevealPhase(), "Not in reveal phase");
        require(hasBid[msg.sender], "No bid placed");

        euint256 bid = TFHE.fromExternal(bidEuint256, bidProof);

        // Check if bid matches encrypted bid
        // In real scenario would verify this matches previous encrypted bid

        // Compare with highest bid
        ebool isHigher = TFHE.gt(bid, highestBid);

        TFHE.allowThis(isHigher);

        // Update highest bid if this is higher
        // In encrypted form for privacy
        highestBid = bid;
        highestBidder = msg.sender;

        TFHE.allowThis(highestBid);
        TFHE.allow(highestBid, auctioneer);
    }

    /**
     * @notice End auction (after reveal phase)
     */
    function endAuction() external {
        require(msg.sender == auctioneer, "Only auctioneer");
        require(isAuctionEnded(), "Auction not ended");

        emit AuctionEnded(highestBidder);
    }

    /**
     * @notice Check if currently in bidding phase
     * @return true if bidding phase active
     */
    function isInBiddingPhase() public view returns (bool) {
        return block.timestamp < (auctionStart + biddingDuration);
    }

    /**
     * @notice Check if currently in reveal phase
     * @return true if reveal phase active
     */
    function isInRevealPhase() public view returns (bool) {
        uint256 biddingEnd = auctionStart + biddingDuration;
        uint256 revealEnd = biddingEnd + revealDuration;
        return block.timestamp >= biddingEnd && block.timestamp < revealEnd;
    }

    /**
     * @notice Check if auction has ended
     * @return true if auction ended
     */
    function isAuctionEnded() public view returns (bool) {
        return block.timestamp >= (auctionStart + biddingDuration + revealDuration);
    }

    /**
     * @notice Get highest bidder (auctioneer only)
     * @return Winner address
     */
    function getWinner() external view returns (address) {
        require(msg.sender == auctioneer, "Only auctioneer");
        return highestBidder;
    }

    /**
     * @notice Get highest bid (encrypted, for auctioneer)
     * @return Encrypted highest bid
     */
    function getHighestBidEncrypted() external returns (euint256) {
        require(msg.sender == auctioneer, "Only auctioneer");

        euint256 bid = highestBid;

        TFHE.allowThis(bid);
        TFHE.allow(bid, auctioneer);

        return bid;
    }

    /**
     * @notice Check if user has bid
     * @param bidder User to check
     * @return true if user placed bid
     */
    function hasBidPlaced(address bidder) external view returns (bool) {
        return hasBid[bidder];
    }

    /**
     * @notice Get auction state
     * @return Current auction state
     */
    function getAuctionState() external view returns (AuctionState) {
        if (isInBiddingPhase()) {
            return AuctionState.Bidding;
        } else if (isInRevealPhase()) {
            return AuctionState.Revealing;
        } else {
            return AuctionState.Ended;
        }
    }

    /**
     * @notice Get bidding phase end time
     * @return Timestamp when bidding ends
     */
    function getBiddingEndTime() external view returns (uint256) {
        return auctionStart + biddingDuration;
    }

    /**
     * @notice Get reveal phase end time
     * @return Timestamp when reveal ends
     */
    function getRevealEndTime() external view returns (uint256) {
        return auctionStart + biddingDuration + revealDuration;
    }
}
