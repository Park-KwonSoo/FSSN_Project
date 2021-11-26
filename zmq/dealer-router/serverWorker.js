const zmq = require('zeromq');
const { threadId } = require('worker_threads');

const BACKEND_ADDR = 'inproc://backend';


//새 thread를 생성하기 위한 class.
//server.js에서 thread로 실행시킴으로 thread에 하나씩 해당 class가 붙게된다.
class ServerWorker {

    id = null;

    constructor() {
        this.id = threadId;
    }

    async run() {
        const worker = new zmq.Dealer;
        worker.connect(BACKEND_ADDR);
        console.log(`Worker#${this.id} Started`);

        while(1) {
            //message를 받을 때까지 대기
            const [ident, msg] = await worker.receive();
            //메시지의 첫 번째 인자는 ident = 이것은 Router의 routingId이다
            if(msg) {
                console.log(`Worker#${this.id} received ${msg.toString()} from #${ident.toString()}`);
                //메시지를 전달하기 위해 routingId를 지정해줘야함. 이 routingId가 없으면 어떤 router가 메시지를 받을지 알 수 없다.
                await worker.send([this.id, this.id]);
            }
        }
    }
};

const main = () => {
    const worker = new ServerWorker;
    worker.run();
};

main();

