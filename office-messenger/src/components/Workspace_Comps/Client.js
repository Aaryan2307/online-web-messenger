export default class Client {
    //constructor takes in the users user_id, organisation_id and any message handlers they want the client to run
    //that pertains to a specific API route key
    constructor(user_id, ws, messageHandlers){
        this.user_id = user_id
        this.ws = ws
        this.messageHandlers = messageHandlers
        //Once attributes are set, websocketconnect function is run to instantiate websocket
        this.createWebsocketConnection()
    }
    
    createWebsocketConnection = () => {
        //creates new instance of websocket, passed into the constructor is the api invoke url
        //note the querystrings also passed in as user_id and ws. This will be accessed in the connect function
        this.websocket = new WebSocket(
            `wss://qumqk3v2r0.execute-api.eu-west-2.amazonaws.com/production?user_id=${this.user_id}&ws=${this.ws}`
        )
        //Whenever the websocket recieves a message, it runs the handlemessage function I have written
        this.websocket.onmessage = this.handleMessage
    }

    //handles an incoming message according to message handlers passed in on object creation
    handleMessage = async (message) => {
        //message received is passed in, the body relates to the actual data passed in through the websocket message
        const body = JSON.parse(message.data);
        console.debug('websocket messsage:', message);
        console.debug(body);
        //the "type" key is passed in the specific backend function realting to the message sent, and must match one of
        //the message handlers passed into the client
        switch (body.type) {
            default:
                //if the message handlers passed in matches with the type from the incoming message, run the corresponding handler
                if (Object.keys(this.messageHandlers).includes(body.type)) {
                    //try catch for running the message handler, throws an error if it cant be sent properly
                    try {
                        this.messageHandlers[body.type](body.content);
                    } catch (error) {
                        console.error('error calling message handler:');
                        console.error(error);
                    }
                    return;
                }
                //if the type from the sent message does not match a message handler, throw an error also
                console.error('message type not recognised:');
                console.error(body);
        }

    }


}