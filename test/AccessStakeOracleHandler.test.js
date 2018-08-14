'use strict'
const expect = require('./lib/expect')

const AccessStakeOracleHandler = artifacts.require('AccessStakeOracleHandler')

contract('AccessStakeOracleHandler', accounts => {
  let accessStakeOracleHandler
  const oracle = accounts[1]
  const fakeOracle = accounts[2]
  const stakeOwners = [ accounts[3], accounts[4], accounts[5] ]
  const balances = [ 100, 300, 200 ]

  before(async () => {
    accessStakeOracleHandler = await AccessStakeOracleHandler.new(oracle)
  })

  it('should reject calls from an address other than the oracle', async () => {
    try {
      await accessStakeOracleHandler.update(stakeOwners, balances, { from: fakeOracle })
    } catch (err) {
      expect(err.reason).to.equal('access forbidden')
    }
  })

  it('should update balances of stake owners when update received from oracle', async () => {
    const updateTimestamp = Math.floor(new Date().getTime() / 1000)
    await accessStakeOracleHandler.update(stakeOwners, balances, { from: oracle })
    const stakeBalances = await Promise.all(
      stakeOwners.map(address => accessStakeOracleHandler.getStakeBalance(address))
    )

    stakeBalances.forEach((stakeBalance, index) => {
      const { balance, lastUpdated } = stakeBalance
      expect(Number(balance)).to.equal(balances[index])
      expect(Number(lastUpdated)).to.equal(updateTimestamp)
    })
  })

})
