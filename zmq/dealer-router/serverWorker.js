const zmq = require('zeromq');
const { threadId } = require('worker_threads');

const BACKEND_ADDR = 'inproc://backend';


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
            const recv = await worker.receive();
            if(recv) {
                const [pos, msg, client] = recv;
                console.log(`Worker#${this.id} received ${msg.toLocaleString()} from ${client.toString()}`);
                await worker.send([msg.toString(), '#' + this.id]);
            }
        }
    }
};

const main = () => {
    const worker = new ServerWorker;
    worker.run();
};

main();

