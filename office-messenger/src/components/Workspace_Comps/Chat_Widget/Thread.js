import React, {useState} from 'react'
import { Box, Button, createStyles, IconButton, makeStyles, Theme, Menu, MenuItem, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import {connect} from 'react-redux'
import ChatMessage from './ChatMessage'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ReplyIcon from '@material-ui/icons/Reply';

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            boxSizing: 'border-box',
        },
        message: {width: '100%'},
        replies: {
            width: '90%',
            borderLeft: `2px dotted ${theme.palette.secondary.light}`,
        },
        collapseButton: {
            width: '35%',
            padding: 0,
        },
        collapseButtonText: {
            fontWeight: 'lighter',
            fontSize: '0.9em',
            color: theme.palette.primary.dark,
            textTransform: 'none',
        },
    })
);


const Thread = (props) => {
    const classes = useStyles()

    const[collapse, setCollapse] = useState(false)
    const[anchorEl, setAnchorEl] = useState(null)

    console.log(' thread props', props)

    const replies = Array.from(
        new Set(props.replies.map((r) => r.message.message_id))
    ).map((id) => {
        return props.replies.find((r) => r.message.message_id === id);
    });

    const personalHandler = (e) => {
        setAnchorEl(e.currentTarget)
    }

    return(
        <Box
            className={classes.root}
            display="flex"
            flexDirection="column"
            justifyItems="flex-start"
            alignItems="flex-start"
        >
            <Box
                className={classes.message}
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
                alignItems="center"
            >
                <ChatMessage {...props} />
                <IconButton
                    color="primary"
                    style={{marginLeft: '65%', position: 'absolute'}}
                    onClick={personalHandler}
                >
                    <MoreVertIcon />
                </IconButton>
                     <Menu
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={() => {
                            setAnchorEl(null)
                        }}
                        >
                <MenuItem onClick={() => {
                    props.replying(props)
                    setAnchorEl(null)
                }}>Reply</MenuItem>
                {props.sender === props.user.user_id ? <MenuItem onClick={() => {
                    setAnchorEl(null)
                    props.openModal(
                        <>
                        <DialogTitle>Delete Message</DialogTitle>
                        <DialogContent>
                        <DialogContentText>Are you sure you want to delete this thread?</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={() => {
                            console.log('threads', props.threadToShow)
                            props.delete(props.threadToShow)
                            props.closeModal()
                        }}>Delete Thread</Button>
                        </DialogActions>
                        </>
                    )
                }}>Delete Thread</MenuItem> : null}
                </Menu>
            </Box>
            {replies?.length !== 0 ? (
                <Box
                    className={classes.replies}
                    alignSelf="flex-end"
                    display="flex"
                    flexDirection="column"
                >
                    {collapse ? (
                        <>
                            <Button
                                onClick={() => {
                                    setCollapse(false);
                                }}
                                classes={{
                                    root: classes.collapseButton,
                                    label: classes.collapseButtonText,
                                }}
                            >
                                Show Replies ({replies?.length})
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => {
                                    setCollapse(true);
                                }}
                                classes={{
                                    root: classes.collapseButton,
                                    label: classes.collapseButtonText,
                                }}
                            >
                                Hide Replies
                            </Button>
                            {
                                // @ts-ignore
                                replies.map((r) => {
                                    console.log('render', r)
                                    return <ChatMessage {...r.message} user_display_name={r.recipient.from == props.user.user_id ? 'You' : r.recipient.sender_display} key={r.message.message_id} />;
                                })
                            }
                        </>
                    )}
                </Box>
            ) : null}
        </Box>
    )

}

const mapStateToProps = (state) => {
    return{
        user: state.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return{
        openModal: (content) => {
            dispatch({
              type: 'OPEN_MODAL',
              content
            })
          },
          closeModal: () => {
              dispatch({
                  type: 'CLOSE_MODAL'
              })
          }
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(Thread)