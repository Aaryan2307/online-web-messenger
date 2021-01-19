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

//this is the "global store" from which the global state can be accessed and altered through dispatches
const store = createStore(combineReducers({modal, user, workspace}))

export default store