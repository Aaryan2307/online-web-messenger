import React, {useState} from 'react'
import {Box, withTheme, Input, Grid} from '@material-ui/core'
import {connect} from 'react-redux'
import ProfileCard from './ProfileCard'
import { css, jsx } from '@emotion/core'
/**@jsx jsx */


//some css styling for the box and search input
const getStyle = (props) => {
    return css`
        background-color: ${props.theme.palette.secondary.main};
        width: 750px;
        height: 100vh;
        .sendMsg{
            width: 100%;
        }
        .msgInput{
            width: 90%;
            color: #ffffff;
        }

    `
}

const Contacts = (props) => {
    console.log('work', props.ws)
    //state hook that refers to the value of the search input box
    const[search, setSearch] = useState('')
    //filters the user through logic expression, covered better in docs
    let filteredContacts = props.users.filter((contact) => {
        return contact.display_name.toLowerCase().indexOf(search.toLowerCase()) !== -1
    })
    return (
        <div style={{padding: 100, marginLeft: 350,}}>
        <Box css={getStyle(props)}
        flexGrow={1}
        display="flex"
        flexDirection="column"
        >
            <Grid
                className='sendMsg'
                direction="row"
                justify="space-between"
                alignItems="center"
                container
            >
                <Input
                className='msgInput'
                    onChange={(e) => {
                        //sets new event value to the search state
                        setSearch(e.target.value);
                    }}
                    placeholder="Search for a user..."
                />
            </Grid>
            <ul>
            {filteredContacts.map((m) => {
                //mapping out the contacts and is re-rendered on each change of filteredContacts... ie each time the search value changes
                return(
                    <div style={{cursor: 'pointer'}} onClick={() => {
                        //if aprofile is clocked on, open a modal with their profile card
                        props.openModal(
                            <ProfileCard setWindow={props.setWindow} setCurrentConvo={props.setCurrentConvo} closeModal={props.closeModal} profile={m} />
                        )
                    }}>
                       <li><u>{m.display_name}</u></li>
                        </div>
                )
            })}
            </ul>
            </Box>
        </div>
    )
}

//map parts of global state to local props
const mapStateToProps = (state) => {
    return {
        ws: state.workspace,
        user: state.user
    }
}


//functions to access global state and dispatch as usual
const mapDispatchToProps = (dispatch) => {
    return {
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Contacts))