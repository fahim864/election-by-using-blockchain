App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    }else{
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Election.json", function (election){
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    });
  },

  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();
    
    //Load Account Details
    web3.eth.getCoinbase((err, res) => {
      if (err === null) {
        App.account = res;
        $("#accountAddress").html("Your account: " + res);
      }
    })

    //Load contract data and Account
    App.contracts.Election.deployed().then(function(i){
      electionInstance = i;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount){
      var candidatesResult = $('#candidatesResults');
      candidatesResult.empty();

      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
      for(var i = 1; i<=candidatesCount; i++){
        electionInstance.candidates(i).then(function(candidate){
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          var candidateTemplate = "<tr><th>"+id+"</th><th>"+name+"</th><th>"+voteCount+"</th></tr>";
          candidatesResult.append(candidateTemplate);

          var candidateOption = "<option value='"+id+"' >"+name+"</option>";
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    }).then(function(hasVoted){

      if(hasVoted){
        $('#form-hide').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error){
      console.warn(error);
    })
  },

  castVote: function(){
    var loader = $("#loader");
    var content = $("#content");
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(i){
      return i.vote(candidateId, { from:App.account });
    }).then(function(result){
      loader.show();
      content.hide();
      window.location.reload();
    }).catch(function(err){
      console.error(err);
    });
  }
  

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
