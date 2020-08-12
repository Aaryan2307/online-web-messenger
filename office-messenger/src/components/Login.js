import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog';
import { Button, withTheme } from '@material-ui/core'
import { Auth } from 'aws-amplify'
import { connect } from 'react-redux'
import { Route, Switch } from 'react-router-dom';
import Register from './Register'
//import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const Login = (props) => {

const[email, setEmail] = useState('')
const[password, setPassword] = useState('')
const[panel, setPanel] = useState('login')

  const loginActions = [
    {
      label: 'Forgot Password',
      path: '/resetpassword',
      onClick: () => {setPanel('get-details')}
    },
    {
      label: 'New user? Click here to create an account',
      path: '/signup',
      onClick: () => {setPanel('sign-up')},
      component: Register
    }
  ]

  const handleLogin = async (event) => {
    switch(panel){
      case 'login':
        try{
          var user = await Auth.signIn(email, password)
        }
        catch(err){
          console.error(err)
        }
    }
  }
    return(
        <div>
        <Dialog open aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Log In to Your Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please Enter your login details
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email"
            type="email"
            fullWidth
            onChange={(e) => {
              setEmail(e.target.value)
            }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Password"
            type="password"
            fullWidth
            onChange={(e) => {
              setPassword(e.target.value)
            }}
          />
          <Button onClick={handleLogin}>Log In</Button>
          <Switch>
          {loginActions.map((a) => {
            return(
            <Route path={a.path} component={a.component} />
            )
          })}
          </Switch>
        </DialogContent>
      </Dialog>
            </div>
    )
}

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => {
      dispatch({
        type: 'CLOSE_MODAL'
      })
    },
    openModal: (content) => {
      dispatch({
        type: 'OPEN_MODAL',
        content
      })
    }
  }
}

export default connect(null, mapDispatchToProps)(withTheme(Login));