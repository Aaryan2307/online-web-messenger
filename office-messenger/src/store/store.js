import { createStore } from 'redux'

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

const store = createStore(modal)

export default store