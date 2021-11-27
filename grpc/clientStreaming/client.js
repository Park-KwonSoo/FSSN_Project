const PROTO_PATH = './protos/client.proto';  //프로토 파일의 경로를 정의

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
const serviceProto = grpc.loadPackageDefinition(packageDefinition).client_service;


//클라이언트를 작동시키기 위한 메인 함수이다.
const main = () => {
    const serverTarget = 'localhost:50051'; //grpc 요청을 보낼 server의 주소 : 서버에서 50051로 bind했으므로 해당 주소를 적는다.

    //클라이언트를 선언한다.
    //클라이언트는 proto파일의 Service명으로 선언하고, server의 target host주소와, 인증을 인자로 받는다.
    const client = new serviceProto.ClientService(
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
    messageQueue.forEach(message => {
        client.requestApi({
            message
        }, (err, response) => {
            //요청을 보내고 returns된 Response값을 처리하기위한 콜백 함수이다.
            //Response는 rsltCd, rsltMsg, rsltValue로 구성되어있음.
            console.log(`${response.value}\n`);
        })
    });

};

main();