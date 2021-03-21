import React, {useEffect, useState,} from 'react'
import {connect, useSelector, useDispatch} from 'react-redux'
import {Drawer, List, Divider, ListItem, AppBar, Typography, DialogActions, DialogContent, ListSubheader, Avatar, Menu, MenuItem, Button, makeStyles, withTheme, Toolbar, TextField, InputAdornment, DialogTitle, Badge, Switch} from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import sha256 from 'crypto-js/sha256'
import { GET, POST } from '../../utilities/utils'
import {Link, Route} from 'react-router-dom'
import avatar from '../../media/no_profile.png'
import Contacts from './Contacts'
import Widget from './Chat_Widget/Widget'
import AdminSettings from './AdminSettings'
import NotifCentre from './NotifCentre'
import Client from './Client'
import { RepeatOneSharp } from '@material-ui/icons';
import ProfileCard from './ProfileCard';
// import classes from '*.module.css'


//this function taken from mui api styles component through className prop
const useStyles = makeStyles((theme) => (
    {
        drawerPaper: {
        width: 150,
      },
    }
))

const Workspace = (props) => { 

    //these are hooks to be kept track of, they do as the name entails
    const[wsLoaded, setWsLoaded] = useState(false)
    const[users, setUsers] = useState([])
    const[groups, setGroups] = useState([])
    const[usersLoaded, setUsersLoaded] = useState(false)
    const[statusChange, setStatusChange] = useState(0)
    const[anchorEl, setAnchorEl] = useState(null)
    const[currentConvo, setCurrentConvo] = useState(null)
    const[windowPanel, setWindow] = useState('')
    const[directSearch, setDirectSearch] = useState('')
    const[groupSearch, setGroupSearch] = useState('')
    const[submitGroup, setSubmitGroup] = useState(false)
    const[newGroupName, setNewGroupName] = useState('')
    const[newGroupMembers, setNewGroupMembers] = useState([])

    //message handlers to pass into client
    const messageHandlers = {
    //if the user recieves a message, add this to the global state where it will be dealt with
        'send-message': (response) => {
            props.addMessage(response)
            props.addNotif(response)
        },
        //same for deleting a message
        'delete-message': (response) => {
            props.deleteMessage(response)
            props.deleteNotif(response)
        },
        //what happens if someone is now online?
        'online-status': (statusMessage) => {
            console.log('temp for users', props.ws)
            //if the workspace is loaded in the global state
            if(props.ws){
                let userToUpdate = null
                let tempArr = users
                //iterate through users to check who sent the status update
                for(let i in tempArr){
                    if(statusMessage.user_id === tempArr[i].user_id){
                        console.log('status', statusMessage)
                        console.log(tempArr[i])
                        //set their status accordingly
                        userToUpdate = {...tempArr[i], status: statusMessage.status}
                        //update this in the temp array
                        tempArr[i] = userToUpdate
                        break;
                    }
                }
                //filter out the current user, only want others not yourself
                tempArr = tempArr.filter(n => n.user_id !== props.user.user_id)
                //console.log('temp', tempArr)
                //set for rerender
                setUsers(tempArr)
                setStatusChange(statusChange + 1)
            }
            else{
                console.log('no users?')
            }
        },
    }

    const classes = useStyles()

    useEffect(() => {
        //if there is a new group creation run this
        if(submitGroup){
            console.log('group form', newGroupMembers)
            console.log('name', newGroupName)
            //post new group to db and handle error
            if(newGroupName !== 'General'){
                POST('group-channel', {name: newGroupName, members_list: newGroupMembers, ws: props.ws.organisation_id}).then((r) => {
                    console.log('success')
                    alert('Group channel successfully created')
                    window.location.reload()
                })
                .catch((err) => {
                    alert('Group was not able to be created. Please try again')
                })
            }
            else{
                alert('Cannot create another General Channel')
            }
        }
        setSubmitGroup(false)
    }, [submitGroup])

    useEffect(() => {
        //console.log(props.location.search) //?id={_org_id}
        console.log(props)
        //grabs the parameters of the url
        const params = new URLSearchParams(props.location.search) //?id={_org_id}
        //what is assigned to the param "id"?
        let id = params.get('id')
        console.log('id', id)
        //After promise is resolved from GETting, what do we do?
        GET('user-workspaces').then((w) => {
            //foreach item of workspace, check if the id corresponds to the URL and if so set that
            for(let j of w){
                if(id == j.organisation_id){
                    props.setWorkspace(j)
                    console.log('owrk', j)
                    //load the workspace into the component state if done
                    setWsLoaded(true)
                }
            }
        })
        //also re-GET the user for any updates if the component has rerendered
        GET('user').then((user) => {
            props.updateUser(user)
        })

    }, [])
    useEffect(() => {
        //if the workspace has loaded, grab all of the workspace members through the corresponding lambda
        if(wsLoaded && props.user && props.ws){
            //old algo
            let list = []
            // for(let i of props.ws.members_list){
            //     POST('given-user', {id: i}).then((u) => {
            //         list.push(u)
            //         if(u.user_id !== props.user.user_id){
            //         //set the users to the local state
            //         setUsers([...users, u])
            //         }
            //         //setUsersLoaded(true)
            //     })
            // }

            //now we return a whole list instead of iterating and posting through each loop
            POST('given-user', {id_list: props.ws.members_list, type: 'user'}).then((u) => {
                console.log('uuu',u)
                let otherUsers = []
                for(let user of u){
                    //iterate through returned list and add all apart from self
                    if(user.user_id != props.user.user_id){
                        otherUsers.push(user)
                    }
                }
                //set this to the local and global state
                //set usersLoaded flag
                setUsers(otherUsers)
                setUsersLoaded(true)
                props.setWorkspace({...props.ws, members_list: otherUsers})
            })
            .catch((err) => {
                console.log('error with getting users', err)
            })

            //Returning the groups in the orgnisation
            //yes i know its a POST but I need to pass a body to the backend
            POST('given-user', {id_list: props.ws.groups, type: 'group'}).then((g) => {
                console.log('org groups', g)
                //same algo but instead just pushing through groups that user is a part of
                let users_groups = []
                for(let group of g){
                    if(group.members_list.includes(props.user.user_id)){
                        users_groups.push(group)
                    }
                }
                setGroups(users_groups)
                props.setWorkspace({...props.ws, groups: users_groups})
            })
        }
    }, [wsLoaded])

    //no functionality, just for error logging, will be roemoved when project is finished
    useEffect(() => {
        console.log('users in ws', users)
        if(props.ws){
            //console.log('these are', props.ws.members_list)
            if(users.length == props.ws.members_list.length){
                console.log('yo uesrs', users)
                console.log(props.ws.members_list.length)
                //setUsersLoaded(true)
            }
        }
    },[users])

    //run this once we have the users
    useEffect(() => {
        if((usersLoaded && groups.length)){
            console.log('user laoded?', usersLoaded)
            //instantiate new client with following params
            let client = new Client(props.user.user_id, props.ws.organisation_id, messageHandlers)
            //set this to the global state for use across app
            props.setClient(client)
            //getting current people online to set their status locally
            POST('get-connections', {ws: props.ws.organisation_id}).then((conn) => {
                console.log('conn', conn)
                //mapping online users from connections
                let online_users = conn.map(value => value.user_id)
                let updated_users = users
                console.log('online', online_users)
                for(let u in updated_users){
                    //changing status locally
                    if(online_users.includes(updated_users[u].user_id)){
                        updated_users[u] = {...updated_users[u], status: 'online'}
                    }
                }
                console.log('updated', updated_users)
                //setting this to hooks
                setUsers(updated_users)
                setStatusChange(statusChange + 1)
            })
            //setting the global state with the initial message_blocks
            let ws_messages = []
            for(let u of users){
                ws_messages.push({
                    recipient: {
                        type: 'direct',
                        to: u.user_id
                    },
                    message_stream: []
                })
            }
            for(let g of groups){
                ws_messages.push({
                    recipient: {
                        type: 'group',
                        to: g.group_id
                    },
                    message_stream: []
                })
            }
            props.setMessages(ws_messages)
            //hash to query missed-messages table
            const missedMessageHash = sha256(props.user.user_id + props.ws.organisation_id).toString()
            //query through post which will get and now set the missed messages locally
            //these are deleted on the backend function
            POST('missed-messages', {id: missedMessageHash}).then((m) => {
                console.log('m', m)
                if(m){
                    for(let message of m){
                        props.addMessage(message)
                        props.addNotif(message)
                    }
                }
            })
        }
    },[usersLoaded])

    //gets the correct panel alike to Login.js
    const getWindow = () => {
        switch(windowPanel){
            case 'chat':
                //widget takes in the conversation the widget shows
                return(
                    <Widget convo={currentConvo} />
                )
            case 'contacts':
                return(
                    <Contacts setWindow={setWindow} users={users} setCurrentConvo={setCurrentConvo} />
                )
            case 'admin_settings':
                return(
                    <AdminSettings users={users} />
                )
            case 'notifications':
                return(
                    <NotifCentre setWindow={setWindow} setCurrentConvo={setCurrentConvo} groups={groups} users={users} />
                ) 
        }
    }

    //postform handler which redirects to useState
    const postForm = () => {
        setSubmitGroup(true)
    }

    //callback handler for <Menu /> component
    const personalHandler = (e) => {
        setAnchorEl(e.currentTarget)
    }

    //logic explained in docks, allows filter search for dm and groups
    let filteredDms = users.filter((user) => {
        return user.display_name.toLowerCase().indexOf(directSearch.toLowerCase()) !== -1
    })
    let filteredGroups = groups.filter((group) => {
        return group.name.toLowerCase().indexOf(groupSearch.toLowerCase()) !== -1
    })
    return(
        //return corresponding jsx
        //only if users and ws are GOTten
        wsLoaded && usersLoaded && groups.length ?
        <div style={{overflowY: 'hidden'}}>
             <Drawer
            variant='permanent'
            anchor='left'
            width='140px'
            classes={{
                paper: classes.drawerPaper
            }}
            >
                <Divider />
                <List style={{maxHeight:'50%'}}>
                <ListSubheader>Direct Messages</ListSubheader>
                <TextField
                    onChange={(e) => {
                        //textinput for dm filter
                        setDirectSearch(e.target.value)
                    }}
                    label='Search for a DM'
                    InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                />
                <div style={{overflowY: 'scroll', maxHeight: '85%'}}>
                    {
                    //mapping out the Dms in the scrollbox
                    filteredDms.map((u) => {
                        return(
                            //Shows the display name and online status as a ListItem
                            <ListItem style={{textOverflow: 'ellipsis', fontSize: 13}} button
                            onClick={(e) => {
                                //if its clicked set the window to their chat
                                setWindow('chat')
                                setCurrentConvo(u)
                            }}>
                            <Badge invisible={props.notifs.find(n => (n.recipient.from == u.user_id) && (n.recipient.type == 'direct')) == undefined} color='secondary' variant='dot'>
                            {u.display_name} - <b>{u.status ? u.status : 'offline'}</b>
                            </Badge>
                            </ListItem>
                        )
                    })}
                    </div>
                    </List>
                    <Divider />
                    <List style={{maxHeight:'50%'}}>
                    <ListSubheader>Group Channels</ListSubheader>
                    <TextField
                    onChange={(e) => {
                        setGroupSearch(e.target.value)
                    }}
                    label='Search for a Group'
                    InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                />
                <div style={{overflowY: 'scroll', maxHeight: '80%'}}>
                {
                    //same logic as Dms but with a group instead of user
                    //and no online status obvously
                    filteredGroups.map((g) => {
                        return(
                            <ListItem style={{textOverflow: 'ellipsis', fontSize: 13}} button
                            onClick={(e) => {
                                setWindow('chat')
                                setCurrentConvo({...g, display_name: g.name})
                            }}>
                            <Badge invisible={props.notifs.find(n => n.recipient.to == g.group_id) == undefined} color='secondary' variant='dot'>
                            {g.name}
                            </Badge>
                            </ListItem>
                        )
                    })}
                    </div>
                        </List>
                    <Divider />
                    <Button style={{marginTop: 30}} onClick={() => {
                        props.openModal(
                            //this modal is opened if user clicks Create Group btn
                            //form with group info
                            <>
                            <DialogTitle>Group Creation</DialogTitle>
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                props.closeModal()
                            }}>
                            <DialogContent>
                            <TextField
                                margin="dense"
                                id="name"
                                label="Group Channel Name"
                                fullWidth
                                onChange={(e) => {
                                    setNewGroupName(e.target.value)
                                }}
                                required
                            />
                            <Autocomplete
                                multiple
                                options={users}
                                onChange={(event, newValue, reason) => {
                                    // switch(reason){
                                    //     case 'clear':
                                    //         setGroupForm({...groupForm, members_list: []})
                                    //     case 'select-option':
                                    //         let new_member = newValue[newValue.length - 1]
                                    //         setGroupForm({...groupForm, members_list: [...groupForm.members_list, new_member.user_id]})
                                    //         console.log(groupForm)
                                    //     case 'remove-option':
                                    //         let updated_members = []
                                    //         for(let n of newValue){
                                    //             updated_members.push(n.user_id)
                                    //         } 
                                    //         setGroupForm({...groupForm, members_list: updated_members})
                                    // }
                                    
                                    //autocomplete as in OrgCreator but less complicated
                                    //adds or sets to the newValue param whenever there is a change
                                    //sets this new updated list to the hook state
                                    if(reason === 'clear'){
                                        setNewGroupMembers([])
                                    }
                                    else if(reason === 'select-option'){
                                        let updated_members = []
                                        for(let n of newValue){
                                            //we only want to push user_ids
                                            updated_members.push(n.user_id)
                                        } 
                                        setNewGroupMembers(updated_members)
                                    }
                                    else{
                                        let updated_members = []
                                        for(let n of newValue){
                                            updated_members.push(n.user_id)
                                        } 
                                        setNewGroupMembers(updated_members)
                                    }
                                }}
                                getOptionLabel={(option) => option.display_name}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    label='Members'
                                    placeholder='Members to add to Group'
                                     />
                                )}
                            />
                            </DialogContent>
                            <DialogActions>
                                <Button type='submit' onClick={postForm}>
                                    Create Group
                                </Button>
                            </DialogActions>
                            </form>
                            </>
                        )
                    }}>
                        Create Group 
                        <AddIcon />
                    </Button>
                </Drawer>
            <div style={{display: 'flex', flexGrow: 1, justifyContent: 'space-between'}}>
            <AppBar style={{maxHeight: 70, display: 'flex', flexGrow: 1, }} >
                <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
                <Typography variant='h5' style={{marginLeft: 150, maxWidth: 500}}>
                <b>{props.ws.name}</b>
                </Typography>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                <Button style={{marginLeft: 50, marginRight: 20}} onClick={() => {
                    setWindow('contacts')
                    //props.setWorkspace({...props.ws, members_list: users})
                }}>
                    Contacts
                    </Button>
                    {props.ws.admins_list.includes(props.user.user_id) ? (
                        <Button
                        onClick={() => {
                            setWindow('admin_settings')
                            console.log('users', users)
                        }}>
                            Admin Settings
                            </Button>
                    )
                :
                null}
                <Button onClick={() => {
                    if(props.notif_on){
                        setWindow('notifications')
                    }
                    else{
                        alert('Turn your notifications on to view them')
                    }
                }}>
                    <Badge badgeContent={props.notifs.length} max={10} color='secondary'>
                    Notifications
                    </Badge>
                </Button>
                </div>
                <Avatar alt='user_dp' src={props.user.display_picture ? props.user.display_picture : avatar} style={{ height: 50, width: 50, cursor: 'pointer',}}
                onClick={personalHandler}/>
                <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => {
                    setAnchorEl(null)
                }}
                >
                <MenuItem onClick={() => {
                    props.openModal(
                        <ProfileCard self profile={props.user} />
                    )
                }}>My Profile</MenuItem>
                <MenuItem onClick={() => {
                    window.opener = null;
                    window.open('', '_self');
                    window.close();
                }}>Exit Workspace</MenuItem>
                <MenuItem>
                Notifications?
                <Switch checked={props.notif_on} onChange={() => {
                    props.toggleNotif()
                }} />
                </MenuItem>
                </Menu>
                </Toolbar>
            </AppBar>
            </div>
           
                <div>
                    {getWindow()}
                    </div>
            </div>
            :
           null
    )
}

//regular redux connect functions,
//explained in docs
const mapStateToProps = (state) => {
    return {
        ws: state.workspace,
        user: state.user,
        client: state.client,
        notifs: state.notifications.notifs,
        notif_on: state.notifications.on
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        setWorkspace: (update) => {
            dispatch({
                type: 'SET_CURRENT_ORG',
                update,
            })
        },
        updateUser: (update) => {
            dispatch({
                type: 'USER_UPDATE',
                update,
            })
        },
        setClient: (client) => {
            dispatch({
                type: 'SET_CLIENT',
                client
            })
        },
        addMessage: (message) => {
            dispatch({
                type: 'ADD_MESSAGE',
                message,
            })
        },
        addNotif: (message) => {
            dispatch({
                type: 'ADD_NOTIF',
                message
            })
        },
        deleteNotif: (message) => {
            dispatch({
                type: 'REMOVE_NOTIF',
                message
            })
        },
        deleteMessage: (message) => {
            dispatch({
                type: 'DELETE_MESSAGE',
                message,
            })
        },
        setMessages: (messages) => {
            dispatch({
                type: 'SET_MESSAGES',
                messages,
            })
        },
        toggleNotif: () => {
            dispatch({
                type: 'TOGGLE_NOTIF'
            })
        },
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Workspace))