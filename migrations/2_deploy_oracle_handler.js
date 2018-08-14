const migrationConfig = require('./migrationConfig.json')
const AccessStakeOracleHandler = artifacts.require('AccessStakeOracleHandler')

module.exports = (deployer, network) => {
  const config = migrationConfig[network] || {}
  const { oracleAddress } = config
  if (oracleAddress) {
    deployer.deploy(AccessStakeOracleHandler, oracleAddress)
  } else {
    console.warn('AccessStakeOracleHandler has not been deployed as oracle address not specified.')
  }
}
