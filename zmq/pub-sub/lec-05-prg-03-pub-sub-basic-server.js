const zmq = require('zeromq');

const main = async() => {
    //server = publisher. publisher를 생성
    const publisher = new zmq.Publisher;
    
    //publisher를 동기적으로 bind한다.
    //tcp 위에서 동작하며 protocol은 tcp로, 포트는 5555로 설정한다.
    await publisher.bind('tcp://*:5555');

    //에러가 발생하지 않고 정상 연결 된다면 연결되었다는 메시지를 출력
    console.log("Server Connected Port : 5555");

    //지속적인 메시지를 보낸다
    while (true) {
        //topic을 설정 : 1 ~ 100,000까지의 정수
        const zipcode = Math.floor(Math.random() * 100000 + 1);

        //temperature : -80 ~ 135까지의 정수
        const temperature = Math.floor(Math.random() * 256 - 80);

        //humidity : 10 ~ 60까지의 정수
        const humidity = Math.floor(Math.random() * 51 + 10);

        //publisher의 send method를 통해 메시지를 보낼 수 있다.
        //send의 parameter는 길이가 2인 array이다.
        //array[0] = topic, array[1] = message
        //topic은 zipcode, message는 temperature/humidity가 된다
        await publisher.send([zipcode, `${temperature}/${humidity}`]);
    };

};

main();