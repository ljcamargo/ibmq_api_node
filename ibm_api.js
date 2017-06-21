
var ibmq_api = {
  request: require('request'),
  promise: require('promise'),
  url: 'https://quantumexperience.ng.bluemix.net/api',
  user: null, token: null, auth: null,

  log: function(api_token) {
    return new this.promise((resolve, reject) => {
      this.getToken(api_token).then(val => {
        ibmq_api.user = val.userId;
        ibmq_api.token = val.id;
        ibmq_api.auth = val;
        resolve(val);
      }).catch(val => {
        reject(val);
      });
    });
  },

  get: function(path, params, auth = true) {
    path = path || "";
    params = params || {};
    if (auth) params['access_token'] = this.token;
    var _url = ibmq_api.url + path + this.serialize(params);
    console.log("getting " + _url);
    return new this.promise((resolve, reject) => {
      ibmq_api.request.get(_url, (error, response, body) => {
        if (!error && (response.statusCode >= 200 && response.statusCode < 400)) {
          console.log('success ' + response.statusCode);
          resolve(JSON.parse(body));
        } else {
          console.log('error ' + response.statusCode + ' ' + error);
          reject(error);
        }
      });
    });
  },

  post: function(path, params, _form, auth = true) {
    path = path || "";
    params = params || {};
    if (auth) params['access_token'] = this.token;
    var _url = ibmq_api.url + path + this.serialize(params);
    console.log("posting " + _url);
    return new this.promise((resolve, reject) => {
      ibmq_api.request.post(_url, {form: _form}, (error, response, body) => {
        if (!error && (response.statusCode >= 200 && response.statusCode < 400)) {
          console.log('success ' + response.statusCode);
          resolve(JSON.parse(body));
        } else {
          console.log('error ' + response.statusCode + ' ' + error);
          reject(error);
        }
      });
    });
  },

  getAuth: function() {
    return ibmq_api.auth;
  },

  getToken: function(api_token) {
    return this.post('/users/loginWithToken',{},{'apiToken':api_token}, false);
  },

  getExecutions: function(id) {
    return this.get('/Executions/' + id);
  },

  getCode: function(id) {
    return this.get('/Codes/' + id);
  },

  getCodeExecutions: function(id) {
    return this.get('/Codes/' + id + '/executions');
  },

  getCodeImage: function(id) {
    return this.get('/Codes/' + id + '/export/png/url');
  },

  getLastCodes: function(includeExecutions = true) {
    return this.get('/users/' + this.user + '/codes/latest', {'includeExecutions':includeExecutions});
  },

  run: function(code, version, device, shots, name, seed) {
    var params = {
      'shots': shots || 1,
      'seed': seed,
      'deviceRunType': device || 'simulator'
    }, form = {
      'qasm': code,
      'codeType': version || 'QASM2',
      'name': name || ('Experiment' + new Date())
    };
    return this.post('/codes/execute', params, form);
  },

  job: function(codes, version, device, name, shots, seed, max) {
    var params = {}, form = {
      'qasms': codes,
      'seed': seed,
      'shots': shots || 1,
      'codeType': version || 'QASM2',
      'name': name || ('Job' + new Date()),
      'backends': { 'name': device || 'simulator' }
    };
    return this.post('/Jobs', params, form);
  },

  serialize: function(obj) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
  }

};

var token = '8f2e03f0e2c74706b7af537b88433984f9b1608e469758442cfd7c3388141f4480ef5bbd229d17879341feb80a4e0b3dcc341e7c028e4490864815ca79ab586a';
var qasm = 'include "qelib1.inc";\nqreg q[5];\ncreg c[5];\nx q[0];\nid q[1];\nid q[2];\nh q[0];\nh q[1];\nh q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\ncx q[0],q[1];\ncx q[1],q[2];\ncx q[0],q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];';

ibmq_api.log(token).then(val => {
  
  ibmq_api.run(qasm, 'QASM2', 'simulator').then(val => {
    console.log('did RUN!');
    console.log(JSON.stringify(val));
    ibmq_api.getLastCodes().then(val => {
      console.log('getLastCodes ' + JSON.stringify(val));
      /*ibmq_api.getExecutions('0').then(val => {
        console.log('then! ' + val);
      }).catch(val => {
        console.log('catch! ' + val);
      });*/
    }).catch(val => {
      console.log('getLastCodes ERR!' + val);
    });
  }).catch(val => {
    console.log('didnt run :(');
    console.log(val);
  });
}).catch(val => {
  console.log('Failed Authentication' + val);
});



