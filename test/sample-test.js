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

    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(1000000000000)
    await token.deployed()

    const expectedValue = 1000000000000

    expect(await token.totalSupply()).to.equal(expectedValue)
    expect(await token.balanceOf(owner.address)).to.equal(expectedValue)
  })


  it("checking if the total supply is incorrect and checking if the balance of an address is incorrect", async function() {
    const [owner] = await ethers.getSigners()

    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(1000000000000)
    await token.deployed()
    
    const expectedValue = 1000

    expect(await token.totalSupply() == expectedValue).to.equal(false)
    expect(await token.balanceOf(owner.address) == expectedValue).to.equal(false)
  })


  it("checking the transfer, if you are subtracting the value of the sent and adding the receiver", async function() {
    const [owner, receiver] = await ethers.getSigners()
    
    const CriptoToken = await ethers.getContractFactory("CriptoToken");
    const token = await CriptoToken.deploy(10000);
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

    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(10000)
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

    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(9000)
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
})

describe("Airdrop", function() {
  
  // it("checking if the log functions are okay", async function() {
  //   const [owner] = await ethers.getSigners()

  //   const CriptoToken = await ethers.getContractFactory("CriptoToken")
  //   const token = await CriptoToken.deploy(9000)
  //   await token.deployed()  

  //   const Airdrop = await ethers.getContractFactory("Airdrop")
  //   const airdrop = await Airdrop.deploy(token.address)
  //   await airdrop.deployed()

  //   const currentState = await airdrop.getState()
    

  // })

  it("checking if address is subscribing", async function() {
    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(9000)
    await token.deployed()  

    const Airdrop = await ethers.getContractFactory("Airdrop")
    const airdrop = await Airdrop.deploy(token.address)
    await airdrop.deployed()

    const currentSubscribes = await airdrop.getLengthSubscribes()

    const setSubscribe = await airdrop.subscribe()
    await setSubscribe.wait()

    const addedSubscribe = await airdrop.getLengthSubscribes()

    expect(parseInt(currentSubscribes) + 1).to.equal(addedSubscribe)
  })


  it("checking multiple subscriptions", async function() {
    const [_, account1, account2] = await ethers.getSigners()

    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(9000)
    await token.deployed()  

    const Airdrop = await ethers.getContractFactory("Airdrop")
    const airdrop = await Airdrop.deploy(token.address)
    await airdrop.deployed()
    
    let cont = 0

    const currentSubscribes = await airdrop.getLengthSubscribes()

    const subscribes = [
      await airdrop.subscribe(),
      await airdrop.connect(account1).subscribe(),
      await airdrop.connect(account2).subscribe()
    ]

    for(let i = 0; i < subscribes.length; i++) {
      let subscribe = subscribes[i]
      subscribe.wait()
      cont++ 
    }

    const addedSubscribes = await airdrop.getLengthSubscribes()

    expect(parseInt(currentSubscribes) + cont).to.equal(addedSubscribes)
  })


  it("checking if the state is being changed", async function() {
    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(9000)
    await token.deployed()  

    const Airdrop = await ethers.getContractFactory("Airdrop")
    const airdrop = await Airdrop.deploy(token.address)
    await airdrop.deployed()
    
    const currentState = await airdrop.getState()

    const modifyStatus = await airdrop.modifyStatus(2)
    await modifyStatus.wait()

    const modifiedState = await airdrop.getState()

    expect(currentState !== modifiedState).to.equal(true)
  })


  it("verification is called the execute function()", async function() {
    const [_, account1, account2, account3, account4, account5] = await ethers.getSigners()

    const CriptoToken = await ethers.getContractFactory("CriptoToken")
    const token = await CriptoToken.deploy(9000)
    await token.deployed()  

    const Airdrop = await ethers.getContractFactory("Airdrop")
    const airdrop = await Airdrop.deploy(token.address)
    await airdrop.deployed()

    const amountAirdrop = 5000
    let cont = 0

    await token.transfer(airdrop.address, amountAirdrop)

    const subscribes = [
      await airdrop.connect(account1).subscribe(),
      await airdrop.connect(account2).subscribe(),
      await airdrop.connect(account3).subscribe(),
      await airdrop.connect(account4).subscribe(),
      await airdrop.connect(account5).subscribe(),
    ]

    for(let i = 0; i < subscribes.length; i++) {
      let subscribe = subscribes[i]
      subscribe.wait()
      cont++ 
    }
    
    const balances = [
      await token.balanceOf(account1.address), 
      await token.balanceOf(account2.address),
      await token.balanceOf(account3.address),
      await token.balanceOf(account4.address),
      await token.balanceOf(account5.address)
    ]
    
    const amountBalances = balances.reduce((soma, i) => parseInt(soma) + parseInt(i))

    expect(amountBalances).to.equal(amountAirdrop)
  })

  // it("checking if the address is already registered", async function() {
  //   const [owner] = await ethers.getSigners()

  //   const CriptoToken = await ethers.getContractFactory("CriptoToken")
  //   const token = await CriptoToken.deploy(9000)
  //   await token.deployed()  

  //   const Airdrop = await ethers.getContractFactory("Airdrop")
  //   const airdrop = await Airdrop.deploy(token.address)
  //   await airdrop.deployed()

  //   const subscribe = await airdrop.subscribe()
  //   await subscribe.wait()

  //   const hasSubscribe = await airdrop.hasSubscribed(owner.address)

  //   expect(hasSubscribe).to.equal(true)
  // })
})