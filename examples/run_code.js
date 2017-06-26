
var api = require('ibmq_api');
var token = '8f2e03f0e2c74706b7af537b88433984f9b1608e469758442cfd7c3388141f4480ef5bbd229d17879341feb80a4e0b3dcc341e7c028e4490864815ca79ab586a';
var qasm = 'include "qelib1.inc";\nqreg q[5];\ncreg c[5];\nx q[0];\nid q[1];\nid q[2];\nh q[0];\nh q[1];\nh q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\ncx q[0],q[1];\ncx q[1],q[2];\ncx q[0],q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];';

//Login to IBMQ
api.login(token).then(val => {
  //Login succesful, now execute the qasm code on the simulator
  api.run(qasm, 'QASM2', 'simulator').then(val => {
    //PRINT RUN RESULTS
    console.log('Code succesfully executed');
    var executionId = val.id, codeId = val.codeId;
    console.log('Execution Id' + executionId);
    console.log('Code Id' + codeId);
    console.log('Result Data' + JSON.stringify(val.result.data, null, 2));
    //now get the execution result
  	api.getExecution(executionId).then(val => {
  	  console.log('Execution Results ' + JSON.stringify(val, null, 2));
  	  //then, get all the executions for the current code
  	  api.getCodeExecutions(codeId).then(val => {
  	  	console.log('All Executions of Code ' + JSON.stringify(val, null, 2));
  	  	
  	  }).catch(val => console.log('Error getting code executions' + val));
  	}).catch(val => console.log('Error getting execution' + val));
  }).catch(val => console.log('Error executing code ' + val));
}).catch(val => console.log('Failed Authentication' + val));
  //Your auth token and credentials are kept inside the object

//Login to IBMQ
api.login(YOUR_API_TOKEN).then(val => {
  //Login Successful, you may use other api call.
})
.catch(val => {
  //Failed Auth
});