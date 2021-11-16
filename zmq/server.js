const zmq = require('zeromq');

const main = async() => {
    const socket = new zmq.Request();

    await socket.bind('tcp://*:5555');

    for await (const [msg] of socket) {
        console.log(`Received : [${msg.toString()}]`);
        await socket.send('World!');
    }
};

main();