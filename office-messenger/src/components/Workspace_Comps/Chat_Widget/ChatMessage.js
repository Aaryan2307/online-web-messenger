import React from 'react'
import {connect} from 'react-redux'
import { Box, createStyles, makeStyles, withTheme, Typography } from '@material-ui/core';

//mui styling for component
const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            color: 'white',
            padding: '10px',
            boxSizing: 'border-box',
        },
        header: {
            marginBottom: '5px',
        },
        content: {
            overflowWrap: 'break-word',
            textAlign: 'left',
            width: '100%'
        },
        sender: {
            fontWeight: 'bolder',
            marginRight: '15px',
            color: theme.palette.primary.main,
        },
        time: {
            fontWeight: 'lighter',
            color: theme.palette.primary.light,
        },
        reply: {
            backgroundColor: theme.palette.primary.main,
            height: '25px',

            // marginLeft: '100%'
        },
        links: {
            '&:link': {
                color: theme.palette.secondary.contrastText,
                textDecoration: 'underline',
            },
            '&:hover': {
                color: theme.palette.primary.light,
            },
            '&:visited': {
                color: theme.palette.secondary.contrastText,
            },
        },
    })
);

//adds http to url so that onclick actually opens the website
//if already has, then nothing happens
const checkHttps = (str) => {
    //ternary statment didnt work with this...
    if (str.startsWith('http://') || str.startsWith('https://')) {
        return str;
    }
    return 'https://' + str;
};

const checkForBadWord = (list, word) => {
    console.log('word', word)
    console.log(word.includes(list[0]))
    for(let i of list){
        if(word.includes(i)){
            return true
        }
    }
            return false
}

//takes in the message string, and the links styling from useStyles()
//returns jsx which highlights and makes any url/email clickable
const embedRegExAndBlacklist = (messageContent, links, props) => {
    const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    //splits each message into its words
    const parts = messageContent.split(' ');
    //console.log('parts', parts)
    //reduce functions iterates through each array item and transforms based on conditions
    //takes an empty accumulator function and curr is the current item
    const castedParts = parts.reduce((acc, curr) => {
        //if a "word" is a url or email, push it to the accumulator enclosed in respective tags
        if(urlRegex.test(curr)){
          acc.push(
            <a className={links} href={checkHttps(curr)} target="_blank">
                {curr}
            </a>
        )
        }
        else if(emailRegex.test(curr)){
          acc.push(
            <a className={links} href={`mailto:${curr}`}>
              {curr}
              </a>
         )
        }
        else if(props.ws.blacklisted_words && checkForBadWord(props.ws.blacklisted_words, curr)){
            //console.log('censoring word')
            let censor = curr.replace(/./g, '*');
            acc.push(censor)
        }
        //if not then just push the normal word
        else{
        //console.log('bad words', props.ws.blacklisted_words)
          acc.push(' ', curr, ' ');

        }
        return acc;
    }, []);
    //console.log('casted', castedParts)
    return castedParts;
};

const ChatMessage = (props) => {
    console.log('props chatmsg', props)
    const classes = useStyles();
    //short logic to display date tie month year etc as a timestamp for each message
    let date = new Date(props.timestamp_ms)
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let dateStamp = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    //append a 0 if its a single digit hour or minute
    if(min < 10){
        min = '0' + min
    }
    if(hour < 10){
        hour = '0' + hour
    }
    //concatenate the datetime info
    let time = dateStamp + ' ' + month + ' ' + year + ' at ' + hour + ':' + min;

    //just jsx formatting and gui for the message, nothing of much notice
    return (
        <Box className={classes.root} display="flex" flexDirection="column" alignItems="flex-start">
            <Box
                className={classes.header}
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
            >
                <Typography variant="body2" className={classes.sender}>
                    {props.user_display_name}
                </Typography>
                <Typography variant="body2" className={classes.time}>
                    {/* {new Date(props.timestamp_ms).toLocaleTimeString().substring(0, 5)} */}
                    {time}
                </Typography>
            </Box>
            <Box
                display="flex"
                flexDirection="row"
                alignItems="flex-start"
                justifyContent="space-between"
                className={classes.content}
            >
                <Typography className={classes.content} variant="body2">
                    {/* {embedRegEx(props.message_content, classes.links)} */}
                    {props.file ? 
                        //checks if the message is a file and either displays the picture, a download link or just a text msg
                        (props.file.type == 'png') || (props.file.type == 'jpg') ?
                        (
                        <a style={{cursor: 'hover'}} onClick={() => {
                            props.openModal(
                                <img style={{width: '100%', height: '100%'}} src={props.file.fileData}/>
                            )
                        }}><img style={{maxWidth: 200, maxHeight: 300, cursor: 'hover'}} src={props.file.fileData}/></a>
                         )
                         :
                         <a className={classes.links} href={props.file.fileData} target='_blank' download={props.file.fileName}>{props.file.fileName}</a>
                        :
                        (
                            //checking for the links
                        embedRegExAndBlacklist(props.message_content, classes.links, props)
                        )
                    }
                </Typography>
            </Box>
        </Box>
    );
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
          content
        })
      },
    }
  }

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(ChatMessage))