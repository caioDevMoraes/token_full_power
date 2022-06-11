const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const { expect } = require("chai");
const { deployContract } = require("ethereum-waffle");
const { ethers } = require("hardhat");

describe("Greeter", function () {
  
  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});


describe("CryptoToken", function() {
  
  it("checking if the total supply is correct and checking if the balance of an address is correct", async function() {
    const [owner] = await ethers.getSigners()

    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(1000000000000)
    await token.deployed()

    const expectedValue = 1000000000000

    expect(await token.totalSupply()).to.equal(expectedValue)
    expect(await token.balanceOf(owner.address)).to.equal(expectedValue)
  })


  it("checking if the total supply is incorrect and checking if the balance of an address is incorrect", async function() {
    const [owner] = await ethers.getSigners()

    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(1000000000000)
    await token.deployed()
    
    const expectedValue = 1000

    expect(await token.totalSupply() == expectedValue).to.equal(false)
    expect(await token.balanceOf(owner.address) == expectedValue).to.equal(false)
  })


  it("checking the transfer, if you are subtracting the value of the sent and adding the receiver", async function() {
    const [owner, receiver] = await ethers.getSigners()
    
    const CryptoToken = await ethers.getContractFactory("CryptoToken");
    const token = await CryptoToken.deploy(10000);
    await token.deployed()

    const currentBalanceOwner = await token.balanceOf(owner.address)
    const currentBalanceReceiver = await token.balanceOf(receiver.address)

    const amountSent = 1000

    const transferTx = await token.transfer(receiver.address, amountSent)
    await transferTx.wait()

    const modifiedBalanceOwner = await token.balanceOf(owner.address)
    const modifiedBalanceReceiver = await token.balanceOf(receiver.address)

    expect(parseInt(currentBalanceOwner) - amountSent).to.equal(modifiedBalanceOwner)
    expect(parseInt(currentBalanceReceiver) + amountSent).to.equal(modifiedBalanceReceiver)
  })


  it("checking multiple outgoing balance transfers", async function() {
    const [owner, receiver1, receiver2, receiver3] = await ethers.getSigners()

    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(10000)
    await token.deployed()

    const currentBalanceOwner = await token.balanceOf(owner.address)

    const amountSent = [1000, 500, 1500]
    const transfers = [
      await token.transfer(receiver1.address, amountSent[0]),
      await token.transfer(receiver2.address, amountSent[1]),
      await token.transfer(receiver3.address, amountSent[2])
    ]

    for(let i = 0; i < transfers.length; i++) {
      let transferTx = transfers[i]
      transferTx.wait()
    }

    const modifiedBalanceOwner = await token.balanceOf(owner.address)

    const totalAmountSent = amountSent.reduce((soma, i) => parseInt(soma) + parseInt(i))

    expect(parseInt(currentBalanceOwner) - totalAmountSent).to.equal(modifiedBalanceOwner)
  })


  it("checking multiple balance gain transfers", async function() {
    const [owner, sender1, sender2, sender3] = await ethers.getSigners()

    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(9000)
    await token.deployed()

    const amountSent = 3000
    
    const transfersOwner = [
      await token.transfer(sender1.address, amountSent),
      await token.transfer(sender2.address, amountSent),
      await token.transfer(sender3.address, amountSent)
    ]

    for(let i = 0; i < transfersOwner.length; i++) {
      let transferOwner = transfersOwner[i]
      transferOwner.wait() 
    }

    const currentBalanceOwner = await token.balanceOf(owner.address)
    
    const transfers = [
      await token.connect(sender1).transfer(owner.address, amountSent),
      await token.connect(sender2).transfer(owner.address, amountSent),
      await token.connect(sender3).transfer(owner.address, amountSent)
    ]

    for(let i = 0; i < transfersOwner.length; i++) {
      let transferTx = transfers[i]
      transferTx.wait() 
    }
    
    const modifiedBalanceOwner = await token.balanceOf(owner.address)

    expect(parseInt(currentBalanceOwner) + (amountSent * 3)).to.equal(modifiedBalanceOwner)
  })

  it("checking the current state", async function() {
    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(9000)
    await token.deployed()

    const expectedState = 0

    expect(await token.state()).to.equal(expectedState)
  })

  it("checking if the state is changing", async function() {
    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(9000)
    await token.deployed()
    
    const currentState = await token.state()

    const changeState = await token.changeState(1)
    await changeState.wait()

    const modifiedState = await token.state()

    expect(currentState != modifiedState).to.equal(true)
  })

  it("checking if you are adding tokens and checking if the owner is getting the mint value", async function() {
    const [owner] = await ethers.getSigners()
    
    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(9000)
    await token.deployed()

    const currentTotalSupply = await token.totalSupply()
    const currentBalanceOwner = await token.balanceOf(owner.address)

    const amount = 1000

    const toMint = await token.toMint(amount)
    await toMint.wait()

    const modifiedTotalSupply = await token.totalSupply()
    const modifiedBalanceOwner = await token.balanceOf(owner.address)

    expect(parseInt(currentTotalSupply) + amount).to.equal(modifiedTotalSupply)
    expect(parseInt(currentBalanceOwner) + amount).to.equal(modifiedBalanceOwner)
  })

  it("checking if it is burning token the total supply and the owner's address", async function() {
    const [owner] = await ethers.getSigners()
    
    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(11000)
    await token.deployed()

    const currentTotalSupply = await token.totalSupply()
    const currentBalanceOwner = await token.balanceOf(owner.address)

    const amount = 1000

    const toBurn = await token.toBurn(amount)
    await toBurn.wait()

    const modifiedTotalSupply = await token.totalSupply()
    const modifiedBalanceOwner = await token.balanceOf(owner.address)

    expect(parseInt(currentTotalSupply) - amount).to.equal(modifiedTotalSupply)
    expect(parseInt(currentBalanceOwner) - amount).to.equal(modifiedBalanceOwner)
  })

  it("checking if it's killing the contract", async function() {
    const CryptoToken = await ethers.getContractFactory("CryptoToken")
    const token = await CryptoToken.deploy(11000)
    await token.deployed()

    const changeState = await token.changeState(2)
    await changeState.wait()

    const kill = await token.kill()
    await kill.wait()

    console.log(kill);
    // expect(await token.kill()).to.equal(true)
  })
})

