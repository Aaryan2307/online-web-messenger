import React, { useState, useEffect } from 'react'
import { css, jsx } from '@emotion/core' 
import { withTheme, Card, TextField, FormControl, InputLabel, Select, MenuItem, Button  } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { checkForEmail } from '../utilities/utils'
/**@jsx jsx */

const getStyle = (props) => {
    return css`
    margin-top: 100px;
    display: flex;
    justify-content: center;
    .formCard{
        background-color: ${props.theme.palette.secondary.light};
        display: flex;
        align-self: center;
        width: 500px;
        height: 700px;
        overflow: auto;
    }
    .form{
        color: ${props.theme.palette.primary.dark};
        display: flex;
        flex-direction: column;
        justify-conent: center;
    }
    .formHeading{
        display: flex;
        justify-content: center;
    }
    #simple-select{
        width: 150px;
    }
    .fields > div{
        padding: 30px;
        margin-left: 65px
    }
    .btn{
        display: flex;
        justify-content: center;
        margin-left: 200px;
        width: 100px;
        height: 70px;
        background-color: ${props.theme.palette.primary.main}
    }
    `
}

const OrgCreator = (props) => {
    const[orgDetails, setOrgDetails] = useState({
        name: '',
        email_list: [],
        type: '', 
    })
    const[emails, setEmails] = useState(null)
    const[emailOptions, setEmailOptions] = useState([])

    useEffect(() => {
        console.log('file', emails)
        if(emails){
            processFile(emails)
        }
    },[emails])

    useEffect(() => {
        alert('If you wish to upload a csv of your email list to send the workspace code to, please do so using the upload file button, and choose your options from the provided Email Autocomplete')
    }, [])

    const removeSpaces = (arr) => {
        for(let i = 0; i < arr.length; i+=1){
            arr[i] = arr[i].replace(/\s/g, '')
        }
        return arr
    }

    let processFile = (csv) => {
        if(csv.includes(',')){
            console.log(csv.split(','))
            setEmailOptions(removeSpaces(csv.split(',')))
        }
        else{
            console.log(csv.split('\n'))
            setEmailOptions(removeSpaces(csv.split('\n')))
        }
    }


    const fileError = (e) => {
        if(e.target.error.name === 'NotReadableError'){
            alert('File cannot be read! Please make sure you upload a csv of emails')
        }

    }


    const onFileChange = (e) => {
        if(window.FileReader){
            let newFile = e.target.files[0]
            let reader = new FileReader()
            reader.onload = (event) => {
                setEmails(event.target.result)
            }
            reader.onerror = fileError
            reader.readAsText(newFile)
        }
        else{
            alert('This file is not supported in the browser')
        }
    }


    return(
        <React.Fragment>
        <div css={getStyle(props)}>
            <Card className='formCard'>
            <form className='form'>
                <div className='formHeading'>
                    <h3>Workspace Information</h3>
                </div>
                <div className='fields'>
                    <div>
                <TextField
                            required
                            placeholder="Enter workspace name..."
                            label="Title"
                            id="org_title"
                            onChange={(e) => {setOrgDetails({...orgDetails, name: e})}}
                        />
                        </div>
                        <div>
                    <input type='file' onChange={onFileChange} accept="
                     .csv,
                      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"  />
                      </div>
                      <div>
                      <Autocomplete 
                        multiple
                        options={emailOptions.length > 0 ? [...emailOptions, 'Whole List'] : []}
                        freeSolo
                        ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
                        onChange={(event, newValue, reason) => {
                            console.log('option', newValue)
                            console.log(reason)
                            if (reason === "remove-option") {
                                const toDelete = event.currentTarget.parentElement.innerText
                                if(toDelete === 'Whole List'){
                                    newValue = []
                                    setOrgDetails({...orgDetails, email_list: []})
                                }
                                else{
                                    console.log('emails', orgDetails.email_list)
                                    let array = orgDetails.email_list
                                    const index = array.indexOf(toDelete)
                                    //console.log(index)
                                    array.splice(index, 1);
                                    //console.log('arr', array)
                                    setOrgDetails({...orgDetails, email_list: array}) 
                                }

                              }
                              else if(reason === 'clear'){
                                  newValue = []
                                  setOrgDetails({...orgDetails, email_list: []})
                              }
                              else if(reason === 'create-option'){
                                  const newItem = newValue.length == 1 ? newValue[0] : event.currentTarget.parentElement.innerText
                                  if(orgDetails.email_list.includes(newItem)){
                                      alert('You have already entered this contact')
                                      newValue.pop()
                                  }
                                  else if(!checkForEmail(newItem)){
                                      alert('Please enter a valid email')
                                      newValue.pop()
                                  }
                                  else{
                                      setOrgDetails({...orgDetails, email_list: [...orgDetails.email_list, newValue[newValue.length - 1]]})
                                  }
                                  
                              }
                              else{
                                if(newValue[newValue.length -1] === 'Whole List'){
                                    setOrgDetails({...orgDetails, email_list: emailOptions})
                                }
                                else{
                                    setOrgDetails({...orgDetails, email_list: [...orgDetails.email_list, newValue[newValue.length - 1]]})
                                }
                              }
                            console.log('list', orgDetails.email_list)
                        }}
                        renderInput={(params) => (
                            <TextField
                            {...params}
                            label='Emails'
                            placeholder='List of Emails'
                             />
                        )}
                      />
                      </div>
                      <div>
                      <FormControl required>
                        <InputLabel id="simple-select-label">Type of organisation</InputLabel>
                        <Select
                        labelId="simple-select-label"
                        id="simple-select"
                        onChange={(event) => {
                            const type = event.target.value
                            setOrgDetails({...orgDetails, type})
                        }}
                        autoWidth
                        value={orgDetails.type}
                        >
                        <MenuItem value='Work'>Work</MenuItem>
                        <MenuItem value = 'School'>School</MenuItem>
                        <MenuItem value = 'Common Interests'>Common Interest Group</MenuItem>
                        <MenuItem value = 'Other'>Other</MenuItem>
                        </Select>
                    </FormControl>
                    </div>
                    <Button className='btn'>Submit</Button>
                      </div>
                </form>
                </Card>
            </div>
            </React.Fragment> 
    )
}

export default withTheme(OrgCreator);