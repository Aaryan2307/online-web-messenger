import React, {useState, useEffect} from 'react'
import {DialogTitle, Avatar, List, ListItem, ListItemAvatar, ListItemText, DialogContent, ListItemSecondaryAction, IconButton, Tooltip, DialogActions, Button} from '@material-ui/core'
import GroupIcon from '@material-ui/icons/Group';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import avatar from '../../media/no_profile.png'
import {connect} from 'react-redux'

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
                                <Avatar src={avatar} />
                            </ListItemAvatar>
                            <ListItemText primary={member.display_name} />
                            {
                               props.ws.admins_list.includes(props.user.user_id) ? (
                                <ListItemSecondaryAction>
                                    <Tooltip title='Remove Group Member'>
                                    <IconButton edge='end' style={{float: 'right', marginLeft: '100%'}}>
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
                        <Avatar src={avatar} />
                    </ListItemAvatar>
                    <ListItemText primary='You' />
                </ListItem>
                </List>
        </DialogContent>
        <DialogActions>
            <Button>
                Leave Group
            </Button>
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

export default connect(mapStateToProps, null)(GroupCard)