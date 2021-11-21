# ZMQ by Node.JS - Bidirection

## 이성원 교수님 FSSN - 경희대학교 컴퓨터공학과 박권수

본 문서는, 2021년 2학기 컴퓨터공학과 이성원 교수님의 풀스택서비스네트워킹(이하 FSSN) 수업의 ZMQ 파트 - Publish-Subscribe Pattern에서 python으로 작성된 예제를 node.js로 구현한 것에 대한 명세 문서입니다.

---

### ZMQ?

ZMQ =  Zero Message Queue의 약자이다. Application Layer에서 작동하는 비동기 메시징 큐로, Brokerless, 매우 낮은 latency, Request-Response / Publish-Subscribe / Pipeline 패턴 등을 지원하는 특징이 있다.

### Publish - Suscribe Pattern

ZMQ는 Berkeley socket API를 따른다. Socket을 생성하고 그를 통해 네트워킹을 한다. ZMQ는 비동기적으로 작동하는 특징이 있으므로 Publisher와 Subscriber 모두 비동기적으로 연결된다. Publish - Subscribe 패턴은 **단방향**이므로, 만약 Subscriber에서 Publisher로 데이터롤 전송하면 에러가 발생한다. 즉 Publisher는 특정 topic에 message를 보내고, Subscribe는 topic을 구독하면 message를 recv하게 된다. 일반적으로 데이터를 보내는 Publihser가 server, 데이터를 받게 되는 Subscriber가 client가 될 것 이다.

---

## Server

- Code

```jsx
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
```

### Client

```jsx
const zmq = require('zeromq');

const main = async() => {
    //client = subscriber, zmq의 socket method에 argument로 'sub'를 넣어 pub - sub 패턴의 subscriber를 생성
    const subsciber = zmq.socket('sub');
    //subscriber는 server에서 bind된 주소값을 connect 한다.
    subsciber.connect('tcp://localhost:5555');
    //subscriber는 sub 패턴이기 때문에, 특정 topic을 구독해야 한다. 여기서는 파이썬 예제처럼 10001이라는 토픽을 구독한다.
    subsciber.subscribe('10001');

    //총 20번의 메시지를 받기 위한 count 값과, 평균 온도를 계산하기 위한 totalTemp값을 둔다.
    let [count, totalTemp] = [0, 0];
    subsciber.on('message', (topic, message) => {
        //message = temperature/humidity이다.
        const [temperature, humidity] = `${message}`.split('/');
        //totalTemp에 temperature 값을 추가한다.
        totalTemp += parseInt(temperature);
        //메시지를 출력한다.
        console.log(`Received temperature for zipcode '${topic}' was ${temperature}F`, ++count);
        //만약 20번의 count가 완료된다면 socket과 main 함수를 종료한다.
        if (count === 20) {
            console.log('Averate Temperature was', parseFloat(totalTemp / count), 'F');
            subsciber.close();
        }
    });

};

main();
```

### Server - Client * 3

![https://user-images.githubusercontent.com/72953899/142759540-2a91796f-77f3-4619-b232-8087236cb136.png](https://user-images.githubusercontent.com/72953899/142759540-2a91796f-77f3-4619-b232-8087236cb136.png)

---

### Let's Start!

```html
git clone https://github.com/Park-KwonSoo/FSSN_Project.git
yarn global add @zeromq
cd zmq
//zmq
node server
node client
```

---

### License