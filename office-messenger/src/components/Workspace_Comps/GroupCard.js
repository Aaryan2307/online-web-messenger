import React, {useState, useEffect} from 'react'
import {DialogTitle, Avatar, List, ListItem, ListItemAvatar, ListItemText, DialogContent, ListItemSecondaryAction, IconButton, Tooltip, DialogActions, Button} from '@material-ui/core'
import GroupIcon from '@material-ui/icons/Group';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import avatar from '../../media/no_profile.png'
import {connect} from 'react-redux'
import sha256 from 'crypto-js/sha256'
import {POST} from '../../utilities/utils'

const GroupCard = (props) => {
    console.log('ws', props.ws)

    const[memberObjs, setMemberObjs] = useState([])

    useEffect(() => {
        let groupMembers = []
        console.log(props.group.members_list)
        for(let m of props.group.members_list){
            if(m != props.user.user_id){
                let member = props.ws.members_list.find(mem => mem.user_id == m)
                groupMembers.push(member)
            }
        }
        console.log('members', groupMembers)
        setMemberObjs(groupMembers)
    }, [])

    return(
        <>
        <DialogTitle><GroupIcon /> {props.group.name}</DialogTitle>
        <DialogContent>
            <List>
                {memberObjs.length ? memberObjs.map((member) => {
                    return(
                        <ListItem key={member}>
                            <ListItemAvatar>
                                <Avatar src={member.display_picture ? member.display_picture : avatar} />
                            </ListItemAvatar>
                            <ListItemText primary={member.display_name} />
                            {
                               props.ws.admins_list.includes(props.user.user_id) && props.group.name !== 'General' ? (
                                <ListItemSecondaryAction>
                                    <Tooltip title='Remove Group Member'>
                                    <IconButton onClick={() => {
                                        props.openModal(
                                            <React.Fragment>
                                            <DialogTitle>Remove User</DialogTitle>
                                            <DialogContent>Are you sure you want to remove this person?</DialogContent>
                                            <DialogActions>
                                                <Button onClick={async () => {
                                                    await POST('remove-group-user', 
                                                        {group_id: props.group.group_id,
                                                        user_id: member.user_id,
                                                        missed_message: sha256(member.user_id + props.ws.organisation_id).toString()})
                                                    window.location.reload(false)
                                                }}>Remove User</Button>
                                                <Button onClick={props.closeModal}>Cancel</Button>
                                            </DialogActions>
                                            </React.Fragment>
                                        )
                                    }} edge='end' style={{float: 'right', marginLeft: '100%'}}>
                                        <HighlightOffIcon />
                                    </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                               )
                               :
                               null 
                            }
                        </ListItem>
                    )
                }) : null}
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={props.user.display_picture ? props.user.display_picture : avatar} />
                    </ListItemAvatar>
                    <ListItemText primary='You' />
                </ListItem>
                </List>
        </DialogContent>
        <DialogActions>
            {props.group.name !== 'General' ? (
                <Button onClick={() => {
                    props.openModal(
                        <React.Fragment>
                        <DialogTitle>Leave Group</DialogTitle>
                        <DialogContent>Are you sure you want to leave this group?</DialogContent>
                        <DialogActions>
                            <Button onClick={async () => {
                                await POST('remove-group-user', 
                                {group_id: props.group.group_id,
                                user_id: props.user.user_id,
                                missed_message: sha256(props.user.user_id + props.ws.organisation_id).toString(),
                                ws: props.ws.organisation_id})
                                window.location.reload(false) 
                            }}>Leave Group</Button>
                            <Button onClick={props.closeModal}>Cancel</Button>
                        </DialogActions>
                        </React.Fragment>
                    )           
                }}>
                    Leave Group
                </Button>
            )
        :
        null}
        </DialogActions>
        </>
    )
}

const mapStateToProps = (state) => {
    return {
        ws: state.workspace,
        user: state.user,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        openModal: (content) => {
            dispatch({
                type: 'OPEN_MODAL',
                content,
            })
        },
        closeModal: () => {
            dispatch({
                type: 'CLOSE_MODAL'
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupCard)