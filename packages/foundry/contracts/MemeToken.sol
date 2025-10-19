// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeToken is ERC20, Ownable {
    uint256 public immutable maxSupply;
    address public launchpad;

    modifier onlyLaunchpad() {
        require(msg.sender == launchpad, "Only launchpad");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
    }

    function setLaunchpad(address _launchpad) external onlyOwner {
        launchpad = _launchpad;
    }

    function mint(address to, uint256 amount) external onlyLaunchpad {
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) external onlyLaunchpad {
        _burn(account, amount);
    }
}