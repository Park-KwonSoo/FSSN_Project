const zmq = require('zeromq');
const { workerData } = require('worker_threads');

class UserManagerNameServer {

    localIpAddr = null;
    portSubscribe = null;
    
    constructor({ localIpAddr, portSubscribe }) {
        this.localIpAddr = localIpAddr;
        this.portSubscribe = portSubscribe;
    }

    async run() {
        const reply = new zmq.Reply;
        await reply.bind(`tcp://${this.localIpAddr}:${this.portSubscribe}`);
        console.log(`local p2p db server is activated at tcp://${this.localIpAddr}:${this.portSubscribe}`);
        console.log('p2p subsciber database server is activated.');

        const userDb = [];
        // eslint-disable-next-line no-constant-condition
        while(1) {
            try {   
                const [ipAddr, username] = await reply.receive();
                userDb.push([ipAddr.toString(), username.toString()]);
                console.log(`user registration ${username.toString()} from ${ipAddr.toString()}`);
                await reply.send('ok');
            } catch(e) {
                console.error(e);
                break;
            }
        }
    }
}

const main = () => {
    const userManagerNameServer = new UserManagerNameServer(workerData);
    userManagerNameServer.run();
};

main();