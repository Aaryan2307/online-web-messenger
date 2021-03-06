import React, { useState, useEffect } from 'react'
import { Input, Grid, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Button, withTheme } from '@material-ui/core'
import { connect } from 'react-redux'
import SendOutlined from '@material-ui/icons/SendOutlined';
import SendIcon from '@material-ui/icons/Send';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { POST } from '../../utilities/utils'
import { css, jsx } from '@emotion/core'
/**@jsx jsx */

const getStyle = (props) => {
    return css`
        .msgInput{
            width: 80%;
            color: #ffffff;
        }
        .saveBtn{
            color: ${props.theme.palette.primary.main};
        }

    `
}

const WordBlackList = (props) => {
    const[word, setWord] = useState('')
    const[blacklistedWords, setBlacklistedWords] = useState([])

    const addWord = () => {
        setBlacklistedWords([...blacklistedWords, word])
        setWord('')
    }

    const deleteWord = (blword) => {
        let tempArr = blacklistedWords
        const removeIndex = tempArr.findIndex(w => w == blword)
        tempArr.splice(removeIndex, 1)
        setBlacklistedWords([...tempArr])
    }

    useEffect(() => {
        if(props.ws.blacklisted_words){
            setBlacklistedWords([...props.ws.blacklisted_words])
        }
    }, [])

    return(
        <div css={getStyle(props)}>
            <Grid
                className='sendMsg'
                direction="row"
                justify="space-between"
                alignItems="center"
                container
            >
                <Input
                className='msgInput'
                value={word}
                    onChange={(e) => {
                        //sets new event value to the search state
                        setWord(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && word.replace(/\s/g, '').length) {
                            addWord();
                            e.preventDefault();
                        }
                    }}
                    placeholder="Enter a word to blacklist"
                />
                <IconButton
                    color="primary"
                    disabled={!word.replace(/\s/g, '').length}
                    onClick={addWord}
                >
                    {(word === '') ? <SendOutlined /> : <SendIcon />}
                </IconButton>
            </Grid>
            <List>
                {blacklistedWords ? blacklistedWords.map((blword) => {
                    return(
                        <ListItem key={blword}>
                            <ListItemText primary={blword} />
                            <ListItemSecondaryAction>
                                <IconButton onClick={() => {deleteWord(blword)}}>
                                    <HighlightOffIcon style={{color: 'white'}} />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    )
                }) : null}
            </List>

            <Button className='saveBtn' variant='outlined' onClick={() => {
                POST('edit-workspace', {ws: props.ws.organisation_id, edited_vals: {blacklisted_words: blacklistedWords}}).then((response) => {
                    alert('Workspace updated')
                    window.location.reload(false)
                })
            }}>Save Words</Button>
                
        </div>
    )
}

const mapStateToProps = (state) => {
    return {
        ws: state.workspace
    }
}

export default connect(mapStateToProps, null)(withTheme(WordBlackList))