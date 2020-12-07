import React, { useState, useEffect } from 'react'
import { GET, } from '../utilities/utils'
import { AppBar, Toolbar, IconButton, Avatar, Typography, Slide, withTheme, Button, Dialog, DialogTitle, DialogContent, TextField } from '@material-ui/core';
import { css, jsx } from '@emotion/core'
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CreateIcon from '@material-ui/icons/Create';
import AddIcon from '@material-ui/icons/Add';
import { Redirect, Switch, Route, Link } from 'react-router-dom' 
import OrgCreator from './OrgCreator'
import { connect, useSelector } from 'react-redux'
import { Auth } from 'aws-amplify'
import { TrendingUpRounded } from '@material-ui/icons';
/**@jsx jsx */

const getStyle = (props) => {
    return css`
    height: 100vh;
    width: 200px;
    background-color: ${props.theme.palette.secondary.light};
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    margin-top: 64px;
    .workspace_buttons{
        display: flex;
        justify-content: space-between;
        align-self: center;
    }
    `
}

// const style = css`
// height: 100vh;
// width: 200px;
// background-color: ${props.theme.palette.primary.main};
// position: absolute;
// z-index: 1;
// top: 0;
// margin-top: 64px;
// `
const Portal = (props) => {
    //useStates are here to indicate whether we need to redirect
    const[redirect, setRedirect] = useState(false)
    //actions is set to indicate the sidebar whether to be present or not
    const[actions, setActions] = useState(false)
    //Returns promised JSON object GOTten from Lambda backend
    const fetchUser = async () => {
        let user = await GET('user')
        return user
    }
    useEffect(() => {
        let user_info = fetchUser()
        console.log('user', user_info)
        props.updateUser(user_info)
    }, [])

    //simple logout handler procedure which tries to log out the current user session, and redirecs to login page
    const logoutHandler = async () => {
        try{
            await Auth.signOut()
            setRedirect(true)
            console.log('logging out')
        }
        catch(err){
            console.log('error signing out', err)
        }
    }


    //function that returns appropriate jsx to open a modal for a user to input their organisation code
    const joinOrg = () => {
        return(
            props.openModal(
                <React.Fragment>
                    <DialogTitle>Join a Workspace</DialogTitle>
                    <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        label="Organisation Code"
                        type="string"
                        fullWidth
                    />
                    <Button onClick={() => {props.closeModal()}} variant='outlined'>Join</Button>
                    </DialogContent>
                    </React.Fragment>
            )
        )
    }

    //js objcet/dictionary of sidebar actions that can be mapped onto the sidebar as button, this is shown below
    /* label: string
       icon: JSX MUI Icon
       to: string... pathname of redirect
       onClick: function(any) 
    */

    const workspace_actions = [
        {
            label: 'Create a Workspace',
            icon: <CreateIcon />,
            to: '/create',
        },
        {
            label: 'Join a Workspace',
            icon: <AddIcon />,
            onClick: joinOrg
        },
        {
            label: 'Log Out',
            icon: <ExitToAppIcon />,
            onClick: logoutHandler,
        }
    ]


    return(
        //ternery statement on whether to render jsx for the portal or redirect to login
        !redirect ? (
        <div>
            <AppBar>
                <Toolbar>
                <Slide direction='right' in={actions}>
                    <div className='org_actions' css={getStyle(props)}>
                        {
                            //mapping out workspace actions
                            //if there it is a redirect then it will map out a "button link" else it will just fire the handler attached to it
                            workspace_actions.map((w) => {
                                return(
                                    <div>
                                        {w.to ? 
                                        (
                                            <Button className='workspace_buttons' component={Link} to={w.to} onClick={w.onClick}>
                                            {w.label}
                                            {w.icon}
                                            </Button>  
                                        )
                                    :
                                            <Button className='workspace_buttons' onClick={w.onClick}>
                                            {w.label}
                                            {w.icon}
                                            </Button>
                                    }                
                                        </div>
                                )
                            })
                        }
                        </div>
                    </Slide>
                <IconButton edge='start' className='set_actions' onClick={() => {setActions(!actions)}}>
                    <MenuIcon />
                </IconButton>
                <Typography variant='h5'>
                    <Link to='/'>My Workspaces</Link>
                </Typography>
                </Toolbar>
            </AppBar>
            <Switch>
                <Route path='/create' component={OrgCreator} />
            </Switch>
            </div> )
            :
            (<Redirect to='/login' />)
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
      },
      updateUser: (update) => {
          dispatch({
              type: 'USER_UPDATE',
              update,
          })
      }
    }
  }

export default connect(null, mapDispatchToProps)(withTheme(Portal))