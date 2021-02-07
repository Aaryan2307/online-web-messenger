import React, {useState} from 'react'
import { Box, Button, createStyles, IconButton, makeStyles, Theme } from '@material-ui/core';
import ChatMessage from './ChatMessage'
import ReplyIcon from '@material-ui/icons/Reply';

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            boxSizing: 'border-box',
        },
        message: {},
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

    console.log('props', props)

    const replies = Array.from(
        new Set(props.replies.map((r) => r.message.message_id))
    ).map((id) => {
        return props.replies.find((r) => r.message.message_id === id);
    });

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
                    style={{marginLeft: 350}}
                    onClick={() => {
                        props.replying(props);
                    }}
                >
                    <ReplyIcon />
                </IconButton>
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
                                    return <ChatMessage {...r.message} user_display_name={props.user_display_name} key={r.message.message_id} />;
                                })
                            }
                        </>
                    )}
                </Box>
            ) : null}
        </Box>
    )

}

export default Thread