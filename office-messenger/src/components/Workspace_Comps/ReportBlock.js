import React, { useEffect, useState } from 'react'
import ProfileCard from './ProfileCard'
import {POST} from '../../utilities/utils'
import {connect} from 'react-redux'

const ReportBlock = (props) => {
    const report = props.report

    const[reportee, setReportee] = useState(null)
    const[reporter, setReporter] = useState(null)
    const[loaded, setLoaded] = useState(false)


    useEffect(() => {
        // POST('given-user', {id: report.from}).then((r) => {
        //     setReporter(r)
        // })
        // POST('given-user', {id: report.to}).then((r) => {
        //     setReportee(r)
        // })
        // setLoaded(true)
        console.log('yo')
        if(props.user.user_id === report.to){
            setReportee(props.user)
        }
        else if(props.user.user_id === report.from){
            console.log('set reporter')
            setReporter(props.user)
        }
        for(let u of props.users){
            if(u.user_id == report.from){
                setReporter(u)
            }
            else if(u.user_id == report.to){
                console.log('set reportee')
                setReportee(u)
            }
        }
        setLoaded(true)

    }, [])

    useEffect(() => {
        console.log('to', reportee)
        console.log('from', reporter)
    }, [reportee])

    return(
        loaded ? (
        <div style={{display: 'flex', flexDirection: 'column', borderStyle: 'solid', borderColor: 'red', marginBottom: 30}}>
            <p>From: <a style={{color: 'white', cursor: 'pointer'}} onClick={() =>{
                props.openModal(
                    <ProfileCard profile={reporter} self={reporter.user_id === props.user.user_id} />
                )
            }}><u>{reporter.display_name}</u></a></p>
            <p>To: <a style={{color: 'white', cursor: 'pointer'}} onClick={() => {
                props.openModal(
                    <ProfileCard profile={reportee} self={reportee.user_id === props.user.user_id} />
                )
            }}><u>{reportee.display_name}</u></a></p>
            <p>Report: {report.msg}</p>
            </div>)
            :
            null
    )
}

const mapStateToProps = (state) => {
    return {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReportBlock)