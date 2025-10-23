// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./MemeToken.sol";

/**
 * @title MemeLaunchpad
 * @dev A bonding curve based token launchpad inspired by pump.fun
 */
contract MemeLaunchpad is Ownable, ReentrancyGuard {
    using Math for uint256;

    // Events
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        string metadata,
        address indexed creator,
        uint256 creatorAllocation
    );

    event TokensBought(
        address indexed tokenAddress,
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 newPrice
    );

    event TokensSold(
        address indexed tokenAddress,
        address indexed seller,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 newPrice
    );

    event TokenCompleted(
        address indexed tokenAddress,
        uint256 finalSupply,
        uint256 finalPrice
    );

    event HeldTokensWithdrawn(
        address indexed tokenAddress,
        address indexed owner,
        uint256 amount
    );

    event TokensAllocated(
        address indexed tokenAddress,
        address indexed recipient,
        uint256 amount,
        uint256 percentage
    );

    // Structs
    struct TokenInfo {
        string name;
        string symbol;
        string metadata;
        address creator;
        uint256 creatorAllocation; // Amount of tokens allocated to creator
        uint256 heldTokens; // Amount of tokens held in the contract
        uint256 maxSupply; // Maximum token supply before completion
        uint256 currentSupply; // Current token supply
        uint256 virtualTrust; // Virtual TRUST in the bonding curve
        uint256 virtualTokens; // Virtual tokens in the bonding curve
        bool completed; // Whether the token has reached completion
        uint256 creationTime;
    }

    // Constants
    uint256 public constant CREATOR_ALLOCATION_PERCENT = 0; // 0% for creator (no creator allocation)
    uint256 public constant BONDING_CURVE_PERCENT = 70; // 70% for bonding curve
    uint256 public constant HELD_PERCENT = 30; // 30% held in memelaunchpad
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 1e18; // 1B tokens max
    uint256 public constant INITIAL_PRICE = 0.000001 * 1e18; // Initial price in ETH
    uint256 public constant FEE_PERCENT = 1; // 1% fee
    uint256 public constant CREATION_FEE = 5 * 1e18; // 5 native tokens for creation

    // State variables
    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => bool) public isValidToken;
    address[] public allTokens;

    // Treasury address for fees
    address public treasuryAddress;

    // Modifiers
    modifier onlyValidToken(address tokenAddress) {
        require(isValidToken[tokenAddress], "Invalid token");
        _;
    }

    constructor(address _treasuryAddress) Ownable(msg.sender) {
        treasuryAddress = _treasuryAddress;
    }

    /**
     * @dev Create a new meme token with bonding curve
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory metadata,
        uint256 totalSupply
    ) external returns (address) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(symbol).length > 0, "Symbol required");
        require(totalSupply > 0 && totalSupply <= MAX_SUPPLY, "Invalid supply");

        // Create the token contract
        MemeToken token = new MemeToken(name, symbol, totalSupply);

        // Set launchpad for minting permissions
        token.setLaunchpad(address(this));

        // Calculate allocations (70% bonding curve, 30% memelaunchpad, 0% creator)
        uint256 bondingAmount = (totalSupply * BONDING_CURVE_PERCENT) / 100;
        uint256 heldAmount = (totalSupply * HELD_PERCENT) / 100;

        // Initialize token info with proper bonding curve setup
        // Use initial virtual values to enable first purchase
        uint256 initialVirtualTokens = bondingAmount;
        uint256 initialVirtualTrust = 1 * 1e18; // 1 ETH equivalent for initial pricing

        tokenInfo[address(token)] = TokenInfo({
            name: name,
            symbol: symbol,
            metadata: metadata,
            creator: msg.sender,
            creatorAllocation: 0, // No creator allocation
            heldTokens: heldAmount,
            maxSupply: totalSupply,
            currentSupply: 0, // Start with 0 circulating supply
            virtualTrust: initialVirtualTrust, // Start with some virtual ETH
            virtualTokens: initialVirtualTokens, // Virtual tokens available for curve
            completed: false,
            creationTime: block.timestamp
        });

        isValidToken[address(token)] = true;
        allTokens.push(address(token));

        // Mint allocations (no creator tokens)
        token.mint(address(this), heldAmount); // 30% held in memelaunchpad

        emit TokenCreated(address(token), name, symbol, metadata, msg.sender, 0);

        return address(token);
    }

    /**
     * @dev Allocate 2% of a token's supply to any address (admin only)
     * @param tokenAddress - Address of the token to allocate from
     * @param recipient - Address to receive the tokens
     */
    function allocateTokens(address tokenAddress, address recipient) external onlyOwner onlyValidToken(tokenAddress) {
        require(recipient != address(0), "Cannot allocate to zero address");
        require(!tokenInfo[tokenAddress].completed, "Token launch completed");

        // Calculate 2% of token's max supply
        uint256 allocationAmount = (tokenInfo[tokenAddress].maxSupply * 2) / 100;

        require(allocationAmount > 0, "Allocation amount must be greater than 0");

        // Mint tokens directly to recipient
        MemeToken(tokenAddress).mint(recipient, allocationAmount);

        emit TokensAllocated(tokenAddress, recipient, allocationAmount, 2);
    }

    /**
     * @dev Buy tokens from the bonding curve using pump.fun style calculation
     */
    function buyTokens(address tokenAddress, uint256 minTokensOut)
        external
        payable
        nonReentrant
        onlyValidToken(tokenAddress)
        returns (uint256 tokensBought)
    {
        TokenInfo storage token = tokenInfo[tokenAddress];
        require(!token.completed, "Token launch completed");
        require(msg.value > 0, "Must send ETH");

        uint256 ethAmount = msg.value;
        uint256 tokensBefore = token.virtualTokens;
        uint256 ethBefore = token.virtualTrust;

        // Calculate tokens to receive using pump.fun style formula
        // tokensAfter = (tokensBefore * ethBefore) / (ethBefore + ethAmount)
        uint256 tokensAfter = (tokensBefore * ethBefore) / (ethBefore + ethAmount);

        require(tokensAfter > tokensBefore, "No tokens to buy");
        tokensBought = tokensAfter - tokensBefore;

        require(tokensBought >= minTokensOut, "Slippage too high");
        require(token.currentSupply + tokensBought <= token.maxSupply, "Exceeds max supply");

        // Calculate fee
        uint256 fee = (ethAmount * FEE_PERCENT) / 100;

        // Update token info
        uint256 ethAmountAfterFee = ethAmount - fee;
        token.virtualTrust = ethBefore + ethAmountAfterFee; // Update to new trust level
        token.virtualTokens = tokensAfter; // Update to new token level after purchase
        token.currentSupply += tokensBought;

        // Check if token should be completed (when circulating supply reaches max supply)
        if (token.currentSupply >= token.maxSupply && !token.completed) {
            token.completed = true;
            emit TokenCompleted(tokenAddress, token.currentSupply, getCurrentPrice(tokenAddress));
        }

        // Mint tokens to buyer
        MemeToken(tokenAddress).mint(msg.sender, tokensBought);

        // Send fee to treasury
        payable(treasuryAddress).transfer(fee);

        // Calculate current price for the event (reduces stack depth)
        uint256 currentPrice = getCurrentPrice(tokenAddress);
        emit TokensBought(tokenAddress, msg.sender, ethAmountAfterFee, tokensBought, currentPrice);
        return tokensBought;
    }

    /**
     * @dev Sell tokens to the bonding curve using pump.fun style calculation
     */
    function sellTokens(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 minEthOut
    ) external nonReentrant onlyValidToken(tokenAddress) returns (uint256 ethReceived) {
        TokenInfo storage token = tokenInfo[tokenAddress];
        require(!token.completed, "Token launch completed");
        require(tokenAmount > 0, "Must sell tokens");

        uint256 tokensBefore = token.virtualTokens;
        uint256 ethBefore = token.virtualTrust;

        // Calculate ETH to receive using pump.fun style formula
        // ethAfter = (tokensAfter * ethBefore) / tokensBefore
        uint256 tokensAfter = tokensBefore - tokenAmount;
        uint256 ethAfter = (tokensAfter * ethBefore) / tokensBefore;

        require(ethAfter < ethBefore, "No ETH to receive");
        ethReceived = ethBefore - ethAfter;

        require(ethReceived >= minEthOut, "Slippage too high");

        // Update virtual reserves
        token.virtualTrust = ethAfter; // Update to new trust level after sale
        token.virtualTokens = tokensAfter; // Update to new token level after sale
        token.currentSupply -= tokenAmount;

        // Burn tokens from seller
        MemeToken(tokenAddress).burnFrom(msg.sender, tokenAmount);

        // Calculate and deduct fee from received ETH
        uint256 fee = (ethReceived * FEE_PERCENT) / 100;
        uint256 ethAfterFee = ethReceived - fee;

        // Send ETH to seller (after fee deduction)
        payable(msg.sender).transfer(ethAfterFee);

        // Send fee to treasury
        payable(treasuryAddress).transfer(fee);

        // Calculate current price for the event (reduces stack depth)
        uint256 currentPrice = getCurrentPrice(tokenAddress);
        emit TokensSold(tokenAddress, msg.sender, ethAfterFee, tokenAmount, currentPrice);
        return ethAfterFee;
    }

    /**
     * @dev Get current price of a token based on pump.fun style bonding curve
     */
    function getCurrentPrice(address tokenAddress) public view onlyValidToken(tokenAddress) returns (uint256) {
        TokenInfo memory token = tokenInfo[tokenAddress];

        if (token.currentSupply == 0) {
            return INITIAL_PRICE;
        }

        // Pump.fun style bonding curve: price = virtualTrust / virtualTokens
        // This gives the price per token in the bonding curve
        if (token.virtualTokens == 0) {
            return INITIAL_PRICE;
        }
        return (token.virtualTrust * 1e18) / token.virtualTokens;
    }

    /**
     * @dev Calculate tokens after buying using pump.fun integral formula
     * Formula: tokens_after = (tokens_before * trust_before) / (trust_before - trust_amount)
     */
    function calculateTokensAfterBuy(uint256 tokensBefore, uint256 trustBefore, uint256 trustAmount) public pure returns (uint256) {
        if (trustAmount == 0) return tokensBefore;
        uint256 trustAfter = trustBefore + trustAmount;
        return (tokensBefore * trustBefore) / trustAfter;
    }

    /**
     * @dev Calculate TRUST after selling using pump.fun integral formula
     * Formula: trust_after = (tokens_after * trust_before) / tokens_before
     */
    function calculateTrustAfterSell(uint256 tokensBefore, uint256 trustBefore, uint256 tokensAfter) public pure returns (uint256) {
        if (tokensAfter == tokensBefore) return trustBefore;
        return (tokensAfter * trustBefore) / tokensBefore;
    }

    /**
     * @dev Calculate token amount for given TRUST amount (legacy function for compatibility)
     */
    function calculateTokenAmount(uint256 trustAmount, uint256 currentPrice) public pure returns (uint256) {
        return (trustAmount * 1e18) / currentPrice;
    }

    /**
     * @dev Get token information
     */
    function getTokenInfo(address tokenAddress) external view returns (TokenInfo memory) {
        return tokenInfo[tokenAddress];
    }

    /**
     * @dev Get all tokens
     */
    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    /**
     * @dev Get token count
     */
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Complete token launch early (only creator)
     */
    function completeTokenLaunch(address tokenAddress) external onlyValidToken(tokenAddress) {
        TokenInfo storage token = tokenInfo[tokenAddress];
        require(msg.sender == token.creator, "Only creator can complete");
        require(!token.completed, "Already completed");

        token.completed = true;
        emit TokenCompleted(tokenAddress, token.currentSupply, getCurrentPrice(tokenAddress));
    }

    /**
     * @dev Withdraw remaining liquidity after completion (only creator)
     */
    function withdrawLiquidity(address tokenAddress) external onlyValidToken(tokenAddress) nonReentrant {
        TokenInfo storage token = tokenInfo[tokenAddress];
        require(msg.sender == token.creator, "Only creator can withdraw");
        require(token.completed, "Token not completed yet");

        uint256 remainingLiquidity = token.virtualTrust;
        require(remainingLiquidity > 0, "No liquidity to withdraw");

        token.virtualTrust = 0;

        // Send remaining ETH to creator
        payable(token.creator).transfer(remainingLiquidity);
    }

    /**
     * @dev Withdraw held tokens (only owner)
     */
    function withdrawHeldTokens(address tokenAddress) external onlyOwner onlyValidToken(tokenAddress) nonReentrant {
        TokenInfo storage token = tokenInfo[tokenAddress];
        uint256 amount = token.heldTokens;
        require(amount > 0, "No held tokens");

        // Transfer held tokens to owner
        bool success = MemeToken(tokenAddress).transfer(owner(), amount);
        require(success, "Transfer failed");

        // Update held tokens
        token.heldTokens = 0;

        emit HeldTokensWithdrawn(tokenAddress, owner(), amount);
    }
}

