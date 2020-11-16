import React, { useState } from 'react'
import { GET } from '../utilities/utils'
import { Redirect } from 'react-router-dom' 
import { Auth } from 'aws-amplify'

const Portal = () => {
    const[redirect, setRedirect] = useState(false)
    const fetchUser = async () => {
        let user = await GET('user')
        return user
    }
    let user_info = fetchUser()
    console.log('user info', user_info)
    const  logoutHandler = async () => {
        try{
            await Auth.signOut()
            setRedirect(true)
            console.log('logging out')
        }
        catch(err){
            console.log('error signing out', err)
        }
    }
    return(
        !redirect ? (
        <div>
            <h1>My Workspaces</h1>
            <button onClick={logoutHandler}>Log out</button>
            </div> )
            :
            (<Redirect to='/login' />)
    )
}
export default Portal