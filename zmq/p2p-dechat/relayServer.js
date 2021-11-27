const zmq = require('zeromq');
const { workerData } = require('worker_threads');

class RealyServer {

    localIpAddr = null;
    portChatPublisher = null;
    portChatCollector = null;

    constructor ({ localIpAddr , portChatCollector, portChatPublisher }) {
        this.localIpAddr = localIpAddr;
        this.portChatPublisher = portChatPublisher;
        this.portChatCollector = portChatCollector;
    }

    async run () {
        const publisher = new zmq.Publisher;
        await publisher.bind(`tcp://${this.localIpAddr}:${this.portChatPublisher}`);
    
        const collector = new zmq.Pull;
        await collector.bind(`tcp://${this.localIpAddr}:${this.portChatCollector}`);
    
        console.log(`local p2p relay server activated at tcp://${this.localIpAddr}:${this.portChatPublisher} & ${this.portChatCollector}`);
        console.log('p2p message relay server is activated.');
    
        // eslint-disable-next-line no-constant-condition
        while (1) {
            try {
                const [msg] = await collector.receive();
                console.log(`p2p - relay : <==> ${msg.toString()}`);
                await publisher.send(['RELAY', msg.toString()]);
            } catch(e) {
                console.error(e);
                break;
            }
        }
    }

};


const main = () => {
    const relayServer = new RealyServer(workerData);
    relayServer.run();    
};

main();