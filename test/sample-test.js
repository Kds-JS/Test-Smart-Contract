const {ethers} = require('hardhat');
const {expect} = require('chai');

describe("Ben BK NFT COLLECTION TESTS", function() {

  before(async function() {
    [this.owner, this.addr1, this.addr2] = await ethers.getSigners();
  })

  it('should deploy the smart contract', async function() {
        
        this.team = ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8","0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"];
        this.teamShares = [70, 30];
        this.baseURI = "ipfs://CID/";

        this.contract = await hre.ethers.getContractFactory("NFTisERC721A");
        this.deployedContract = await this.contract.deploy(
          this.team,
          this.teamShares,
          this.baseURI
        )
  })

  it('price should be at 0.2 ether', async function() {
    let price = await this.deployedContract.price();

    expect(price).to.equal(ethers.utils.parseEther('0.2'));
  })

  it('should NOT be posiible to change the price if not the owner', async function() {
    let price = 0;

    await expect(this.deployedContract.connect(this.addr1).setPrice(price)).to.be.revertedWith('Ownable: caller is not the owner');
  })

  it('should be possible to mint 2 NFTs', async function() {
    let price = await this.deployedContract.price();
    price = price.mul(2);

    let overrides = {
      value: price
    }

    await this.deployedContract.connect(this.addr1).publicSaleMint(this.addr1.address, 2, overrides);
  })

  it('totalSupply should be equal to 2', async function() {
    let totalSupply = await this.deployedContract.totalSupply();
    expect(totalSupply).to.equal(2);
  })

  it('should NOT be possible to mint 2 NFTs because addr1 has already minted', async function() {
    let price = await this.deployedContract.price();
    price = price.mul(2);

    let overrides = {
      value: price
    }

    await expect(this.deployedContract.connect(this.addr1).publicSaleMint(this.addr1.address, 2, overrides)).to.revertedWith("You can only get 2 NFTs during public sale");
  })

  it('should be possible to mint 2 NFTs', async function() {
    let price = await this.deployedContract.price();
    price = price.mul(2);

    let overrides = {
      value: price
    }

    await this.deployedContract.connect(this.addr2).publicSaleMint(this.addr2.address, 2, overrides);
  })

  it('totalSupply should be equal to 4', async function() {
    let totalSupply = await this.deployedContract.totalSupply();
    expect(totalSupply).to.equal(4);
  })

  it('should NOT be possible to mint 2 NFTs because max supply would exceed', async function() {
    let price = await this.deployedContract.price();
    price = price.mul(2);

    let overrides = {
      value: price
    }

    await expect(this.deployedContract.connect(this.owner).publicSaleMint(this.owner.address, 2, overrides)).to.revertedWith("Max supply exceeded");
  })

  it('should be possible to mint 1 NFTs', async function() {
    let price = await this.deployedContract.price();

    let overrides = {
      value: price
    }

    await this.deployedContract.connect(this.owner).publicSaleMint(this.owner.address, 1, overrides);
  })

  it('totalSupply should be equal to 5', async function() {
    let totalSupply = await this.deployedContract.totalSupply();
    expect(totalSupply).to.equal(5);
  })

  it('should release the gains', async function() {
    let balanceAddr1 = await this.addr1.getBalance();
    let balanceAddr2 = await this.addr2.getBalance();

    await this.deployedContract.releaseAll();

    let balanceAddr1New = await this.addr1.getBalance();
    let balanceAddr2New = await this.addr2.getBalance();

    expect(balanceAddr1New).gt(balanceAddr1);
    expect(balanceAddr2New).gt(balanceAddr2);
  })

})