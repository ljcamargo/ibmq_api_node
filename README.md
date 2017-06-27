# IBMQ API for node.js
[![GitHub version](https://badge.fury.io/gh/lsjcp%2Fquantumjs.svg)](https://badge.fury.io/gh/lsjcp%2Fquantumjs)

This is an open source API Client for node.js for **IBM Quantum Experience** that allows the execution of **QASM** into a Quantum Computer or Simulator.

You need an account and token granted by IBM Quantum Experience to use the API. To know more and request access  visit [IBM Quantum Experience](https://quantumexperience.ng.bluemix.net/qstage/#).

### Install

Install the node module via npm

```
npm install ibmq_api --save
```

## Usage
Include the module on your project
```javascript
var api = require('ibmq_api');
```

Most of the API calls require a token authentication. Perform a login before calling any other API call.
```javascript
api.login(YOUR_API_TOKEN).then(val => {
  //Login Successful, you may use other api call.
}).catch(val => {
  //Failed Auth
});
```
Your login token and login data are kept on the object so you only need to login while the object is kept on memory, but you may retrive your auth data from the server and store it elsewhere
```javascript
var auth = api.getAuth();
```
and set it to a new object
```javascript
var api2 = require('ibmq_api');
api2.setAuth(auth);
```
### API Methods
All API methods return a Promise object.

**Run QASM Code**
```javascript
//YOUR QASM CODE
var qasm = 'include "qelib1.inc";\nqreg q[5];\ncreg c[5];\nx q[0];';
//DEVICE
var device = 'simulator';
api.run(qasm, 'QASM2', device).then(val => {
    //PRINT EXECUTION RESULTS
    console.log('Code succesfully executed ');
    console.log('Result Data' + JSON.stringify(val, null, 2));
}).catch(val => console.log('Error executing code ' + val));
```

**Get Devices Available**
```javascript
api.getDevices().then(val => {
    console.log('Got devices! ' + JSON.stringify(val));
}).catch(val => console.log('Error getting devices ' + val));
```

**Get Execution**
```javascript
var executionId = 01021020934....; //YOUR EXECUTION ID
api.getExecution(executionId).then(val => {
    console.log('Execution Results ' + JSON.stringify(val, null, 2));
}).catch(val => console.log('Error getting execution' + val));
```

**Get All Executions of Code**
```javascript
var codeId = 01021020934....; //YOUR CODE ID
api.getCodeExecutions(codeId).then(val => {
    console.log('All Executions of Code ' + JSON.stringify(val, null, 2));
}).catch(val => console.log('Error getting code executions' + val));
```



----

Learn more about the other methods by checking the examples



