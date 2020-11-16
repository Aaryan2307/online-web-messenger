import React, { useState } from 'react'
import { Auth } from 'aws-amplify'
import { POST } from '../../utilities/utils'
import { Form } from 'mvp-webapp'
import { withTheme } from '@material-ui/core'
import { css, jsx } from '@emotion/core'
/** @jsx jsx */

const Register = (props) => {
    const[email, setEmail] = useState(null)
    const[userDetails, setUserDetails] = useState(null)
    return(
            <Form 
            slides={[
                {
                    questions: [
                        {
                            title: 'Email',
                            type: 'email',
                            id: 'email',
                            required: true
                        },
                        {
                            title: 'Pick a Display Name',
                            type: 'text',
                            id: 'user_display_name',
                            required: true
                        },
                        // {
                        //     title: 'Choose a Display Picture',
                        //     type: 'image',
                        //     id: 'user_dp'
                        // },
                        {
                            id: 'password',
                            type: 'confirm-password',
                        }
                    ],
                    onSubmit: async (event) => {
                        setUserDetails({
                            email: event.email,
                            display_name: event.user_display_name
                        })
                        console.log('creating an account')
                        setEmail(event.email)
                        await Auth.signUp({
                            username: event.email,
                            password: event.password,
                            attributes: {
                                email: event.email
                            }
                        })
                    }
                },
                {
                    title: 'Confirm your account',
                    questions: [
                        {
                            title: 'Code',
                            subtitle: 'Please enter the verification code your were emailed to confirm your account',
                            id: 'verif_code',
                            type: 'text'
                        }
                    ],
                    detail: <div className="detail" style={{textDecoration: 'underline', cursor: 'pointer'}} onClick={()=> {Auth.resendSignUp(email).then(()=>console.log('resent successfully').catch((event)=>console.log(event)))}}>
                            Resend
                        </div>,
                        onSubmit: async (event) => {
                            console.log('confirming and logging in')
                            try{
                                await Auth.confirmSignUp(event.email, event.verif_code)
                                await Auth.signIn(event.email, event.password)
                                POST('user', userDetails)
                            }
                            catch(err){
                                throw err;
                            }
                            //props.post_signup_fn ? await props.post_signup_fn(event):null
                        }
                }
            ]}
            />
    )
}

export default withTheme(Register)