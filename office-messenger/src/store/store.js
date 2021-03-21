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

const notifications = (state = {notifs: [], on: true, buffer: []}, action) => {
    switch(action.type){
        case 'ADD_NOTIF':
            //initialising notifs to show and background buffer
            let updated_notifs = [...state.notifs]
            const incoming_notif = {...action.message}
            let buffer_notifs = [...state.buffer]
            //always append the notif to the buffer in case notifs are toggled off
            buffer_notifs.unshift(incoming_notif)
            if(state.on){
                //if they arent toggled off also update the notifs to show
                updated_notifs.unshift(incoming_notif)
            }
            //return this in the deconstruvted state
            return{
                ...state,
                notifs: updated_notifs,
                buffer: buffer_notifs
            }
        case 'DELETE_NOTIFS':
            //this is a case where the respective chat is opened so these notifs are now "read" and should be deleted
            //from global store
            let filtered_notifs = []
            //if notifs turned on then we only alter the notifs to show
            //if not then we alter the buffer
            if(state.on){
                filtered_notifs = [...state.notifs]
            }
            else{
                filtered_notifs = [...state.buffer]
            }
            if(filtered_notifs.length){
                //if there are actually notifications to delete then yo filter them out
                filtered_notifs = filtered_notifs.filter((notif) => {
                    //filter through conversation type and the id of the group/dm
                    return (notif.recipient.type != action.convo.type ||
                    (action.convo.type == 'group' ? (notif.recipient.to != action.convo.id) : (notif.recipient.from != action.convo.id)))
    
                })
                console.log('action', action.convo)
                console.log('filter', filtered_notifs)
            }
            return{
                ...state,
                notifs: state.on ? filtered_notifs : [...state.notifs],
                buffer: filtered_notifs
            }
        case 'REMOVE_NOTIF':
            //this use case is for actively deleting a notification if the sender deletes that unread message
            let updated_deleted_notifs = [...state.notifs]
            let buffer_delete_notifs = [...state.buffer]
            //the logic is in a similar vein to DELETE_MESSAGE in the chat reducer
            const notif_to_remove = {...action.message}
            //finding remove index and splicing accordingly from buffer as well
            const notif_index = updated_deleted_notifs.findIndex(n => n.message.message_id == notif_to_remove.message.message_id)
            const notif_index_buffer = buffer_delete_notifs.findIndex(n => n.message.message_id == notif_to_remove.message.message_id)
            buffer_delete_notifs.splice(notif_index_buffer, 1)
            if(state.on){
                updated_deleted_notifs.splice(notif_index, 1)
            }
            return{
                ...state,
                notifs: updated_deleted_notifs,
                buffer: buffer_delete_notifs,
            }
        case 'TOGGLE_NOTIF':
            //switches update from actual to buffer when this is invoked
            let buffer_update = [...state.buffer]
            if(!state.on == true){
                //we update the notifs to show from the buffer if we are turning on notifs
                return{
                    ...state,
                    notifs: buffer_update,
                    buffer: [],
                    on: !state.on
                }
            }
            //otherwise we clear notifs to show and only update buffer until re-toggle
            buffer_update = [...state.notifs]
            return {
                ...state,
                notifs: [],
                on: !state.on,
                buffer: buffer_update
            }
        case 'CLEAR_NOTIFS':
            //simple use case of just resetting this part of the state if user wishes to do so
            return{
                ...state,
                notifs: [],
                buffer: []
            }
        default: 
            return state;
    }
}

// const inWorkspace = (state = {online: false}, action) => {
//     switch(action.type){
//         case 'TOGGLE_JOIN':
//             console.log(state.online)
//     }
// }

const chat = (state = {messages: []}, action) => {
    switch(action.type){
        //if a message is being added to a stream run this case
        case 'ADD_MESSAGE':
            console.log('response from message', action.message)
            console.log('message, struct', state.messages)
            let message_block = null
            let updated_messages = [...state.messages]
            for(let i in updated_messages){
                //finding the message block through this logic statement
                //if recipient and type are the same
                if((updated_messages[i].recipient.type == action.message.recipient.type) && ((updated_messages[i].recipient.to == action.message.recipient.to) || (updated_messages[i].recipient.to == action.message.recipient.from))){
                    console.log('accessing message blocks')
                    message_block = updated_messages[i]
                    console.log('message block', message_block)
                    if(action.message.message.reply){
                        //run if the new message is a reply
                        let incoming_message = {...action.message}
                        //find the exact message in the messagestream and append to the replies[] array
                        const reply_msg_index = message_block.message_stream.findIndex((item) => {
                            return item.message.message_id === incoming_message.message.reply.message_to;
                        });
                        console.log('reply', reply_msg_index)
                        //pushing replies
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
                        //if not just find the correct message stream and append the whole message object
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
            //return the new message state
            return{
                messages: updated_messages,
            }
            //setting the messages that were passed in
        case 'SET_MESSAGES': {
            console.log('setting', action.messages)
            return{
                messages: action.messages
            }
        }
        case 'DELETE_MESSAGE':
            let msg_block = null
            let updated_with_delete = [...state.messages]
            for(let i in updated_with_delete){
                //finding the message block to remove message object
                if((updated_with_delete[i].recipient.type == action.message.recipient.type) && ((updated_with_delete[i].recipient.to == action.message.recipient.to) || (updated_with_delete[i].recipient.to == action.message.recipient.from))){
                    console.log('accessing message blocks')
                    msg_block = updated_with_delete[i]
                    console.log('message block before delete', msg_block)
                    // if(action.message.reply){
                    //     for(j in message_block.message_stream){
                    //         if(message_block.message_stream[j].message.message_id == action.message.reply.replyTo){
                    //             let message_to_update = message_block.message_stream[j]
                    //             message_to_update.message.replies = [...message_to_update.message.replies, action.message]
                    //         }
                    //     }
                    // }
                    let updated_message_stream = [...msg_block.message_stream]
                    let message_to_delete = {...action.message}
                    //found message object where we need to delete
                    console.log('deleting', message_to_delete)
                    //finding the index of the message in stream we need to delete
                    let delete_in_stream = updated_message_stream.findIndex(m => m.message.message_id === message_to_delete.message.message_id)
                    //removed the object 
                    updated_message_stream.splice(delete_in_stream, 1)
                    //setting new updated variables
                    msg_block = {...msg_block, message_stream: updated_message_stream}
                    updated_with_delete[i] = msg_block

                    break;
                }
            }
            return{
                messages: updated_with_delete
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
const store = createStore(combineReducers({modal, user, workspace, chat, client, notifications}))

export default store