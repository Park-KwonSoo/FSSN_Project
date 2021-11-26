const zmq = require('zeromq');

const ClientTask = async () => {

    const socket = new zmq.Dealer;
    socket.connect('tcp://localhost:5570');
    console.log(`Client Started#${process.pid}`);

    let reqs = 0;
    await socket.send([reqs, '#' + process.pid]);
    
    while(1) {
        const recv = await socket.receive();
        if(recv) {
            const [pos, msg, worker] = recv;
            console.log(`Req Send ${reqs}`);
            await socket.send([reqs++, '#' + process.pid]);
            console.log(`Get Msg : ${msg.toString()} from ${worker}`);
        }
    }

};

const main = () => {
    ClientTask();
};

main();