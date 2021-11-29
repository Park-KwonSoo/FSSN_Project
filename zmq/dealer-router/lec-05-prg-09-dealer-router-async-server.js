const zmq = require('zeromq');
const { Worker } = require('worker_threads');   //thread를 생성하기 위한 node의 모듈

const DIR_PATH = '.';
const FRONTEND_ADDR = 'tcp://*:5570';
const BACKEND_ADDR = 'inproc://backend';


//서버의 작업을 실행한다.
const ServerTask = async (numberOfWorkers) => {

    //client에 연결될 front : router
    const frontend = new zmq.Router;
    await frontend.bind(FRONTEND_ADDR);

    //server Worker(즉, 서버의 로직을 처리한다. thread로 생성함) : dealer
    const backend = new zmq.Dealer;
    await backend.bind(BACKEND_ADDR);


    //받은 인자만큼 새로운 thread를 생성한다.
    const workers = []
    for (let i = 0; i < numberOfWorkers; i++)
       workers.push(new Worker(DIR_PATH + '/serverWorker.js'));
    
    //프록시를 생성하고, frontend와 backend를 연결한다.
    //두 개의 인자의 위치의 순서는 바뀌어도 상관 없음
    const proxy = new zmq.Proxy(frontend, backend);
    //프록시를 실행.
    //만약 promise로 실행하지 않는다면 segmentation fault가 발생한다.
    await proxy.run();

    frontend.close();
    backend.close(); 

};

const main = (argv) => {
    if(!argv) {
        console.error('No Argv');
        return;
    }
    ServerTask(parseInt(argv));
};

main(process.argv[2]);