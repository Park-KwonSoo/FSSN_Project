# gRPC by Node.JS - Bidirection

## 이성원 교수님 FSSN - 경희대학교 컴퓨터공학과 박권수

본 문서는, 2021년 2학기 컴퓨터공학과 이성원 교수님의 풀스택서비스네트워킹(이하 FSSN) 수업의 gRPC 파트 - bidirectional에서 python으로 작성된 예제를 node.js로 구현한 것에 대한 명세 문서입니다.

---

### gRPC?

gRPC =  Google이 제공하는 RPC 프로토콜, RPC 프로토콜이란 Remote Procedure Call의 약자로 원격 컴퓨터에 접속하여 원격 컴퓨터의 함수를 호출하는 프로토콜을 말한다.

### gRPC vs HTTP1.1

gRPC가 HTTP1.1를 매우 간단히 비교하면 다음과 같은 차이가 있다.

먼저 gRPC는 HTTP1.1의 RESTful한 API들과는 달리 **URL을 이용하여 호출하지 않는다.** RPG가 원격 컴퓨터의 함수를 호출하기 위해서는 **.proto 파일을 이용**하여 호출한다. 따라서 서버, 클라이언트 구조라면 클라이언트가 서버의 함수를 호출하기 위해서는 **미리 서버에서 정의된 .proto 파일을 가지고 있어야 한다**(즉, 서버 클라이언트 모두 같은 .proto 파일이 있어야함).

그리고 **gRPC는 HTTP2** 위에서 동작한다.

장점 : HTTP1.1에 비해 매우 경량화된 데이터를 전송. HTTP1.1은 json을, gRPC는 Protobuf를 이용해 전송한다. 따라서 매우 빠름. 그리고 양방향 스트리밍을 지원한다.

단점 : 브라우저단에서 동적하지 않음, 그리고 이건 단점이라고 할 수 있는지 모르겠지만 json은 사람이 읽을 수 있는 반면 Protobuf는 바이너리 파일이기 때문에 사람이 읽을 수 없다.

### Proto

gRPC가 HTTP과의 가장 큰 차이를 만들어내는 구조라고 생각한다. RESTful한 API를 가지는 HTTP가 URL로 함수를 호출하고, json을 payload로 전달하는 것과 달리 gRPC는 proto 파일을 payload로 전달하고 이를 바탕으로 함수를 호출하는 차이가 있어 기존의 HTTP Server - Client 구조와는 꽤 큰 차이가 발생한다.

Proto는 아래와 같은 문법 구조를 가진다.

```protobuf
syntax = "proto3";

package bid_service;

service BidirectionalService {
    rpc RequestApi(Request) returns (Response) {}
}

message Request {
    string requestValue = 1;
    string requestUser = 2;
}

message Response {
    int32 rsltCd = 1;
    string rsltMsg = 2;
    string rsltValue = 3;
}
```

- syntax : proto 파일의 문법을 선언 = proto3로 작성한다.
- package : 해당 proto파일이의 패키지 명을 선언 = 해당 proto파일을 불러와서 해당 proto 파일의 service를 등록하기 위한 이름이다.
- service ${프로토 서비스 이름} : package를 통해 proto 이름을 불러왔을 때, 해당 패키지의 어떤 Service를 등록할 것인지에 관한 내용이다. 이는 서버에서는 addService 메소드를 통해 해당 service를 등록하고, 클라이언트에서는 해당 서비스를 선언하여 서버와 통신을 주고받을 수 있게 된다.
- **RequestApi** : **서버에서 사용**할 로직, 즉 payload를 받아 payload를 처리하게 될 함수이다.
- **Request** : **클라이언트 to 서버**의 payload
- **Response** : **서버 to 클라이언트**의 return value

---

## Server

- Image

![https://user-images.githubusercontent.com/72953899/142759531-a4abfcd2-6209-47f2-bc2d-2c87129446d9.png](https://user-images.githubusercontent.com/72953899/142759531-a4abfcd2-6209-47f2-bc2d-2c87129446d9.png)

- Code

```jsx
const PROTO_PATH = './protos/bidirectional.proto';  //proto타입의 경로

const grpc = require('@grpc/grpc-js');  //yarn add @grpc/grpc-js : grpc 서버를 실행하기 위한 모듈
const protoLoader = require('@grpc/proto-loader');  //yarn add @grpc/proto-loader : grpc의 proto를 로드하기 위한 모듈

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
        keepCase : true,
        enums : String,
        longs : String,
        defaults : true,
        oneofs : true,
    }
);  //패키지를 정의한다 : PROTO_PATH에 있는 proto 타입의 패키지명을 사용할 것임

// 서비스 프로토를 정의 : grpc의 서버를 연 후에, 모든 프로토를 등록을 해줘야 grpc서버가 해당 서비스를 실행할 수 있다.
// protoLoader 모듈을 통해 만든 package Definition을 통해, serviceProto를 등록하고, proto파일에 지정된 package명(여기서는 bid_service)으로 불러옴
const serviceProto = grpc.loadPackageDefinition(packageDefinition).bid_service;

//grpc 서버에 service를 등록했을 떄 해당 서비스에서 처리할 로직에 관한 함수
//이 함수는 serviceProto에 등록된 Request라는 함수를 처리하기 위해 사용할 것이다.
//call : request가 왔을때 저장되어 있는 값
//callback : call argument를 통해 받아올 값을 처리하는 콜백 함수 = 이 콜백함수를 통해 client로 response가 전달됨!
const requestFunc = (call, callback) => {
    //callback 인자 : 첫 번쨰 : null, 두 번쨰 : 응답할 값 = Response
    //call은 request를 통해 proto에 정의된 첫 번쨰 message인 Request를 받아올 수 있다.
    callback(null, {
        rsltCd : 0,
        rsltMsg : "Success",
        rsltValue : `요청한 client : ${call.request.requestUser} \n 요청 메시지 : ${call.request.requestValue}`,
    });
};

//메인 함수 : grpc 서버를 연다. 포트번호는 50051
const main = () => {
    //새 grpc 서버를 오픈
    const server = new grpc.Server();
    
    //해당 서버에 serviceProto를 등록한다.
    //각각의 인자는 serviceProto의 서비스 이름(프로토 파일 내에는 BidirectionalService라고 선언)
    //proto에 정의된 Request함수는 위에서 정의한 requestFunc를 사용 = 이후 해당 서비스로 요청이 온다면 requestFunc를 통해 client에게 응답한다.
    server.addService(serviceProto.BidirectionalService.service, {
        requestApi : requestFunc   //여기서 함수 인자는 proto 내부에 Request라고 되어있지만, "함수의 앞글자를 소문자로" 정의해야 작동함.
    });

    //서버를 비동기적으로 bind
    //첫 번째 인자 : port 번호 = 여기서는 localhost:50051번 포트로 연다
    //두 번째 인자 : 인증 값 = grpc.ServerCredentials.createInsecure()
    //세 번쨰 인자 : 서버를 bind한 이후의 콜백 함수 = 여기서는 예외 처리 및 server를 시작해줬다.
    server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if(err) {
            console.log('서버 오픈시 에러 발생', err);
        } else {
            server.start();
            console.log(`포트 ${port}로 서버 시작 성공`);
        }
    });

};

//grpc서버 시작
main();
```

### Client

- Image

![https://user-images.githubusercontent.com/72953899/142759515-21ceeefc-6dfd-4c44-9067-2c74dbb5b6c9.png](https://user-images.githubusercontent.com/72953899/142759515-21ceeefc-6dfd-4c44-9067-2c74dbb5b6c9.png)

- Code

```jsx
const PROTO_PATH = './protos/bidirectional.proto';  //프로토 파일의 경로를 정의

//grpc와 proto파일을 로드하기 위한 모듈 import
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
        longs : String,
        enums : String,
        defaults : true,
        oneofs : true,
        keepCase : true,
    }
); //패키지를 동기적으로 로드

//서비스 프로토를 정의 : client에서도 server와 마찬가지로 proto를 정의해줘야, proto가 등록된 서버에 해당 proto를 통한 서비스 요청이 가능하다.
const serviceProto = grpc.loadPackageDefinition(packageDefinition).bid_service;

//클라이언트를 작동시키기 위한 메인 함수이다.
const main = () => {
    const serverTarget = 'localhost:50051'; //grpc 요청을 보낼 server의 주소 : 서버에서 50051로 bind했으므로 해당 주소를 적는다.

    //클라이언트를 선언한다.
    //클라이언트는 proto파일의 Service명으로 선언하고, server의 target host주소와, 인증을 인자로 받는다.
    const client = new serviceProto.BidirectionalService(
        serverTarget,
        grpc.credentials.createInsecure()
    );
    
    const messageQueue = [
        "message1",
        "message2",
        "message3",
        "message4",
        "message5",
    ];  //메시지를 총 5개 보낼 내용임.

    //클라이언트가 service proto로 등록되었으므로, proto에 정의된 Request 함수를 앞글자를 소문자로 호출한 후 인자를 전달한다. 인자는 Request값으로, 해당 값은 requestUser와 requestValue로 구성되어있다.
    //messageQueue에 있는 내용 총 5개를 forEach문으로 비동기적으로 보낸다.
    messageQueue.forEach(requestValue => {
        client.requestApi({
            requestUser : "My First gRPC Client",
            requestValue,
        }, (err, response) => {
            //요청을 보내고 returns된 Response값을 처리하기위한 콜백 함수이다.
            //Response는 rsltCd, rsltMsg, rsltValue로 구성되어있음.
            console.log(`rsltCd : ${response.rsltCd},\nrsltMsg : ${response.rsltMsg},\n${response.rsltValue}\n`);
        })
    });

};

main();
```

---

### Let's Start!

```html
git clone https://github.com/Park-KwonSoo/FSSN_Project.git
yarn global add @grpc/grpc-js @grpc/proto-loader
cd grpc
//grpc
node server
node client 
```

---

### License