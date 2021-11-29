const zmq = require('zeromq');

const main = async() => {
    //client = subscriber, zmq의 socket method에 argument로 'sub'를 넣어 pub - sub 패턴의 subscriber를 생성
    const subsciber = new zmq.Subscriber;
    //subscriber는 server에서 bind된 주소값을 connect 한다.
    subsciber.connect('tcp://localhost:5555');
    //subscriber는 sub 패턴이기 때문에, 특정 topic을 구독해야 한다. 여기서는 파이썬 예제처럼 10001이라는 토픽을 구독한다.
    subsciber.subscribe('10001');

    //총 20번의 메시지를 받기 위한 count 값과, 평균 온도를 계산하기 위한 totalTemp값을 둔다.
    let [count, totalTemp] = [0, 0];
    while(1) {
        const [topic, message] = await subsciber.receive();

        //message = temperature/humidity이다.
        const [temperature, humidity] = message.toString().split('/');
        //totalTemp에 temperature 값을 추가한다.
        totalTemp += parseInt(temperature);
        //메시지를 출력한다.
        console.log(`Received temperature for zipcode '${topic}' was ${temperature}F`, ++count);
        if (count === 20) {
            console.log('Averate Temperature was', parseFloat(totalTemp / count), 'F');
            break;
        }
    }
    
    subsciber.close();

};

main();