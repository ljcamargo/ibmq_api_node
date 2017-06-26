
var api = require('../.');
var token = '8f2e03f0e2c74706b7af537b88433984f9b1608e469758442cfd7c3388141f4480ef5bbd229d17879341feb80a4e0b3dcc341e7c028e4490864815ca79ab586a';
var qasm = 'include "qelib1.inc";\nqreg q[5];\ncreg c[5];\nx q[0];\nid q[1];\nid q[2];\nh q[0];\nh q[1];\nh q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\ncx q[0],q[1];\ncx q[1],q[2];\ncx q[0],q[2];\nbarrier q[0],q[1],q[2],q[3],q[4];\nmeasure q[0] -> c[0];\nmeasure q[1] -> c[1];\nmeasure q[2] -> c[2];';

//Login to IBMQ
api.login(token).then(val => {
  //Get available devices
  api.getDevices().then(val => {
    console.log('Got devices! ' + JSON.stringify(val));
    //Print each device name, status and id
    console.log('Device List:');
    val.forEach(item => console.log(item.name + ' ' + item.status + ' ' + item.id));
    //Select the first device
    var deviceId = val[0].id;
    //and ask for the status
    api.getDeviceStatus(deviceId).then(val => {
      console.log('Got device status! ' + JSON.stringify(val));
      //then, get the device params
      api.getDeviceParams(deviceId).then(val => {
        console.log('Got device params! ' + JSON.stringify(val));
        //and then the calibration
        api.getDeviceCalibration(deviceId).then(val => {
          console.log('Got device calibration! ' + JSON.stringify(val));

        }).catch(val => console.log('Error getting device calibration ' + val));
      }).catch(val => console.log('Error getting device params ' + val));
    }).catch(val => console.log('Error getting device status ' + val));
  }).catch(val => console.log('Error getting devices ' + val));
}).catch(val => console.log('Failed Authentication' + val));