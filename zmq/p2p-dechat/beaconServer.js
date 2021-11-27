const zmq = require('zeromq');
const { workerData } = require('worker_threads');

class BeaconNameServer {

    localIpAddr = null;
    portNameServer = null;
    globalTopic = null;

    constructor({ localIpAddr, portNameServer, globalTopic }) {
        this.localIpAddr = localIpAddr;
        this.portNameServer = portNameServer;
        this.globalTopic = globalTopic;
    }

    async run () {
        const publisher = new zmq.Publisher;
        await publisher.bind(`tcp://${this.localIpAddr}:${this.portNameServer}`);
        console.log(`local p2p name server is activated at tcp://${this.localIpAddr}:${this.portNameServer}`);
        console.log("p2p beacon server is activated.");
        
        // eslint-disable-next-line no-constant-condition
        setInterval(async () => {
            try {
                await publisher.send([this.globalTopic, this.localIpAddr]);
            } catch(e) {
                console.error(e);
            }
        }, 1000);
    }
}

const main = () => {
    const beaconNameServer = new BeaconNameServer(workerData);
    beaconNameServer.run();
};

main();