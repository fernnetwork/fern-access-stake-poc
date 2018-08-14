const assert = require('assert')
const migrationConfig = require('./migrationConfig.json')

const AccessStakeOracleHandler = artifacts.require('AccessStakeOracleHandler')

module.exports = (deployer, network) => {
  const config = migrationConfig[network]
  assert(!!config, `migration config missing for network: ${network}`)

  const { oracleAddress } = config
  assert(!!oracleAddress, `oracle address missing for network: ${network}`)

  deployer.deploy(AccessStakeOracleHandler, oracleAddress)
}
