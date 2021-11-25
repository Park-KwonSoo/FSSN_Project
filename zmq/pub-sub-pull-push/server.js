const zmq = require('zeromq');

const main = async () => {
    const publisher = new zmq.Publisher;
    await publisher.bind("tcp://*:5557");
    const collector = new zmq.Pull;
    await collector.bind('tcp://*:5558');

    for await (const [msg] of collector) {
        console.log('I : publishing msg : ', msg.toString());
        publisher.send(['zmq3', msg.toString()]);
    }

};

main();