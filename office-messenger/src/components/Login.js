import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const Login = (props) => {
    return(
        <div>
        <Dialog open aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Log In to Organisation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please Enter your organisation login details
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Organisation"
            type="email"
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Password"
            type="password"
            fullWidth
          />
        </DialogContent>
      </Dialog>
            </div>
    )
}
export default Login;