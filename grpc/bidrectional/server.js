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

    console.log('Server processing gRPC bidirectional streaming.');

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