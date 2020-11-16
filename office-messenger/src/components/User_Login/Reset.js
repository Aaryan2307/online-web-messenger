import React from 'react'
import { Auth } from 'aws-amplify'
import { Form } from 'mvp-webapp'

const Reset = (props) => {
 
    return(
        <div>
          <Form             
            slides={[
              {
                questions: [
                  {
                    title: 'Email',
                    type: 'email',
                    id: 'email'
                  },
                ],
                onSubmit: (e)=>{
                  console.log(e.email)
                  Auth.forgotPassword(e.email)
                }
              },
              {
                title: 'Enter code',
                subtitle: 'Check the email you signed up with for the code',
                questions: [
                  {title:'Code', type: 'text', id: 'code'},
                  {title: 'New password', type:'password', id:'new_password'},
                ],
                onSubmit: (e) => {
                  console.log('event:', e)
                  console.log('submitting:', e.email, e.code, e.new_password)
                  Auth.forgotPasswordSubmit(e.email, e.code, e.new_password)}
              }
            ]}
          />
            </div>
    )
}

export default Reset