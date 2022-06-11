const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const { expect } = require("chai");
const { deployContract } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

describe("CryptoToken", function() {

  let owner, account1, account2, account3;
  let CryptoToken, token;

  beforeEach(async () => {
    [owner, account1, account2, account3] = await ethers.getSigners()

    CryptoToken = await ethers.getContractFactory("CryptoToken")
    token = await CryptoToken.deploy(10000)
    await token.deployed()
  })
  
  it("checking if the total supply is correct and checking if the balance of an address is correct", async function() {

    const expectedValue = 10000

    expect(await token.totalSupply()).to.equal(expectedValue)
    expect(await token.balanceOf(owner.address)).to.equal(expectedValue)
  })


  it("checking if the total supply is incorrect and checking if the balance of an address is incorrect", async function() {
    
    const expectedValue = 1000

    expect(await token.totalSupply() == expectedValue).to.equal(false)
    expect(await token.balanceOf(owner.address) == expectedValue).to.equal(false)
  })


  it("checking the transfer, if you are subtracting the value of the sent and adding the receiver", async function() {

    const currentBalanceOwner = await token.balanceOf(owner.address)
    const currentBalanceReceiver = await token.balanceOf(account1.address)

    const amountSent = 1000

    const transferTx = await token.transfer(account1.address, amountSent)
    await transferTx.wait()

    const modifiedBalanceOwner = await token.balanceOf(owner.address)
    const modifiedBalanceReceiver = await token.balanceOf(account1.address)

    expect(parseInt(currentBalanceOwner) - amountSent).to.equal(modifiedBalanceOwner)
    expect(parseInt(currentBalanceReceiver) + amountSent).to.equal(modifiedBalanceReceiver)
  })


  it("checking multiple outgoing balance transfers", async function() {
    const currentBalanceOwner = await token.balanceOf(owner.address)

    const amountSent = [1000, 500, 1500]
    
    const transfers = [
      await token.transfer(account1.address, amountSent[0]),
      await token.transfer(account2.address, amountSent[1]),
      await token.transfer(account3.address, amountSent[2])
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

    const amountSent = 3000
    
    const transfersOwner = [
      await token.transfer(account1.address, amountSent),
      await token.transfer(account2.address, amountSent),
      await token.transfer(account3.address, amountSent)
    ]

    for(let i = 0; i < transfersOwner.length; i++) {
      let transferOwner = transfersOwner[i]
      transferOwner.wait() 
    }

    const currentBalanceOwner = await token.balanceOf(owner.address)
    
    const transfers = [
      await token.connect(account1).transfer(owner.address, amountSent),
      await token.connect(account2).transfer(owner.address, amountSent),
      await token.connect(account3).transfer(owner.address, amountSent)
    ]

    for(let i = 0; i < transfersOwner.length; i++) {
      let transferTx = transfers[i]
      transferTx.wait() 
    }
    
    const modifiedBalanceOwner = await token.balanceOf(owner.address)

    expect(parseInt(currentBalanceOwner) + (amountSent * 3)).to.equal(modifiedBalanceOwner)
  })

  it("checking a transaction with insufficient balance", async function() {
    await expect(token.transfer(account1.address, 21000001)).to.be.revertedWith('Insufficient Balance to Transfer')
  })

  it("checking the current state", async function() {
    const expectedState = 0

    expect(await token.state()).to.equal(expectedState)
  })

  it("checking if the state is changing", async function() {
    
    const currentState = await token.state()

    const changeState = await token.changeState(1)
    await changeState.wait()

    const modifiedState = await token.state()

    expect(currentState != modifiedState).to.equal(true)
  })

  it("checking overflows when changing state", async function() {
    await expect(token.changeState(3)).to.be.revertedWith("Invalid status option!")
    await expect(token.changeState(0)).to.be.revertedWith("The status is already ACTIVE")

    await token.changeState(1)
    await expect(token.changeState(1)).to.be.revertedWith("The status is already PAUSED")

    await token.changeState(2)
    await expect(token.changeState(2)).to.be.revertedWith("The status is already CANCELLED")
  })

  it("checking if you are adding tokens and checking if the owner is getting the mint value", async function() {
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
    const changeState = await token.changeState(2)
    await changeState.wait()

    const kill = await token.kill()
    await kill.wait()
    
    const confirmation = kill.confirmations

    expect(confirmation == 1).to.equal(true)
  })

  it("checking that the contract is not canceled on kill", async function() {
    await expect(token.kill()).to.be.revertedWith("It's necessary to cancel the contract before to kill it")
  })

    it("checking owner permissions", async function() {
      expect(token.connect(account1).toMint(1000)).to.be.revertedWith("Sender is not owner!")
      expect(token.connect(account1).toBurn(1000)).to.be.revertedWith("Sender is not owner!")
      expect(token.connect(account1).kill()).to.be.revertedWith("Sender is not owner!")
      expect(token.connect(account1).changeState(2)).to.be.revertedWith("Sender is not owner!")
    })

    it("checking if status is active", async function() {
      await token.changeState(1)

      await expect(token.transfer(account1.address, 1000)).to.be.revertedWith("The contract is not acvite!")
      await expect(token.toMint(1000)).to.be.revertedWith("The contract is not acvite!")
      await expect(token.toBurn(1000)).to.be.revertedWith("The contract is not acvite!")

      await token.changeState(2)

      await expect(token.transfer(account1.address, 1000)).to.be.revertedWith("The contract is not acvite!")
      await expect(token.toMint(1000)).to.be.revertedWith("The contract is not acvite!")
      await expect(token.toBurn(1000)).to.be.revertedWith("The contract is not acvite!")
    })
})



