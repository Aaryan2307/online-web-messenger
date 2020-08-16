import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog';
import { Button, withTheme } from '@material-ui/core'
import { Auth } from 'aws-amplify'
import { connect } from 'react-redux'
import { Route, Switch, Link } from 'react-router-dom';
import Register from './Register'
import Reset from './Reset'
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
      name: 'Forgot Password',
      onClick: () => {setPanel('forgot-password')}
    },
    {
      name: 'New user? Click here to create an account',
      onClick: () => {setPanel('sign-up')},
    }
  ]

  const getTitle = () => {
    switch(panel){
      case 'login':
        return 'Log In to Your Account'
      case 'sign-up':
        return 'Create an Account'
      case 'forgot-password':
        return 'Forgot your Password?'
    }
  }

  const getPanel = () => {
    switch(panel){
      case 'login':
        return(
          <>
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
          {loginActions.map((a) => {
            return(
              <div style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={a.onClick}>
                {a.name}
                </div>
            )
          })}
        </>
        )
        case 'forgot-password':
          return(
            <div>
              <Reset />
              </div>
          )
        case 'sign-up':
          return(
            <div>
            <Register />
            </div>
          )
    }
  }

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
        <DialogTitle id="form-dialog-title">{getTitle()}</DialogTitle>
          <DialogContent>
        {getPanel()}
        {panel !== 'login' ? <div onClick={() => {setPanel('login')}}>
          Back
          </div>
          : 
          null}
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