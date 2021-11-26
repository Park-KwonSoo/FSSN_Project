const zmq = require('zeromq');
const { Worker } = require('worker_threads');

const DIR_NAME = '/Users/parkkwonsoo/Desktop/Project/FSSN_Project/zmq/dealer-router';
const FRONTEND_ADDR = 'tcp://*:5570';
const BACKEND_ADDR = 'inproc://backend';


const ServerTask = async () => {

    const frontend = new zmq.Router;
    await frontend.bind(FRONTEND_ADDR);

    const backend = new zmq.Dealer;
    await backend.bind(BACKEND_ADDR);

    for (let i = 0; i < 3; i++)
       new Worker(DIR_NAME + '/serverWorker.js');
    

    const proxy = new zmq.Proxy(frontend, backend);
    await proxy.run();

    frontend.close();
    backend.close();

};

ServerTask();