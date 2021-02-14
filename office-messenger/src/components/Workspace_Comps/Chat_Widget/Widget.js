import React, {useState, useEffect, useRef} from 'react'
import { Box, withTheme, Grid, Input, IconButton, Divider, makeStyles, createStyles, Slide, Typography, Badge, Tooltip } from '@material-ui/core'
import {connect, useSelector, useDispatch} from 'react-redux'
import ChatMessage from './ChatMessage'
import {POST} from '../../../utilities/utils'
import Thread from './Thread'
import SendOutlined from '@material-ui/icons/SendOutlined';
import SendIcon from '@material-ui/icons/Send';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import CancelIcon from '@material-ui/icons/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';
import {makeId} from '../../../utilities/utils'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import { css, jsx } from '@emotion/core'
import { Reply } from '@material-ui/icons';
/**@jsx jsx */

const getStyle = (props) => {
    return css`
        background-color: ${props.theme.palette.secondary.main};
        width: 600px;
        height: 700px;
        .sendMsg{
            width: 100%;
            padding: 24px 10px;
            borderTop: 0.2px solid ${props.theme.palette.secondary.light};
            backgroundColor: theme.palette.secondary.main;
            zIndex: 2;
        }
        .msgInput{
            width: 70%;
            color: #ffffff;
        }

    `
}

const useStyles = makeStyles((theme) => {
    createStyles({
        messageFeed: {
            width: '100%',
            overflowY: 'scroll',
            height: '0px',
            '&::-webkit-scrollbar': {
                width: '6px',
            },
            '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '5px',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '5px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
            },
        },
        replyBox: {
            width: '90%',
            margin: 'auto',
            padding: '5px 10px',
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.secondary.light,
            borderRadius: '15px 15px 0 0',
            zIndex: 1,
            textOverflow: 'ellipsis',
        },
    })
})

const Widget = (props) => {
    const classes = useStyles()
    const[message, setMessage] = useState('')
    const[file, setFile] = useState(null)
    //const[urlGotten, setUrlGotten] = useState(false)
    const[showEmojis, setShowEmojis] = useState(false)
    
    const[reply, setReply] = useState(false)
    const[renderReply, setRenderReply] = useState(false)
    const[replyTo, setReplyTo] = useState(null)

    const conversation = props.convo

    const chatBlock = props.chats.findIndex(chat => chat.recipient.to == conversation.user_id)
    //console.log('chatbloc', chatBlock)

    const chat = useSelector((state) => state.chat.messages[chatBlock]);
    console.log('chat', chat)

    const messages = Array.from(
        new Set(chat.message_stream.map((r) => r.message.message_id))
    ).map((id) => {
        return chat.message_stream.find((r) => r.message.message_id === id);
    });
    console.log('messages', messages)

    const dispatch = useDispatch()

    const scrollRef = useRef(null)
    let upload = null

    useEffect(() => {
        if(messages.length && scrollRef.current){
            scrollRef.current.scrollIntoView()
        }
    }, [messages])

    useEffect(() => {
        //sendMessage()
        //setRefresh(refresh + 1)
    }, [messages])

    useEffect(() => {
        setReply(renderReply);
    }, [renderReply]);

    useEffect(() => {
        console.log('file state', file)
    }, [file])

    const sendMessage = () => {
        const id = makeId();
        const timestamp_ms = new Date().getTime()
        if(reply){
            const post = {
                message_content: file ? (((file.type == 'jpg') || (file.type == 'png')) ? 'image' : file.fileName) : message,
                type: file ? 'file' : 'text',
                file_name: file ? file.fileName : null,
                message_id: id,
                timestamp_ms,
                reply: {
                    recipient: {
                        type: 'direct',
                        to: conversation.user_id,
                        from: props.user.user_id,
                        sender_display: props.user.display_name,
                    },
                    message_to: replyTo.message_id,
                }
            };
            dispatch({
                type: 'ADD_MESSAGE',
                message: {
                    recipient: {
                        type: 'direct',
                        to: conversation.user_id,
                        from: props.user.user_id,
                        sender_display: props.user.display_name,
                    },
                    message: post
                },
            });
            props.client.websocket.send(
                JSON.stringify({
                    action: 'send-message',
                    message: post,
                    recipient: {
                        type: 'direct',
                        to: conversation.user_id,
                        from: props.user.user_id,
                        sender_display: props.user.display_name,
                    }
                })
            );
        }
        else{
            const post = {
                message_content: file ? (((file.type == 'jpg') || (file.type == 'png')) ? file.fileData : file.fileName) : message,
                type: file ? 'file' : 'text',
                file: file ? file : null,
                message_id: id,
                timestamp_ms,
                replies: [],
            };
            console.log('post', post)
            dispatch({
                type: 'ADD_MESSAGE',
                message: {
                    recipient: {
                        type: 'direct',
                        to: conversation.user_id,
                        from: props.user.user_id,
                        sender_display: props.user.display_name,
                    },
                    message: post
                },
            });
            props.client.websocket.send(
                JSON.stringify({
                    action: 'send-message',
                    message: post,
                    recipient: {
                        type: 'direct',
                        to: conversation.user_id,
                        from: props.user.user_id,
                        sender_display: props.user.display_name,
                    },
                    ws: props.ws.organisation_id
                })
            );
        }
        setReply(false)
        setMessage('')
        setFile(null)
    }

    const toggleReply = (m) => {
        setReplyTo(m);
        if (!renderReply) {
            setRenderReply(true);
        } else {
            setReply(false);
        }
    };

    const deleteMessage = (message) => {
        console.log('message to delete', message)
        dispatch({
            type: 'DELETE_MESSAGE',
            message,
        })
        props.client.websocket.send(
            JSON.stringify({
                action: 'delete-message',
                message: message.message,
                recipient: message.recipient,
                ws: props.ws.organisation_id
            })
        )
    }

    const openDialog = () => {
        upload.click();
      }

      const clearFile = () => {
        setFile(null)
        upload = null
        setMessage('')
    }

    const onFileChange = (e) => {
        let newFile = e.target.files[0]
        console.log('new file', newFile.size)
        if(newFile.size < 65000){
            let reader = new FileReader()
            reader.onload = (event) => {
                setFile({
                    fileData: event.target.result,
                    fileName: newFile.name,
                    type: newFile.name.split('.')[1]
                })
          }
          reader.readAsDataURL(newFile)
        }
        else{
            alert('File is too big... please upload a file under 65kB')
        }
    }

    // const getUrl = async () => {
    //     const dataUrl = await POST('upload-file', {
    //         file: file,
    //         ws: props.ws.organisation_id
    //         })
    //     console.log('type', file.fileName.split('.')[1])
    //     console.log(dataUrl)
    //     setFile({...file, fileData: dataUrl})
    //     setUrlGotten(true)
    //   }

    return(
        <div style={{padding: 100, marginLeft: 400, position: 'fixed'}}>
            <Box css={getStyle(props)}
            flexGrow={1}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            >
                <h2>{conversation.display_name}</h2>
                <Box className={classes.messageFeed} style={{overflowY: 'auto', behavior: 'smooth'}} flex="1 1 auto">
                {/* console.log(messages) */}
                {messages
                    ? messages.map((r) => {
                          console.log('to render', r);
                          let display = ''
                          if(r.recipient.from == props.user.user_id){
                              display = props.user.display_name
                          }
                          else if(r.recipient.to == conversation.user_id){
                              display = conversation.display_name
                          }
                          return (
                            // <ChatMessage
                            //     {...r.message}
                            //     user_display_name={r.recipient.from == props.user.user_id ? 'You' : r.recipient.sender_display}
                            //     key={r.message.message_id}
                            // />
                            <React.Fragment>
                            <Thread
                                {...r.message}
                                sender={r.recipient.from}
                                replying={toggleReply}
                                threadToShow={r}
                                delete={deleteMessage}
                                key={r.message.message_id}
                                user_display_name = {r.recipient.from == props.user.user_id ? 'You' : r.recipient.sender_display}
                            
                            />
                            <div ref={scrollRef}></div>
                            </React.Fragment>
                        );
                      })
                    : null}
            </Box>
            {showEmojis? (
                    <Picker set='google' style={{float: 'right', marginTop: '20%', position: 'absolute',}} perLine={5} onSelect={(emoji) => {
                    setMessage(message + emoji.native)
                }} />
                )
                :
                null
                }
            {renderReply ? (
                <Slide
                    direction="up"
                    in={reply}
                    onExited={() => {
                        setRenderReply(false);
                    }}
                >
                    <Box
                        className={classes.replyBox}
                        display="flex"
                        flexDirection="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="body1" noWrap>
                            {`Replying to ${replyTo?.user_display_name}: ${replyTo?.message_content}`}
                        </Typography>
                        <IconButton
                            onClick={() => {
                                setReply(false);
                            }}
                            color="primary"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Slide>
            ) : null}
                 <Grid
                className='sendMsg'
                direction="row"
                justify="space-between"
                alignItems="center"
                container
            >

                <Input
                className='msgInput'
                    value={message}
                    disabled={file ? true : false}
                    inputProps={{
                        maxLength: 65000
                    }}
                    onChange={(e) => {
                        setMessage(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && message.replace(/\s/g, '').length) {
                            sendMessage();
                            e.preventDefault();
                        }
                    }}
                    placeholder="Send a message..."
                />
                <IconButton
                    color="primary"
                    disabled={file ? true : false}
                    onClick={(e) => {
                        e.preventDefault()
                        setShowEmojis(!showEmojis)
                    }}
                >
                    <EmojiEmotionsIcon />
                </IconButton>
                <IconButton
                    color='primary'
                    className={classes.button}
                    onClick={openDialog}
                    component='span'
                >
                      <Badge color='primary' variant='dot' invisible={!file}>
                     <input type='file' style={{display: "none"}} ref={(ref) => {upload = ref}} onChange={onFileChange}/>
                    <AttachFileIcon />
                    </Badge>
                </IconButton>
                {file ?
                <Tooltip title={`Remove file?`}>
                <IconButton
                  color='primary'
                  className={classes.button}
                  onClick={clearFile}
                >
                  <CancelIcon />
                  </IconButton>
                  </Tooltip>
                  :
                  null
              }
                <IconButton
                    color="primary"
                    disabled={!message.replace(/\s/g, '').length && !file}
                    onClick={sendMessage}
                >
                    {(message === '' && !file) ? <SendOutlined /> : <SendIcon />}
                </IconButton>
            </Grid>
                </Box>
            </div>
    )
}

const mapStateToProps = (state) => {
    return{
        ws: state.workspace,
        user: state.user,
        client: state.client,
        chats: state.chat.messages
    }

}

const mapDispatchToProps = (dispatch) => {
    return{
        addMessage: (message) => {
            dispatch({
                type: 'ADD_MESSAGE',
                message,
            })
        },
    }

}


export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Widget))