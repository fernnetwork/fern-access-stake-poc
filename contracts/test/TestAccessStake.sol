pragma solidity ^0.4.24;

import "../AccessStake.sol";

contract TestAccessStake is AccessStake {
  uint256 timestamp;

  constructor(ERC20 _token) AccessStake(_token) public {}

  function currentTimestamp() internal view returns (uint256) {
    if (timestamp > 0) {
      return timestamp;
    }
    return now;
  }

  /// allow mocking current block timestamp in tests
  function setCurrentTimestamp(uint256 _timestamp) public {
    timestamp = _timestamp;
  }
}
