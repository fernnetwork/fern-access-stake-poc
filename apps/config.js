'use strict'

const config = {
  authorityAddress: '0x9b7b86fc70ba2ad53e98d5f8f852c3629f813c7a',
  networks: {
    kovan: {
      networkId: 42,
      provider: 'http://localhost:7545',
      contracts: {
        FernToken: '0xc9626260928Be97C74ceE46d80f71F36096596CD',
        AccessStake: '0x94e5de29b129b4B37F3585D74E43C6B84557b8B4'
      }
    },
    local: {
      networkId: 17,
      provider: 'ws://localhost:8546'
    }
  },
  stakeOwners: [
    '0x9b7b86fc70ba2ad53e98d5f8f852c3629f813c7a',
    '0x6d480772b57e91f1c4e1cc196df88896d27ed327',
    '0x5d8b81d0fe11046bb0dc31507706a08c0e1d5e85'
  ]
}

module.exports = config
