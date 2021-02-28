import React, { useState, useEffect } from 'react'
import { GET, POST } from '../utilities/utils'
import { AppBar, Toolbar, IconButton, Avatar, Typography, Slide, withTheme, Button, Dialog, DialogTitle, DialogContent, TextField, CircularProgress, Box, Tooltip } from '@material-ui/core';
import { css, jsx } from '@emotion/core'
import MenuIcon from '@material-ui/icons/Menu';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import CreateIcon from '@material-ui/icons/Create';
import AddIcon from '@material-ui/icons/Add';
import PersonIcon from '@material-ui/icons/Person';
import { Redirect, Switch, Route, Link } from 'react-router-dom' 
import OrgCreator from './OrgCreator'
import OrgCard from './OrgCard'
import Workspace from './Workspace_Comps/Workspace'
import { connect, useSelector } from 'react-redux'
import { Auth } from 'aws-amplify'
import {Form} from 'mvp-webapp'
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

    const[loadingWheel, setLoading] = useState(true)

    const[loadingStatus, setLoadingStatus] = useState('')
    const[workspaces, setWorkspaces] = useState([])
    //Returns promised JSON object GOTten from Lambda backend
    const fetchUser = async () => {
        let user = await GET('user')
        return user
    }
    const fetchWorkspaces = async () => {
        let workspaces = await GET('user-workspaces')
        return workspaces
    }
    useEffect(() => {
        //at the mounting of the component, it will get user info and the users workspace objects and set it to the statae
        (async () => {
            let user_info = await fetchUser()
            //console.log('user', user_info)
            props.updateUser(user_info)
            //console.log('use', props.user)
            try{
                let w = await fetchWorkspaces()
                setWorkspaces(w)
                console.log('workspaces', w)
            }
            catch(e){
                console.log('now ws to show')
                setWorkspaces(null)
            }
            setLoading(false)
        })()
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

    //function fires to add the user to the given organisation code 
    const addMember = async () => {
        //Code gets value from the DOM input element
        let code = document.getElementById("name").value;
        console.log('code', code)
        try{
            //try catch to give appropriate error if backend function fails
            //response will give the appropriate error message for user if successful, either the user will join, or will be notified they are already a part of the workspace
            let response = await POST('workspace-user', {code,})
            alert(response)
            props.closeModal()
            window.location.reload()
        }
        catch(e){
            alert("Was not able to join workspace. Please try again")
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
                    {/*Button click now fires the addMember function to also run the backend*/ }
                    <Button onClick={addMember} variant='outlined'>Join</Button>
                    </DialogContent>
                    </React.Fragment>
            )
        )
    }

    const editProfile = () => {
        return(
            props.openModal(
<Form 
            slides={[
                {
                    title: 'Profile Editor',
                    questions: [
                        {
                            title: 'Email',
                            type: 'email',
                            default: props.user.email,
                            id: 'email',
                            required: true
                        },
                        {
                            title: 'Pick a Display Name',
                            type: 'text',
                            default: props.user.display_name,
                            id: 'user_display_name',
                            required: true
                        },
                    ],
                    onSubmit: async (event) => {
                        const editiedUser = {
                            email: event.email,
                            display_name: event.user_display_name,
                        }
                        try{
                            POST('user', {user: {...props.user, email: event.email, display_name: event.user_display_name}, edited: true})
                            alert('Profile info changed')
                            props.closeModal()
                            window.location.reload(false)
                        }
                        catch(e){
                            alert(e)
                        }
                    }
                },
            ]}
            />
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
            label: 'Edit Profile',
            icon: <PersonIcon />,
            onClick: editProfile

        },
        {
            label: 'Log Out',
            icon: <ExitToAppIcon />,
            onClick: logoutHandler,
        },
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
                <Tooltip title='View your workspaces'>
                <Typography variant='h5'>
                    <Link to='/'>My Workspaces</Link>
                </Typography>
                </Tooltip>
                </Toolbar>
            </AppBar>
            <Switch>
                <Route path='/create' component={OrgCreator} />
            </Switch>
            {//simple ternery statement which shows a loading wheel until user organisations are GOTten
            loadingWheel ? 
             <Box
             display="flex"
             flexDirection="column"
             alignSelf="center"
             justifySelf="center"
             alignItems="center"
             padding={50}
         >
             <Typography variant="h3" color="primary">
                 Loading Workspaces...
             </Typography>
             <CircularProgress color="primary" />
         </Box>
         :
         <div style={{marginTop: 100, display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
         {//mapping the workspaces loaded into the local state
         workspaces != null?
         workspaces.map((w) => 
         <div style={{padding: 40, display: 'flex', justifyContent: 'space-between', maxWidth: 500, }}> 
             <OrgCard ws={w} />
             </div>
         )
         :
         <Typography variant="h3" color="primary">
             No Workspaces to show... Join one!
         </Typography>
         }
         </div>
            
        }
            </div>
             )
            :
            (<Redirect to='/login' />)
    )
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
    }
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Portal))