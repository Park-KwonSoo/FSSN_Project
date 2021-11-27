const zmq = require('zeromq');

const main = async () => {
    const publisher = new zmq.Publisher;
    await publisher.bind("tcp://*:5557");
    
    const collector = new zmq.Pull;
    await collector.bind('tcp://*:5558');

    while(1) {
        const [msg] = await collector.receive();
        console.log('I : publishing msg : ', msg.toString());
        publisher.send(['zmq3', msg.toString()]);
    }

};

main();