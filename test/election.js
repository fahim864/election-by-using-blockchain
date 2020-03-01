var Election = artifacts.require('./Election.sol');

contract("Election", function(accounts){
    it("initializes with two Candidates", function (){
        return Election.deployed().then(function(instance){
            return instance.candidatesCount();
        }).then(function(count){
            assert.equal(count, 2)
        });
    });
    it("it initializes the candidates with the correct value", function(){
        return Election.deployed().then(function(i){
            electionInstance = i;
            return electionInstance.candidates(1);
        }).then(function(candidate){
            assert.equal(candidate[0], 1, "Contains Correct Id");
            assert.equal(candidate[1], 'Candidate 1', "Contains Correct Name");
            assert.equal(candidate[2], 0, "Contains Correct Counter");
            return electionInstance.candidates(2);
        }).then(function(candidate){
            assert.equal(candidate[0], 2, "Contains Correct Id");
            assert.equal(candidate[1], 'Candidate 2', "Contains Correct Name");
            assert.equal(candidate[2], 0, "Contains Correct Counter");
        });
    });
});