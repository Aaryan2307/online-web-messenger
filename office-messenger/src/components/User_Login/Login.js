import React, { useState } from 'react'
import Dialog from '@material-ui/core/Dialog';
import { Button, withTheme } from '@material-ui/core'
import Portal from '../Portal'
import { GET } from '../../utilities/utils'
import { Auth } from 'aws-amplify'
import { Form } from 'mvp-webapp'
import { css, jsx } from '@emotion/core' 
import { connect } from 'react-redux'
import { Route, Switch, Link, Redirect} from 'react-router-dom';
import Register from './Register'
import Reset from './Reset'
//import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
/** @jsxFrag React.Fragment */

const errorStyle = css`
  p {
    color: red;
  }

`

const Login = (props) => {

//this is a set of react hooks which set states of the entered email, password, login panel, redirect flagging, and any errors
const[email, setEmail] = useState('')
const[password, setPassword] = useState('')
const[panel, setPanel] = useState('login')
const[error, setErrors] = useState('')
const[loading, setLoading] = useState(false)
const[redirect, setRedirect] = useState(false)

const showRegister = false
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

  //this is a list of objects(dictionaries) which each panel points to in order to display specific information
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


  //Function that handles a keypress and decides what to do depending on the key, input is the event object, holding a "key" key
  //Does not output anything rather calls the login function if enter key is pressed
  const handleKeyPress = (e) => {
    if(e.key === 'Enter'){
      console.log('login through keypress')
      handleLogin()
    }
  }

  //A function which returns the correct title depending on the login panel display
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

  //this is a similar function to the previous one, which will return specific JSX depending on the panel
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
            onKeyDown={handleKeyPress}
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
            onKeyDown={handleKeyPress}
          />
          <div>
          <Button onClick={handleLogin} disabled={loading}>Log In</Button>
          {loading ? <CircularProgress size={22} /> : null}
          </div>
          {//Maps the login actions that are available for the panel in order
          loginActions.map((a) => {
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
        default:
          return;
    }
  }
  //This is the handler when the submit button is clicked when the user attemps to login.
  // Specific errors that can be thrown from Cognito are also handled here
  const handleLogin = async (event) => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 3000)
    if(!email || !password){
      if(!error.includes('Please fill in your login details')){
        setErrors(['Please fill in your login details'])
      }
    }
    else if(!emailRegex.test(email)){
      setErrors(['Please enter a vaild email address to log in with'])
    }
    else{
      //How do we handle the submit a login request depending on the panel?
      switch(panel){
        case 'login':
          try{
            var user = await Auth.signIn(email, password)
            console.log('user', user)
            props.closeModal()
            setRedirect(true)
            // let user_info = GET('user')
            // console.log('user', user_info)
          }
          catch(err){
            console.error(err)
            /* --Types of errors:
              -UserNotConfirmed
              -UserNotFound
              -PasswordResetRequired
              -NotAuthorized
              -
            */
           //These are all error handling cases
            if(err.name === 'UserNotConfirmedException'){
              alert('Please confirm your user account')
              Auth.resendSignUp(email)
              props.openModal(
                <Form 
                  slides={[
                    {
                      title: 'Verify Account',
                      questions: [
                        {
                          title: 'Code',
                          type: 'text',
                          id: 'verif_code'
                        }
                      ],
                      onSubmit: async (e) => {
                        await Auth.confirmSignUp(email, e.verif_code)
                        props.closeModal()
                        return(
                          <Redirect to='/' />
                        )
                      }
                    }
                  ]}
                />
              )
            }
            if(err.code === 'UserNotFoundException'){
              setErrors('The login details you have entered are not correct')
              throw err
            }
            if(err.code === 'NotAuthorizedException'){
              setErrors('The login details you have entered are not correct')
              throw err
            }
            else if(err.code === 'PasswordResetRequiredException'){
              alert('password not reset properly')
            }
          }
          default: 
            return;
      } 
    }
  }
  //This is the initial dialog box that is returned which forms the main login page without panel specific information
    return(
      redirect ? 
      (<React.Fragment><Redirect to='/' /></React.Fragment>)
      :
      (
      showRegister ? <Register /> :
      <React.Fragment>
      <div>
      {props.openModal(
        <Dialog open aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{getTitle()}</DialogTitle>
          <DialogContent>
        {getPanel()}
        {panel !== 'login' ? <div onClick={() => {setPanel('login')}} style={{textDecoration: 'underline', cursor: 'pointer'}}>
          Back
          </div>
          : 
          null}
          {
            error ? 
            <>
            <div className='errors' style={errorStyle}><p style={css`color: red`}><b>*{error}</b></p></div>
            </>
            :
            null
          }
          </DialogContent>
      </Dialog>
      )}
      </div></React.Fragment>)
    )
}

// mapDispatch and mapStateToProps are Redux functions that change props or dispatch functions in the global state. It can call a certain reducer according to type and dispatch actions through that

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
    },
  }
}

export default connect(null, mapDispatchToProps)(withTheme(Login));