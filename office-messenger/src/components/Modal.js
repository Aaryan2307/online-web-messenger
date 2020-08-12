import React from 'react'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

const Modal = (props) => {
    !props.content ? props.closeModal() : null
    return(
        <Dialog open={props.open} aria-labelledby="form-dialog-title">
            <DialogContent>
                {props.content}
                </DialogContent>
            </Dialog>
    )
}

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
                open: false
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Modal);