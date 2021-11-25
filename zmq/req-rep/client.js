const zmq = require("zeromq")

const main = async() => {
    const socket = new zmq.Request;

    socket.connect("tcp://127.0.0.1:3000")
    console.log("Producer bound to port 3000")

    for (let i = 0; i < 10; i++) {
        console.log("Sending Request ...", i);
        socket.send(i);

        const [result] = await socket.receive();
        console.log(result.toString());
    }
}

main();