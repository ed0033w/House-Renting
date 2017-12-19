pragma solidity ^0.4.0;
contract House {

    address _renter;
    address _buyer;

    //幾房幾廳幾衛
    uint _family_room;
    uint _living_room;
    uint _bedroom;
    
    //租金
    uint _rent;
    //押金
    uint _deposit;
    //幾個月付一次
    uint _month;

    function house(uint rent, uint deposit, uint month) public {
        _renter = msg.sender;
        _rent = rent;
        _deposit = deposit;
        _month = month;
    }

    function buy() public {
        if (msg.value < _deposit) {
            revert();
        }
        _buyer = msg.sender;
        _renter.transfer(msg.value);
    }

    function pay() payable public {
        if (msg.value < _rent) {
            revert();
        }
        _renter.transfer(msg.value);
    }

}