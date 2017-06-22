
var IBMQ_API = {
  request: require('request'),
  promise: require('promise'),
  url: 'https://quantumexperience.ng.bluemix.net/api',
  apiToken: null, user: null, token: null, auth: null,
  defaults:  {
    'shots': 1,
    'seed': 1,
    'device': 'simulator',
    'lang': 'QASM2',
    'name': 'Experiment'
  },

  log: function(api_token) {
    this.apiToken = api_token;
    return new this.promise((resolve, reject) => {
      this.getToken(api_token).then(val => {
        IBMQ_API.user = val.userId;
        IBMQ_API.token = val.id;
        IBMQ_API.auth = val;
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
    var _url = IBMQ_API.url + path + this.serialize(params);
    console.log("getting " + _url);
    return new this.promise((resolve, reject) => {
      IBMQ_API.request.get(_url, (error, response, body) => {
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
    var _url = IBMQ_API.url + path + this.serialize(params);
    console.log("posting " + _url);
    return new this.promise((resolve, reject) => {
      IBMQ_API.request.post(_url, {form: _form}, (error, response, body) => {
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

  init: function(api_token) {
    this.apiToken = api_token;
  },

  setAuth: function(user, token) {
    this.user = user;
    this.token = token;
  },

  getAuth: function() {
    return IBMQ_API.auth;
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

  getExportedImage: function(id) {
    return this.get('/Codes/' + id + '/export/png/url');
  },

  getLatestCodes: function(includeExecutions = true) {
    return this.get('/users/' + this.user + '/codes/latest', {'includeExecutions':includeExecutions});
  },

  getJob: function(id) {
    return this.get('/Jobs/' + id);
  },

  getDeviceStatus: function(id) {
    return this.get('/Status/queue', {'device' : id}, false);
  },

  getDeviceParams: function(id) {
    return this.get('/Backends/' + id + '/parameters');
  },

  getDeviceCalibration: function(id) {
    return this.get('/Backends/' + id + '/calibration');
  },

  getDevices: function() {
    return this.get('/Backends');
  },

  run: function(code, lang, device, shots, name, seed) {
    var params = {
      'shots': shots || this.defaults.shots,
      'seed': seed || this.defaults.seed,
      'deviceRunType': device || this.defaults.device
    }, form = {
      'qasm': code,
      'codeType': lang || this.defaults.lang,
      'name': name || (this.defaults.name + new Date())
    };
    return this.post('/codes/execute', params, form);
  },

  postJob: function(codes, lang, device, name, shots, seed, max) {
    var params = {}, form = {
      'qasms': codes,
      'seed': seed || this.defaults.seed,
      'shots': shots || this.defaults.shots,
      'codeType': lang || this.defaults.lang,
      'name': name || (this.defaults.jobName + new Date()),
      'backends': { 'name': device || this.defaults.device }
    };
    return this.post('/Jobs', params, form);
  },

  serialize: function(obj) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
  }

};

var token = '8f2e03f0e2c74706b7af537b88433984f9b1608e469758442cfd7c3388141f4480ef5bbd229d17879341feb80a4e0b3dcc341e7c028e4490864815ca79ab586a';
var qasm = 'include "qelib1.inc";\nqreg q[5];\ncreg c[5];\nx q[0];\nid q[1];\nid q[2];\nh q[0];\nh q[1];\nh q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\ncx q[0],q[1];\ncx q[1],q[2];\ncx q[0],q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];';


//LOGIN TO IBMQ
IBMQ_API.log(token).then(val => {
  //GET CURRENT DEVICES
  IBMQ_API.getDevices().then(val => {
    console.log('getDevices success ' + JSON.stringify(val));
    val.forEach(item => console.log(item.name + ' ' + item.status + ' ' + item.id));
    var deviceId = val[0].id;
    IBMQ_API.getDeviceStatus(deviceId).then(val => {
      console.log('getDeviceStatus success ' + JSON.stringify(val));
      IBMQ_API.getDeviceParams(deviceId).then(val => {
        console.log('getDeviceParams success ' + JSON.stringify(val));
        IBMQ_API.getDeviceCalibration(deviceId).then(val => {
          console.log('getDeviceCalibration success ' + JSON.stringify(val));
        }).catch(val => {
          console.log('getDeviceCalibration error ' + val);
        });
      }).catch(val => {
        console.log('getDeviceParams error ' + val);
      });
    }).catch(val => {
      console.log('getDeviceStatus error ' + val);
    });
  }).catch(val => {
    console.log('getDevices error ' + val);
  });
  /*IBMQ_API.run(qasm, 'QASM2', 'simulator').then(val => {
    console.log('run success' + JSON.stringify(val));
    IBMQ_API.getLatestCodes().then(val => {
      console.log('getLatestCodes success' + JSON.stringify(val));
    }).catch(val => {
      console.log('getLatestCodes error' + val);
    });
  }).catch(val => {
    console.log('run error ' + val);
  });*/
}).catch(val => {
  console.log('Failed Authentication' + val);
});



