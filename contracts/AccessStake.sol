pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract AccessStake {

  struct StakeRelease {
    uint256 releaseTime;
    uint256 amount;
  }

  /// token used for staking
  ERC20 public token;

  /// ERC-20 stake balances
  mapping (address => uint) public balances;

  /// pending releases
  mapping (address => StakeRelease) public pendingReleases;

  event StakeDeposited(address sender, uint256 amount);
  event WithdrawNotice(address recipient, uint256 amount, uint256 releaseTime);

  constructor(ERC20 _token) public {
    token = _token;
  }

  /// Deposit ERC-20 tokens into contract. Requires pre-approval.
  function deposit(uint _amount) external {
    token.transferFrom(msg.sender, this, _amount);
    balances[msg.sender] += _amount;
    emit StakeDeposited(msg.sender, _amount);
  }

  /// Notify stake withdraw. Notice period of 28 days before stake can be withdrawn.
  function notifyWithdraw(uint _amount) external {
    address recipient = msg.sender;
    require(balances[recipient] >= _amount, "insufficient balance");

    StakeRelease storage stakeRelease = pendingReleases[recipient];
    stakeRelease.releaseTime = currentTimestamp() + 28 days;
    stakeRelease.amount = _amount;

    emit WithdrawNotice(recipient, stakeRelease.amount, stakeRelease.releaseTime);
  }

  /// Withdraw the stake from the contract after notice period passes.
  function withdraw(uint _amount) external {
    address recipient = msg.sender;
    StakeRelease storage pendingRelease = pendingReleases[recipient];

    require(pendingRelease.releaseTime != 0, "stake is locked");
    require(pendingRelease.amount >= _amount, "withdraw amount exceeded pending release amount");
    require(currentTimestamp() > pendingRelease.releaseTime, "stake is pending release");

    token.transfer(msg.sender, _amount);

    // reset pending release
    pendingRelease.releaseTime = 0;
    pendingRelease.amount = 0;
  }

  function getPendingRelease(address _stakeOwner) public view returns (uint256 amount, uint256 releaseTime) {
    StakeRelease memory pendingRelease = pendingReleases[_stakeOwner];
    return (pendingRelease.amount, pendingRelease.releaseTime);
  }

  function balanceOf(address _stakeOwner) public view returns(uint balance){
    return balances[_stakeOwner];
  }

  function currentTimestamp() internal view returns (uint256 timestamp) {
    return block.timestamp;
  }
}
