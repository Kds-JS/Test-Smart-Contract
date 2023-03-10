// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ERC721A.sol";

contract NFTisERC721A is Ownable, ERC721A, PaymentSplitter {
    
    using Strings for uint;

    uint private constant MAX_SUPPLY = 5;

    mapping(address => uint) NFTsPerWallet;
    uint private constant MAX_NFTS_PER_ADDRESS = 2;

    uint public price = 0.2 ether;

    string baseURI;
    uint private teamLength;

    constructor(
        address [] memory _team,
        uint[] memory _teamShares,
        string memory _baseURI
    )
    ERC721A("BEN BK", "BBK")
    PaymentSplitter(_team, _teamShares) {
        teamLength = _team.length;
        baseURI = _baseURI;
    }

    function setPrice(uint _price) external onlyOwner {
        price = _price;
    }

    function publicSaleMint(address _account, uint _quantity) external payable {
        require(price != 0, "Price is 0");
        require(NFTsPerWallet[msg.sender] + _quantity <= MAX_NFTS_PER_ADDRESS, "You can only get 2 NFTs during public sale");
        require(totalSupply() + _quantity <= MAX_SUPPLY, "Max supply exceeded");
        require(msg.value >= price * _quantity, "Not enought funds");
        NFTsPerWallet[msg.sender] += _quantity;
        _safeMint(_account, _quantity);
    }

    function tokenURI(uint _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "URI query for nonexistent token");

        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
    }

    function releaseAll() external {
        for(uint i=0; i < teamLength; i++) {
            release(payable(payee(i)));
        }
    }

}