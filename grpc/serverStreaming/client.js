const PROTO_PATH = './protos/server.proto';  //프로토 파일의 경로를 정의

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
const serviceProto = grpc.loadPackageDefinition(packageDefinition).server_service;


//클라이언트를 작동시키기 위한 메인 함수이다.
const main = () => {
    const serverTarget = 'localhost:50051'; //grpc 요청을 보낼 server의 주소 : 서버에서 50051로 bind했으므로 해당 주소를 적는다.

    //클라이언트를 선언한다.
    //클라이언트는 proto파일의 Service명으로 선언하고, server의 target host주소와, 인증을 인자로 받는다.
    const client = new serviceProto.ServerService(
        serverTarget,
        grpc.credentials.createInsecure()
    );

    //클라이언트가 service proto로 등록되었으므로, proto에 정의된 Request 함수를 앞글자를 소문자로 호출한 후 인자를 전달한다. 인자는 Request값으로, 해당 값은 requestUser와 requestValue로 구성되어있다.
    //서버의 내용을 받기 위해 서버를 호출한다.
    client.requestApi({}, (err, response) => {
        for (const value of response.value) {
            console.log(`[server to client] : message #${value}`);
        }
    })

};

main();