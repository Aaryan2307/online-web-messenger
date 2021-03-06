import React, {useState} from 'react'
import {Box, withTheme, Typography, Input, Button} from '@material-ui/core'
import Thread from './Chat_Widget/Thread'
import {connect, useSelector} from 'react-redux'
import { css, jsx } from '@emotion/core'
/**@jsx jsx */

const getStyle = (props) => {
    return css`
        background-color: ${props.theme.palette.secondary.main};
        width: 750px;
        height: 100vh;

    `
}

const NotifCentre = (props) => {
    console.log('notificaitons to show', props.notifs)

    const notifMessages = useSelector((state) => state.notifications.notifs);

    const[displaySearch, setDisplaySearch] = useState('')

    const messages = Array.from(
        new Set(notifMessages.map((r) => r.message.message_id))
    ).map((id) => {
        //returning the messages in order with their respective ids
        return notifMessages.find((r) => r.message.message_id === id);
    });

    const findGroupName = (id) => {
         return props.groups.find(g => g.group_id == id).name
    }

    console.log('msgs', messages)

    let filteredNotifs = messages.filter((message) => {
        let groupName = ''
        if(message.recipient.type == 'group'){
            groupName = findGroupName(message.recipient.to)
            console.log('gname', groupName)
        }
        // return message.recipient.sender_display.toLowerCase().indexOf(displaySearch.toLowerCase()) !== -1
        if(displaySearch == ''){
            return message
        }
        if(groupName.toLowerCase().includes(displaySearch.toLowerCase()) || message.recipient.sender_display.toLowerCase().includes(displaySearch.toLowerCase())){
            return message
        }
    })

    return(
        <div style={{padding: 100, marginLeft: 350,}}>
        <Box css={getStyle(props)}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        >
            <div>
            <Typography variant='h5'>
                Unread Threads
            </Typography>
            <Button color='primary' onClick={() => {
                if(props.notifs_on){
                    props.clearNotifs()
                }
            }}>
                 <b>Clear Notifs</b>
             </Button>
             </div>
            <Input
            style={{marginBottom: 50, width: '90%', color: '#ffffff'}}
            placeholder='Search for specific notifications...'
            onChange={(e) => {
                setDisplaySearch(e.target.value)
            }}
             />
            {messages
                    ? filteredNotifs.map((r) => {
                        //decides what the display name should be for sender
                          console.log('to render', r);
                          let display = ''
                          //console.log(props.users.find(user => user.user_id == r.recipient.to))
                          return (
                            //This is returning the mapped message in the form of a Thread
                            //respective properties passed in to use
                            <React.Fragment>
                            <Thread
                                {...r.message}
                                sender={r.recipient.from}
                                threadToShow={r}
                                key={r.message.message_id}
                                user_display_name = {r.recipient.sender_display + (r.recipient.type == 'group' ? ` in ${findGroupName(r.recipient.to)}` : '')}
                                isNotif
                                convoFrom={r.recipient.type == 'group' ? props.groups.find(group => group.group_id == r.recipient.to)
                                :
                                props.users.find(user => user.user_id == r.recipient.from)
                            }
                                setWindow={props.setWindow}
                                setCurrentConvo={props.setCurrentConvo}
                            
                            />
                            </React.Fragment>
                        );
                      })
                    : null}
            </Box>
        </div>
    )
}

const mapStateToProps = (state) => {
    return{
        ws: state.workspace,
        notifs: state.notifications.notifs,
        notifs_on: state.notifications.on
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        clearNotifs: () => {
            dispatch({
                type: 'CLEAR_NOTIFS'
            })
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(withTheme(NotifCentre))