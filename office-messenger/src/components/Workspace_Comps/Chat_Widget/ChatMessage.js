import React from 'react'
import { Box, createStyles, makeStyles, withTheme, Typography } from '@material-ui/core';

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
            overflowWrap: 'anywhere',
            textAlign: 'left',
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

const checkHttps = (str) => {
    //ternary statment didnt work with this...
    if (str.startsWith('http://') || str.startsWith('https://')) {
        return str;
    }
    return 'https://' + str;
};

const embedRegEx = (messageContent, links) => {
    const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    const parts = messageContent.split(' ');
    console.log('parts', parts)
    const castedParts = parts.reduce((acc, curr) => {
        // urlRegex.test(curr)
        //     ? acc.push(
        //           <a className={links} href={checkHttps(curr)} target="_blank">
        //               {curr}
        //           </a>
        //       )
        //     : emailRegex.test(curr)
        //     ? acc.push(
        //        <a className={links} href={`mailto:${curr}`}>
        //          {curr}
        //          </a>
        //     )
        //     :
        //     acc.push(' ', curr, ' ');
        // return acc;
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
        else{
          acc.push(' ', curr, ' ');

        }
        return acc;
    }, []);
    console.log('casted', castedParts)
    return castedParts;
};

const ChatMessage = (props) => {
    const classes = useStyles();
    let date = new Date(props.timestamp_ms)
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let dateStamp = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    if(min < 10){
        min = '0' + min
    }
    if(hour < 10){
        hour = '0' + hour
    }
    let time = dateStamp + ' ' + month + ' ' + year + ' at ' + hour + ':' + min;

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
                    {embedRegEx(props.message_content, classes.links)}
                </Typography>
            </Box>
        </Box>
    );
}

export default withTheme(ChatMessage)