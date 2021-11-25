const zmq = require('zeromq');

const main = async() => {
    const socket = new zmq.Reply

    await socket.bind("tcp://127.0.0.1:3000");

    for await (const [msg] of socket) {
        console.log("Received request:", msg.toString());
        await socket.send("world!");
    }
}

main();