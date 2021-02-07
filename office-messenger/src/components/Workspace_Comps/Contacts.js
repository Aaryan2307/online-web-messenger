import React, {useState} from 'react'
import {Box, withTheme, Input, Grid} from '@material-ui/core'
import {connect} from 'react-redux'
import ProfileCard from './ProfileCard'
import { css, jsx } from '@emotion/core'
/**@jsx jsx */

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
    const[search, setSearch] = useState('')
    let filteredContacts = props.ws.members_list.filter((contact) => {
        return contact.display_name.indexOf(search) !== -1
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
                        setSearch(e.target.value);
                    }}
                    placeholder="Search for a user..."
                />
            </Grid>
            <ul>
            {filteredContacts.map((m) => {
                return(
                    <div style={{cursor: 'pointer'}} onClick={() => {
                        props.openModal(
                            <ProfileCard profile={m} />
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
const mapStateToProps = (state) => {
    return {
        ws: state.workspace,
        user: state.user
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

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Contacts))