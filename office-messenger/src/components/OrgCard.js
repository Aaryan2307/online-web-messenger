import React, { useEffect } from 'react'
import { Card, CardContent, CardActionArea, CardActions, Typography, Button, withTheme, } from '@material-ui/core'
import {Switch, Route} from 'react-router-dom'
import PrivateRoute from '../PrivateRoute'
import SchoolIcon from '@material-ui/icons/School';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import WorkIcon from '@material-ui/icons/Work';
import { connect, useSelector } from 'react-redux'

import { css, jsx } from '@emotion/core'
import Workspace from './Workspace_Comps/Workspace';
/**@jsx jsx */

const getStyle = (props) => {
    return css`
        background-color: ${props.theme.palette.primary.main};
        transition: transform .3s;
        :hover{
            transform: scale(1.1);
        }
    `
}

const OrgCard = (props) => {
    //If a workspace is set from the async redux state update open a new window to enter that workspace
   useEffect(() => {
    console.log('word', props.workspace)
    if(props.workspace){
        window.open(`/workspace`)
    }
   }, [props.workspace]) 

   //simple dictionary that will show an icon depending on the type of organisation
   const mapTypeToIcon = {
       'School': <SchoolIcon />,
       'Common Interests': <WbIncandescentIcon />,
       'Work': <WorkIcon />,
       'Other': null,

   }
   let workspace = props.ws 
   //corresponding jsx that is the card
    return(
        <div>
            <Card className='card' css={getStyle(props)}>
                <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                         {workspace.name}
                </Typography>
                <Typography variant="h6" color="textSecondary" component="h4">
                    {workspace.type + ' '}
                    {mapTypeToIcon[workspace.type]}
                </Typography>
                <Typography variant="h6" color="textSecondary" component="h4">
                    Current Members: {workspace.members_list.length}
                </Typography>
                {workspace.admins_list.includes(props.user.user_id) ? 
                <Typography variant="h6" color="textSecondary" component="h4">
                    *Admin Workspace
                 </Typography>
                 :
                 null}
                    </CardContent>
                    <CardActions style={{marginLeft: 25}}>
                    <Button size="small" color="secondary" variant='outlined' onClick={() => {
                        console.log('props', props)
                        //console.log(props.workspace)
                        props.setWorkspace(workspace)
                        window.open(`/workspace?id=${workspace.organisation_id}`)
                    }}>
                        <b>Enter Workspace</b>
                    </Button>
                    </CardActions>
                </Card>
            </div>
    )
}

//calling parts of the global state and putting it in the component props object for local use
const mapStateToProps = (state) => {
    return {
        workspace: state.workspace,
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
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(OrgCard))