export default class Client {
    constructor(user_id, ws, messageHandlers){
        this.user_id = user_id
        this.ws = ws
        this.messageHandlers = messageHandlers
        this.createWebsocketConnection()
    }
    
    createWebsocketConnection = () => {
        this.websocket = new WebSocket(
            `wss://qumqk3v2r0.execute-api.eu-west-2.amazonaws.com/production?user_id=${this.user_id}&ws=${this.ws}`
        )
        this.websocket.onmessage = this.handleMessage
    }

    handleMessage = async (message) => {
        const body = JSON.parse(message.data);
        console.debug('websocket messsage:', message);
        console.debug(body);
        switch (body.type) {
            default:
                if (Object.keys(this.messageHandlers).includes(body.type)) {
                    try {
                        this.messageHandlers[body.type](body.content);
                    } catch (error) {
                        console.error('error calling message handler:');
                        console.error(error);
                    }
                    return;
                }
                console.error('message type not recognised:');
                console.error(body);
        }

    }


}