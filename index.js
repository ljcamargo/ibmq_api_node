var request = require('request'),
    promise = require('promise');

module.exports = {
  config:  {
    'verbose': false,
    'timeout': 20000,
    'url': 'https://quantumexperience.ng.bluemix.net/api',
    'shots': 1,
    'seed': 1,
    'device': 'simulator',
    'lang': 'QASM2',
    'name': 'Experiment',
    'jobName': 'Job',
    'apiToken': null,
    'user': null,
    'token': null,
    'auth': null
  },

  init: function(config) {
    this.config = Object.assign(this.config, config || {});
  },

  login: function(api_token) {
    var me = this;
    this.config.apiToken = api_token;
    return new promise((resolve, reject) => {
      me.getToken(api_token).then(val => {
        me.setAuth(val);
        resolve(val);
      }).catch(val => {
        reject(val);
      });
    });
  },

  dispatch: function(error, response, body, resolve, reject) {
    if (!error && (response.statusCode >= 200 && response.statusCode < 300)) {
      if (this.config.verbose) console.log('success ' + response.statusCode);
      resolve(JSON.parse(body));
    } else {
      console.log('error ' + response.statusCode + ' ' + error);
      reject(error);
    }
  },

  call: function(method, path, params, form, auth = true) {
    path = path || "";    var me = this;
    params = params || {};
    if (auth) params['access_token'] = this.config.token;
    var url = this.config.url + path + this.serialize(params);
    if (this.config.verbose) console.log("method " + method + " on " + url);
    return new promise((resolve, reject) => {
      if (method == 'get') { 
        request.get(url, 
          (error, response, body) => { me.dispatch(error, response, body, resolve, reject) }
        );
      } else {
        request.post(url, {'form': form}, 
          (error, response, body) => { me.dispatch(error, response, body, resolve, reject) }
        );
      }
      setTimeout(() => {
        reject("Timeout!");
      }, me.config.timeout);
    });
  },

  get: function(path, params, auth = true) {
    return this.call('get', path, params, null, auth);
  },

  post: function(path, params, form, auth = true) {
    return this.call('post', path, params, form, auth);
  },

  setAuth: function(auth) {
    this.config.user = auth.userId;
    this.config.token = auth.id;
    this.config.auth = auth;
  },

  getAuth: function() {
    return this.config.auth;
  },

  getToken: function(api_token) {
    return this.post('/users/loginWithToken',{},{'apiToken':api_token}, false);
  },

  getExecution: function(id) {
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
    return this.get('/users/' + this.config.user + '/codes/latest', {'includeExecutions':includeExecutions});
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
      'shots': shots || this.config.shots,
      'seed': seed || this.config.seed,
      'deviceRunType': device || this.config.device
    }, form = {
      'qasm': code,
      'codeType': lang || this.config.lang,
      'name': name || (this.config.name + new Date())
    };
    return this.post('/codes/execute', params, form);
  },

  postJob: function(codes, lang, device, name, shots, seed, max) {
    var params = {}, form = {
      'qasms': codes,
      'seed': seed || this.config.seed,
      'shots': shots || this.config.shots,
      'codeType': lang || this.config.lang,
      'name': name || (this.config.jobName + new Date()),
      'backends': { 'name': device || this.config.device }
    };
    return this.post('/Jobs', params, form);
  },

  serialize: function(obj) {
    return '?'+Object.keys(obj).reduce(function(a,k){a.push(k+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
  }
};