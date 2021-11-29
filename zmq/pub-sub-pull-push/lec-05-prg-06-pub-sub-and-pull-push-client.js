const zmq = require('zeromq');

const main = async () => {
    const subscriber = new zmq.Subscriber;
    subscriber.connect('tcp://localhost:5557');
    subscriber.subscribe('zmq3');

    const pusher = new zmq.Push;
    pusher.connect('tcp://localhost:5558');

    let randNum = Math.floor(Math.random() * 99 + 1);
    pusher.send(randNum);
    
    while(1) {
        const [topic, msg] = await subscriber.receive();
        console.log("I Received message : ", msg.toString());
        randNum = Math.floor(Math.random() * 99 + 1);
        if (randNum < 50) { 
            pusher.send("I Sending Message : " + randNum);
        }
    }

};

main();