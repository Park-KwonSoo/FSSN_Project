const zmq = require('zeromq');

//Router에 연결됨
const ClientTask = async (routingId) => {

    //Router에 연결될 때는 반드시 routingId를 지정해줘야한다!
    //routingId가 지정이 되지 않으면 메시지를 받을 수 없다.
    const socket = new zmq.Dealer({
        routingId
    });
    socket.connect('tcp://localhost:5570');
    console.log(`Client Started#${socket.routingId}`);

    let reqs = 0;
    //모든 dealer에게 메시지를 전송한다.
    await socket.send(reqs);
    
    //Node의 특성상, polls는 사용할 수 없다..
    while(1) {
        //메시지를 받을 때까지 대기.
        const [workerId] = await socket.receive();
        if(workerId) {
            //메시지를 받는다. serverWorker에서 전달하는 메시지가 serverWorker의 thread Id이기 때문에 변수명을 다음과 같이 선언함.
            setTimeout(async() => {
                console.log(`Get Msg from #${workerId}`);
                await socket.send(++reqs);
                console.log(`Req Send #${reqs}`);

            }, 1000);
        }
    }

};

const main = (argv) => {
    if(!argv) {
        console.error('No Argv');
        return;
    }
    ClientTask(argv);
};

main(process.argv[2]);