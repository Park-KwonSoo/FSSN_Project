const zmq = require('zeromq');
const { Worker } = require('worker_threads');

const PORT_NAME_SERVER = 9001,
    PORT_CHAT_PUBLISHER = 9002,
    PORT_CHAT_COLLECTOR = 9003,
    PORT_SUBSCRIBE = 9004,
    GLOBAL_TOPIC = 'NAMESERVER';



const searchNameServer = async (ipMask, localIpAddr, portNameServer) => {
    const req = new zmq.Subscriber({
        receiveTimeout : 2000
    }); //set receive timeout : 2seconds;

    for (let last = 1; last < 255; last++) {
        const targetIpAddr = `tcp://${ipMask}.${last}:${portNameServer}`;
        req.connect(targetIpAddr);
        req.subscribe(GLOBAL_TOPIC);
    }

    try {
        const [topic, ipAddr] = await req.receive();
        if(topic.toString() === GLOBAL_TOPIC) {
            return ipAddr.toString();
        } else {
            return null;
        }
    } catch(e) { 
        return null;
    }
};

//local ip address를 가져옴
const getMyIpAddr = async () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for await (const name of Object.keys(nets)) {
        for await (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
};



const main = async (username) => {
    const ipAddr = await getMyIpAddr();
    const ipmask = ipAddr.split('.').slice(0, 3).join('.');

    console.log('searching for p2p server');

    let ipAddrP2PServer = '';
    const nameServerIpAddr = await searchNameServer(ipmask, ipAddr, PORT_NAME_SERVER);
    if (!nameServerIpAddr) {
        ipAddrP2PServer = ipAddr;
        console.log('p2p server is not found, and p2p server mode is activated.');

        //beaconServer on
        new Worker('./beaconServer.js', {
            workerData : {
                localIpAddr : ipAddrP2PServer,
                portNameServer : PORT_NAME_SERVER,
                globalTopic : GLOBAL_TOPIC,
            }
        });

        //userManagerServer on
        new Worker('./userManager.js', {
            workerData : {
                localIpAddr : ipAddrP2PServer,
                portSubscribe :  PORT_SUBSCRIBE,
            }
        });

        //relayServer on
        new Worker('./relayServer.js', {
            workerData : {
                localIpAddr : ipAddrP2PServer, 
                portChatPublisher : PORT_CHAT_PUBLISHER,
                portChatCollector : PORT_CHAT_COLLECTOR, 
            }
        })

    } else {
        ipAddrP2PServer = nameServerIpAddr;
        console.log(`p2p server found at ${ipAddrP2PServer} and p2p client mode is activated.`);
    }

    console.log('starting user registration procedure.');

    //새로운 request socket을 등록하여, 메인 서버가 되는 p2p 서버에 연결한다.
    const dbClientSocket = new zmq.Request;
    dbClientSocket.connect(`tcp://${ipAddrP2PServer}:${PORT_SUBSCRIBE}`);

    //p2p 서버에 등록하기 위한 메시지를 보낸다 : ip주소와 client 이름(argv[2])
    //이것은 서버도 마찬가지로 보내야함
    await dbClientSocket.send([ipAddr, username]);
    //등록 성공후 ok 메시지를 받으면 등록 완료 메시지를 출력한다.
    const [msg] = await dbClientSocket.receive();
    if (msg.toString() === 'ok') {
        console.log('user registration to p2p server completed.'); 
    } else {
        console.log('user registration to p2p server failed.')
    }

    console.log('starting message transfer procedure.');


    //relay socket for Subsriber
    const p2pRx = new zmq.Subscriber;
    p2pRx.connect(`tcp://${ipAddrP2PServer}:${PORT_CHAT_PUBLISHER}`);
    p2pRx.subscribe('RELAY');

    //relay socket for Push
    const p2pTx = new zmq.Push;
    p2pTx.connect(`tcp://${ipAddrP2PServer}:${PORT_CHAT_COLLECTOR}`);

    console.log('starting autonomous message transmit and receive scenario.');

    while(1) {
        try {
            setTimeout(async () => {
                const msg = `(${username}, ${ipAddr})`;
                await p2pTx.send([msg]);
                console.log("p2p-send::==>>", msg);
            }, 3000);
            
            const [topic, msg] = await p2pRx.receive();
            console.log(`p2p-recv::<<== ${msg.toString()}`);
            
        } catch(e) {
            console.error(e);
        }
    }

    dbClientSocket.close();
    p2pRx.close();
    p2pTx.close();


};

main(process.argv[2]);