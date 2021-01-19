import React, {useEffect, useState} from 'react'
import {connect, useSelector} from 'react-redux'
import {Drawer, List, Divider, ListItem, AppBar, Typography, ListItemText} from '@material-ui/core'
import { GET, POST } from '../../utilities/utils'

const Workspace = (props) => { 
    const[wsLoaded, setWsLoaded] = useState(false)
    const[users, setUsers] = useState([])
    useEffect(() => {
        //console.log(props.location.search) //?id={_org_id}
        console.log(props)
        
        const params = new URLSearchParams(props.location.search)
        let id = params.get('id')
        console.log('id', id)
        GET('user-workspaces').then((w) => {
            for(let j of w){
                if(id == j.organisation_id){
                    props.setWorkspace(j)
                    console.log('owrk', j)
                    setWsLoaded(true)
                }
            }
        })
        GET('user').then((user) => {
            props.updateUser(user)
        })
    }, [])
    useEffect(() => {
        if(wsLoaded){
            for(let i of props.ws.members_list){
                POST('given-user', {id: i}).then((u) => {
                    if(u.user_id !== props.user.uesr_id)
                    setUsers([...users, u])
                })
            }
        }
    }, [wsLoaded])
    return(
        wsLoaded ?
        <div>
            <AppBar>
                <Typography variant='h5'>
                {props.ws.name}
                </Typography>
            </AppBar>
            <Drawer
            variant='permanent'
            anchor='left'>
                <Divider />
                <List>
                    {users.map((u) => {
                        return(
                            <ListItem button
                            onClick={(e) => {
                                props.openModal(
                                    <div>
                                        <p>{u.display_name}</p>
                                        <a href={`mailto:${u.email}`}>{u.email}</a>
                                        </div>
                                )

                            }}>
                            {u.display_name}
                            </ListItem>
                        )
                    })}
                    </List>
                </Drawer>
            </div>
            :
            null
    )
}

const mapStateToProps = (state) => {
    return {
        ws: state.workspace,
        user: state.user
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

export default connect(mapStateToProps, mapDispatchToProps)(Workspace)