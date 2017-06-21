
var ibmq_api = {

  http: require('http'),
  url: 'https://quantumexperience.ng.bluemix.net/api',
  user: null,
  token: null,

  init: function(api_token, callback, fallback) {
     ibmq_api.getToken(api_token, callback, fallback);
  },

  getToken: function(api_token, callback, fallback) {
     var request = require('request');
     var _url = ibmq_api.url + '/users/loginWithToken';
     request.post(_url, {form: {'apiToken':api_token}}, function(error, response, body) { 
     if (!error && (response.statusCode >= 200 && response.statusCode < 400)) {
         console.log('success ' + response.statusCode);
         console.log(body);
         ibmq_api.user = response.userId;
         ibmq_api.token = response.id;
         callback();
       } else {
         console.log('error ' + response.statusCode);
         console.log(error);
         fallback();
       }
     });

  }

}

var token = '8f2e03f0e2c74706b7af537b88433984f9b1608e469758442cfd7c3388141f4480ef5bbd229d17879341feb80a4e0b3dcc341e7c028e4490864815ca79ab586a';

ibmq_api.init(token, function(){
  console.log('ok');
}, function() {
  console.log('not ok');
});

