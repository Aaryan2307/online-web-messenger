import React from 'react'
import { IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Button, withTheme, Avatar, ListItemAvatar, Tooltip, DialogTitle, DialogActions, DialogContent } from '@material-ui/core'
import { connect } from 'react-redux'
import avatar from '../../media/no_profile.png'
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import { POST } from '../../utilities/utils'

const WSMembers = (props) => {
    return(
        <div>
            <List>
                {props.ws ? props.ws.members_list.map((member) => {
                    return(
                        <ListItem key={member.user_id}>
                            <ListItemAvatar>
                            <Avatar src={member.display_picture ? member.display_picture : avatar} />
                            </ListItemAvatar>
                            <ListItemText primary={member.display_name} />
                            <ListItemSecondaryAction>
                             {!props.ws.admins_list.includes(member.user_id) ? <Tooltip title='Make this user admin'>
                            <IconButton onClick={() => {
                                props.openModal(
                                    <>
                                    <DialogTitle>Make Admin</DialogTitle>
                                    <DialogContent>Are you sure you want to make this person an admin?</DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => {
                                        POST('edit-workspace', {ws: props.ws.organisation_id, edited_vals: {user: member.user_id}, make_admin: true,}).then(() => {
                                        alert('This user was made an admin')
                                        window.location.reload(false)
                                    })
                                        }}>
                                            Make Admin
                                        </Button>
                                    </DialogActions>
                                    </>
                                )
                            }}>
                                    <SupervisorAccountIcon style={{color: 'white'}} />
                                </IconButton>
                                </Tooltip> : null}
                                <IconButton onClick={() => {
                                    props.openModal(
                                        <>
                                        <DialogTitle>Remove User</DialogTitle>
                                        <DialogContent>Are you sure you want to remove this user from the workspace?</DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => {
                                            POST('edit-workspace', {ws: props.ws.organisation_id, edited_vals: {user: member.user_id}, delete: true,}).then(() => {
                                            alert('This user was removed')
                                            window.location.reload(false)
                                        })
                                            }}>
                                                Remove User
                                            </Button>
                                        </DialogActions>
                                        </>
                                    )
                                }}>
                                    <HighlightOffIcon style={{color: 'white'}} />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    )
                }) : null}
            </List>
                
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        ws: state.workspace
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(WSMembers))