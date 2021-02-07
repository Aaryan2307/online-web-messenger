import { createStore, combineReducers } from 'redux'

//This is a reducer which can be called on dispatch
//this reducer opens a modal/backdrop for a form or some sort of popup
const modal = (state = {open: false, content: null}, action) => {
    switch(action.type){
        case 'OPEN_MODAL':
            return{
                open: true,
                content: action.content,
            }
        case 'CLOSE_MODAL':
            return{
                open: false,
                content: null,
            }
        default:
            return state;
    }
}

//this reducer is updated when the user logs in, so once the application is entered user information can be accessed easily
const user = (state = null, action) => {
    switch(action.type) {
        case 'USER_UPDATE':
            return{
                ...state,
                ...action.update,
            }
        default:
            return state;
    }
}

const workspace = (state = null, action) => {
    switch(action.type) {
        case 'SET_CURRENT_ORG':
            console.log('state', state)
            return{
                ...state,
                ...action.update,
            }
        default:
            return state;
    }
}

const chat = (state = {messages: []}, action) => {
    switch(action.type){
        case 'ADD_MESSAGE':
            console.log('response from message', action.message)
            console.log('message, struct', state.messages)
            let message_block = null
            let updated_messages = [...state.messages]
            for(let i in updated_messages){
                if((updated_messages[i].recipient.type == action.message.recipient.type) && ((updated_messages[i].recipient.to == action.message.recipient.to) || (updated_messages[i].recipient.to == action.message.recipient.from))){
                    console.log('accessing message blocks')
                    message_block = updated_messages[i]
                    console.log('message block', message_block)
                    if(action.message.message.reply){
                        let incoming_message = {...action.message}
                        const reply_msg_index = message_block.message_stream.findIndex((item) => {
                            return item.message.message_id === incoming_message.message.reply.message_to;
                        });
                        console.log('reply', reply_msg_index)
                        message_block.message_stream[reply_msg_index].message.replies.push(incoming_message)

                        updated_messages[i] = message_block
                    }
                    // if(action.message.reply){
                    //     for(j in message_block.message_stream){
                    //         if(message_block.message_stream[j].message.message_id == action.message.reply.replyTo){
                    //             let message_to_update = message_block.message_stream[j]
                    //             message_to_update.message.replies = [...message_to_update.message.replies, action.message]
                    //         }
                    //     }
                    // }
                    else{
                        let updated_message_stream = [...message_block.message_stream]
                        let incoming_message = {...action.message}
                        console.log('incoming', incoming_message)
            
                        updated_message_stream.push(incoming_message)
            
                        message_block = {...message_block, message_stream: updated_message_stream}
                        updated_messages[i] = message_block
                    }

                    break;
                }
            }
            console.log('new stream', updated_messages)
            return{
                messages: updated_messages,
            }
        case 'SET_MESSAGES': {
            return{
                messages: action.messages
            }
        }
        default:
            return state
    }

}

const client = (client = null, action) => {
    switch(action.type){
        case 'SET_CLIENT':
            return action.client;
        default:
            return client
    }
}

//this is the "global store" from which the global state can be accessed and altered through dispatches
const store = createStore(combineReducers({modal, user, workspace, chat, client}))

export default store