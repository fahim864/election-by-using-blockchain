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

    it("Allow a voter to cast a vote", function(){
        Election.deployed().then(function(i){
            electionInstance = i;
            candidateId = 1;
            return electionInstance.vote(candidateId, {from: accounts[0]});
        }).then(function(recept){
            return electionInstance.voters(accounts[0]);
        }).then(function(voted){
            assert(voted, "The voter is not give vote yet");
            return electionInstance.candidates(candidateId);
        }).then(function(candidate){
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "not increment the vote");
        });
    });

    it("throws an exception for invalid candidate", function(){
        return Election.deployed().then(function(i){
            electionInstance = i;
            return electionInstance.vote(99, { from: accounts[0]})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, "error message must revert an error.");
            return electionInstance.candidates(1);
        }).then(function(candidate1){
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "Candidate 1 gets 1 votes");
            return electionInstance.candidates(2);
        }).then(function(candidate2){
            var voteCount = candidate2[2];
            assert.equal(voteCount, 0, "Candidate 2 gets no votes");
        });
    });

    it("throws an exception for double voting", function(){
        return Election.deployed().then(function(i){
            electionInstance = i;
            candidateId = 2;
            electionInstance.vote(candidateId, {from: accounts[1]});
            return electionInstance.candidates(candidateId);
        }).then(function(candidate){
            var voteCount = candidate[2];
            assert.equal(voteCount, 1, "Accept first one for 2");

            //Try to vote again
            return electionInstance.vote(candidateId, { from:accounts[1] });
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert' >=0, "Error Message must revert error"));
            return electionInstance.candidates(1);
        }).then(function(candidate1){
            var voteCount = candidate1[2];
            assert.equal(voteCount, 1, "Candidate 1 gets 1 votes");
            return electionInstance.candidates(2);
        }).then(function(candidate2){
            var voteCount = candidate2[2];
            assert.equal(voteCount, 1, "Candidate 2 gets no votes");
        });
    });
});