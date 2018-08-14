pragma solidity ^0.4.24;

/**
 * @title AccessStakeOracleHandler
 * @dev Inbound oracle contract for receiving and storing stake balance updates from the mainnet.
 */
contract AccessStakeOracleHandler {

  struct Stake {
    uint256 lastUpdated;
    uint256 balance;
  }

  /// address of the oracle
  address internal oracle;

  /// mapping of owner addresses to stake balances
  mapping(address => Stake) ownerToStakeMapping;

  /// event emitted on every upadte
  event UpdateCompleted();

  /** @param _oracle address of the oracle
   */
  constructor(address _oracle) public {
    oracle = _oracle;
  }

  modifier onlyOracle() {
    require(msg.sender == oracle, "access forbidden");
    _;
  }

  /** @dev update function called by the oracle
   *  @param _owners an array of stake owner addresses
   *  @param _balances corresponding stake balances of the owners
   */
  function update(address[] _owners, uint256[] _balances)
    onlyOracle()
    external
  {
    require(_owners.length == _balances.length);

    for (uint256 i = 0; i < _owners.length; i++) {
      address owner = _owners[i];
      ownerToStakeMapping[owner].balance = _balances[i];
      ownerToStakeMapping[owner].lastUpdated = block.timestamp;
    }

    emit UpdateCompleted();
  }

  /** @dev returns stake balance of an owner
   *  @param balance current stake balance of the owner
   *  @param lastUpdated timestamp when the balance was last updated by the oracle
   */
  function getStakeBalance(address _owner) public view returns (uint256 balance, uint256 lastUpdated) {
    Stake storage stake = ownerToStakeMapping[_owner];
    return (stake.balance, stake.lastUpdated);
  }
}
