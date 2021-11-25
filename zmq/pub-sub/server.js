const zmq = require('zeromq');

const main = async() => {
    //server = publisher. publisher를 생성하기 위해 socket을 생성하고, socket 타입은 'pub'로 설정한다.
    //node의 zmq의 socket은 method로, socket 타입을 인자로 받아 connect 되지 않은 새로운 socket을 생성하여 반환한다.
    //즉 아래의 코드는 다음과 같다.
    /**
     * const publisher = new zmq.Socket('pub');
     */
    const publisher = zmq.socket('pub');
    
    //publisher를 동기적으로 bind한다.
    //tcp 위에서 동작하며 protocol은 tcp로, 주소는 localhost인 127.0.0.1로, 포트는 5555로 설정한다.
    //단 해당 url을 tcp://localhost:5555 설정하면 에러가 난다. 반드시 127.0.0.1로 설정해야한다.
    publisher.bindSync('tcp://127.0.0.1:5555');

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
        publisher.send([zipcode, `${temperature}/${humidity}`]);
    };

};

main();