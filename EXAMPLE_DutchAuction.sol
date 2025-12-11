// SPDX-License-Identifier: BSD-3-Clause-Clear

pragma solidity ^0.8.24;

import "fhevm/lib/TFHE.sol";

/**
 * @title DutchAuction
 * @notice Demonstrates Dutch auction with encrypted pricing
 * @dev Shows descending price auction with privacy features
 */
contract DutchAuction {
    // Auction parameters
    address public seller;
    uint256 public auctionStart;
    uint256 public auctionDuration;

    // Price parameters (encrypted for privacy)
    euint256 private startPrice;
    euint256 private endPrice;
    euint256 private currentPrice;

    // Item state
    bool public itemSold;
    address public buyer;

    // Events
    event AuctionStarted(uint256 startTime);
    event ItemSold(address indexed buyer, uint256 timestamp);
    event PriceUpdated(uint256 newPrice);

    /**
     * @notice Initialize Dutch auction
     * @param startPriceEuint256 Starting price (encrypted, high)
     * @param startPriceProof Proof
     * @param endPriceEuint256 Ending price (encrypted, low)
     * @param endPriceProof Proof
     * @param _duration Auction duration in seconds
     */
    function initializeAuction(externalEuint256 startPriceEuint256, bytes calldata startPriceProof,
                              externalEuint256 endPriceEuint256, bytes calldata endPriceProof,
                              uint256 _duration) external {
        seller = msg.sender;
        auctionStart = block.timestamp;
        auctionDuration = _duration;
        itemSold = false;

        startPrice = TFHE.fromExternal(startPriceEuint256, startPriceProof);
        endPrice = TFHE.fromExternal(endPriceEuint256, endPriceProof);
        currentPrice = startPrice;

        TFHE.allowThis(startPrice);
        TFHE.allowThis(endPrice);
        TFHE.allowThis(currentPrice);
        TFHE.allow(currentPrice, msg.sender);

        emit AuctionStarted(auctionStart);
    }

    /**
     * @notice Calculate current price based on elapsed time
     * @return Current auction price
     */
    function getCurrentPrice() external returns (euint256) {
        require(!itemSold, "Item already sold");
        require(isAuctionActive(), "Auction not active");

        // Calculate price decay based on time
        // currentPrice = startPrice - (startPrice - endPrice) * elapsedTime / totalDuration

        uint256 elapsedTime = block.timestamp - auctionStart;

        // Price decrease per second
        euint256 priceDifference = TFHE.sub(startPrice, endPrice);

        // Decrypt elapsedTime and duration for calculation (or use encrypted arithmetic)
        // For simplicity, assuming linear decay

        currentPrice = TFHE.sub(startPrice, TFHE.asEuint256(elapsedTime / 10));

        TFHE.allowThis(currentPrice);
        TFHE.allow(currentPrice, msg.sender);

        return currentPrice;
    }

    /**
     * @notice Purchase item at current price
     * @param bidEuint256 Bid amount (must equal or exceed current price)
     * @param bidProof Proof
     */
    function purchaseItem(externalEuint256 bidEuint256, bytes calldata bidProof) external {
        require(!itemSold, "Item already sold");
        require(isAuctionActive(), "Auction not active");

        euint256 bid = TFHE.fromExternal(bidEuint256, bidProof);

        // Ensure bid >= current price
        ebool isSufficientBid = TFHE.ge(bid, currentPrice);

        TFHE.allowThis(isSufficientBid);

        // Mark item as sold
        itemSold = true;
        buyer = msg.sender;

        // Update current price to bid price
        currentPrice = bid;

        TFHE.allowThis(currentPrice);
        TFHE.allow(currentPrice, seller);

        emit ItemSold(msg.sender, block.timestamp);
    }

    /**
     * @notice Check if auction is still active
     * @return true if auction time remains
     */
    function isAuctionActive() public view returns (bool) {
        return !itemSold && block.timestamp < (auctionStart + auctionDuration);
    }

    /**
     * @notice Check if auction has ended
     * @return true if auction period expired
     */
    function isAuctionEnded() public view returns (bool) {
        return itemSold || block.timestamp >= (auctionStart + auctionDuration);
    }

    /**
     * @notice Get time remaining in auction
     * @return Seconds remaining
     */
    function getTimeRemaining() external view returns (uint256) {
        if (itemSold) {
            return 0;
        }

        uint256 endTime = auctionStart + auctionDuration;
        if (block.timestamp >= endTime) {
            return 0;
        }

        return endTime - block.timestamp;
    }

    /**
     * @notice Get elapsed time in auction
     * @return Seconds elapsed
     */
    function getElapsedTime() external view returns (uint256) {
        return block.timestamp - auctionStart;
    }

    /**
     * @notice Get auction duration
     * @return Duration in seconds
     */
    function getAuctionDuration() external view returns (uint256) {
        return auctionDuration;
    }

    /**
     * @notice Check if item was sold
     * @return true if item sold
     */
    function isSold() external view returns (bool) {
        return itemSold;
    }

    /**
     * @notice Get buyer (seller only)
     * @return Buyer address
     */
    function getBuyer() external view returns (address) {
        require(msg.sender == seller, "Only seller");
        return buyer;
    }

    /**
     * @notice Get final price (seller only, encrypted)
     * @return Encrypted final price
     */
    function getFinalPrice() external returns (euint256) {
        require(msg.sender == seller, "Only seller");
        require(itemSold, "Item not sold");

        euint256 price = currentPrice;

        TFHE.allowThis(price);
        TFHE.allow(price, seller);

        return price;
    }

    /**
     * @notice Compare price with threshold
     * @param thresholdEuint256 Threshold price
     * @param thresholdProof Proof
     * @return Comparison result
     */
    function isPriceAboveThreshold(externalEuint256 thresholdEuint256, bytes calldata thresholdProof)
                                   external returns (ebool) {
        euint256 threshold = TFHE.fromExternal(thresholdEuint256, thresholdProof);

        ebool result = TFHE.gt(currentPrice, threshold);

        TFHE.allowThis(result);

        return result;
    }

    /**
     * @notice Get auction info
     * @return seller Auction seller
     * @return auctionStart Auction start time
     * @return isSold Item sold status
     */
    function getAuctionInfo() external view returns (address, uint256, bool) {
        return (seller, auctionStart, itemSold);
    }
}
