import React from 'react'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

const Modal = (props) => {
    //If there is no content passed into the modal, close it as there is nothing to show
    if(!props.content){
        props.closeModal()
    }
    //Otherwise we can return this dialog box
    return(
        <Dialog open={props.open} aria-labelledby="form-dialog-title" onBackdropClick={!props.click_off ? props.closeModal : null}>
                {props.content}
            </Dialog>
    )
}
//This will map to the global state
const mapStateToProps = (state) => {
    return {
        open: state.modal.open,
        content: state.modal.content,
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        closeModal: () => {
            dispatch({
                type: 'CLOSE_MODAL'
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);