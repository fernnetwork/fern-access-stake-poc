'use strict'
const expect = require('./lib/expect')

const AccessStake = artifacts.require('TestAccessStake')
const StandardToken = artifacts.require('TestStandardToken')

contract('AccessStake', accounts => {
  let standardToken
  let accessStake

  const owner = accounts[1]
  const initialBalance = 1000
  const depositAmount = 400
  const withdrawAmount = 200
  let currentBalance = initialBalance

  const daysToSeconds = days => days * 24 * 60 * 60
  const withdrawNoticeTimestamp = Math.floor(new Date().getTime() / 1000)
  const tokenReleaseTimestamp = withdrawNoticeTimestamp + daysToSeconds(28)

  before(async () => {
    standardToken = await StandardToken.new()
    accessStake = await AccessStake.new(standardToken.address)
  })

  it('accepts deposits into the stake contract provided that the transfer has been pre-approved', async () => {
    // given user has some fern tokens and has pre-approved the transfer
    await standardToken.transfer(owner, initialBalance)
    await standardToken.approve(accessStake.address, depositAmount, { from: owner })

    await accessStake.deposit(depositAmount, { from: owner })
    const [ userFernBalance, contractFernBalance ] = await Promise.all([
      standardToken.balanceOf(owner),
      standardToken.balanceOf(accessStake.address)
    ])

    // verify balance update
    currentBalance -= depositAmount
    expect(Number(userFernBalance)).to.equal(currentBalance)
    expect(Number(contractFernBalance)).to.equal(depositAmount)
  })

  it('returns the owner\'s stake balance', async () => {
    const userStakeBalance = await accessStake.balanceOf(owner)
    expect(Number(userStakeBalance)).to.equal(depositAmount)
  })

  it('throws error when owner attempts to withdraw without notice', async () => {
    try {
      await accessStake.withdraw(depositAmount, { from: owner })
    } catch (err) {
      expect(err.reason).to.equal('stake is locked')
    }
  })

  it('throws error when user attempts to withdraw an amount greater than the user owns', async () => {
    await accessStake.setCurrentTimestamp(withdrawNoticeTimestamp)

    try {
      await accessStake.notifyWithdraw(depositAmount + 1, { from: owner })
    } catch (err) {
      expect(err.reason).to.equal('insufficient balance')
    }
  })

  it('allows user to notify stake withdraw', async () => {
    await accessStake.setCurrentTimestamp(withdrawNoticeTimestamp)
    await accessStake.notifyWithdraw(withdrawAmount, { from: owner })
    // verify pending release
    const { amount, releaseTime } = await accessStake.getPendingRelease(owner)
    expect(Number(amount)).to.equal(withdrawAmount)
    expect(Number(releaseTime)).to.equal(tokenReleaseTimestamp)
  })

  it('throws error when owner attempts to withdraw before token is released', async () => {
    try {
      await accessStake.withdraw(withdrawAmount, { from: owner })
    } catch (err) {
      expect(err.reason).to.equal('stake is pending release')
    }
  })

  it('throws error when owner attempts to withdraw an amount exceeding notice amount', async () => {
    // release token
    await accessStake.setCurrentTimestamp(tokenReleaseTimestamp + 1)
    try {
      await accessStake.withdraw(withdrawAmount + 1, { from: owner })
    } catch (err) {
      expect(err.reason).to.equal('withdraw amount exceeded pending release amount')
    }
  })

  it('stake is transferred back to the owner when owner withdraws after token release', async () => {
    await accessStake.withdraw(withdrawAmount, { from: owner })

    const [ userFernBalance, contractFernBalance ] = await Promise.all([
      standardToken.balanceOf(owner),
      standardToken.balanceOf(accessStake.address)
    ])

    // balance updated
    currentBalance += withdrawAmount
    expect(Number(userFernBalance)).to.equal(currentBalance)
    expect(Number(contractFernBalance)).to.equal(depositAmount - withdrawAmount)
  })

  it('throws error when own attempts to withdraw twice', async () => {
    try {
      await accessStake.withdraw(withdrawAmount, { from: owner })
    } catch (err) {
      // remaining stake remains locked
      expect(err.reason).to.equal('stake is locked')
    }

    // balance unchanged
    const userFernBalance = await standardToken.balanceOf(owner)
    expect(Number(userFernBalance)).to.equal(currentBalance)
  })

})
