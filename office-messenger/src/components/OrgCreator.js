import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { POST } from '../utilities/utils'
import { css, jsx } from '@emotion/core' 
import { withTheme, Card, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, Typography, CircularProgress  } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { checkForEmail } from '../utilities/utils'
/**@jsx jsx */

//CSS styling for this page
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
    //This will be the form values and will be sent for the backend for processing and loaded into the coresponding data table
    const[orgDetails, setOrgDetails] = useState({
        name: '',
        email_list: [],
        type: '', 
    })
    //CSV of emails that will be read if uplaoded
    const[emails, setEmails] = useState(null)
    //These will be the email options loaded into the autocomplete if the user wishes to upload a csv of email names
    const[emailOptions, setEmailOptions] = useState([])
    //Is the form loading? This will determine if the loading wheel is shown or not
    const[loading, setLoading] = useState(false)
    //If the form failed to create, or is successful, this useState determines the box to be displayed to the user
    const[status, setStatus] = useState('')

    //useEffect which runs the following procedure if the state of "emails" changes
    useEffect(() => {
        console.log('file', emails)
        //if emails exists, process the file
        if(emails){
            processFile(emails)
        }
    },[emails])

    //When the webpage first loads, display thisalert message for the user's information
    useEffect(() => {
        alert('If you wish to upload a csv of your email list to send the workspace code to, please do so using the upload file button, and choose your options from the provided Email Autocomplete')
    }, [])

    //Inputs: array of emails that have been comma split
    //Output same array with no spaces in order to process correctly
    const removeSpaces = (arr) => {
        //for each index item of the array, replace spaces (shown in regex for blankspace) with no character
        for(let i = 0; i < arr.length; i+=1){
            arr[i] = arr[i].replace(/\s/g, '')
        }
        return arr
    }

    //process csv file (input) by removing the commas and indexing each seperated value into an array
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

    //This is just a simple error handler which alerts the user if the file is not readable wth input (e: event)
    const fileError = (e) => {
        if(e.target.error.name === 'NotReadableError'){
            alert('File cannot be read! Please make sure you upload a csv of emails')
        }

    }

    //Callback handler for posting the WebForm values to the backend. If it fails for whatever reason, show an appropriate page and allow the user to go back/retry
    const postForm = async () => {
        try{
            //POSTing the form details
            await POST('workspace', orgDetails)
            setStatus('Done')
        }
        catch(e){
            setStatus('Failed')
        }
    }


    //File change handler for upoading the corresponding csv file Input: e... callback event which contains the new file
    const onFileChange = (e) => {
        //If the browser allows the FileReader API set the emails list as the file
        if(window.FileReader){
            let newFile = e.target.files[0]
            //create new instance of file reader
            let reader = new FileReader()
            //onload is defined as a function that is run when the file is loaded into memory... what do we do with it?
            reader.onload = (event) => {
                //setting the email options as the items read from the csv
                setEmails(event.target.result)
            }
            //this is just a function that is run if there is a problem with the application reading the file
            reader.onerror = fileError
            //this is concurrent and therefore the file is read as text before onload is fired
            reader.readAsText(newFile)
        }
        //displays apporpariate message if browser doesnt support API (unlikely)
        else{
            alert('This file is not supported in the browser')
        }
    }

    //Form submit handler to prevent page refresh on html form submit
    const handleFormSubmit = (e) => {
        e.preventDefault()
        console.log('details', orgDetails)
        setLoading(true)
    }


    return(
        <React.Fragment>
        <div css={getStyle(props)}>
            <Card className='formCard'>
                {//Is the form not loading? if so then render the webform
                !loading ?
                    <form onSubmit={handleFormSubmit} className='form'>
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
                            onChange={(e) => {setOrgDetails({...orgDetails, name: e.target.value})}}
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
                        options={emailOptions.length > 0 ? [...emailOptions, 'Whole List'] : [] /*If there is an uploaded csv then display the options laoded in the state */}
                        freeSolo
                        ListboxProps={{ style: { maxHeight: 200, overflow: 'auto' } }}
                        onChange={(event, newValue, reason) => {
                            console.log('option', newValue)
                            console.log(reason)
                            /*
                            these are defined in the API for this component...
                            event: callback event when there is a change in the autocomplete
                            newValue: array which contains each new addition to the autocomplete
                            reason: 'remove-option | 'clear' | 'create-option' | 'add-option' ... Self explanatory, what action of the autocomplete is the user invoking?
                            */
                            if (reason === "remove-option") {
                                //This is the item to be deleted... hacky fix using the DOM as the API doesnt include an option to access this :/
                                const toDelete = event.currentTarget.parentElement.innerText
                                if(toDelete === 'Whole List'){
                                    //If user chooses the whole list option included then remove the whole list
                                    newValue = []
                                    setOrgDetails({...orgDetails, email_list: []})
                                }
                                else{
                                    //This is a short js algorithm to remove a specific item in an array
                                    console.log('emails', orgDetails.email_list)
                                    let array = orgDetails.email_list
                                    //find the index
                                    const index = array.indexOf(toDelete)
                                    console.log(index)
                                    //'splice' the array from that index to remove the only item there, leave the rest of the array intact
                                    array.splice(index, 1);
                                    console.log('arr', array)
                                    //reset the state with the updated array
                                    setOrgDetails({...orgDetails, email_list: array}) 
                                }

                              }
                              else if(reason === 'clear'){
                                  //If the user wants to clear their selctions, clear everything
                                  newValue = []
                                  setOrgDetails({...orgDetails, email_list: []})
                              }
                              else if(reason === 'create-option'){
                                  //This allows to user to create an option just by typing in a new email... doesnt have to be from the file
                                  const newItem = newValue.length == 1 ? newValue[0] : event.currentTarget.parentElement.innerText
                                  //Checks if the email is already there
                                  if(orgDetails.email_list.includes(newItem)){
                                      alert('You have already entered this contact')
                                      newValue.pop()
                                  }
                                  //Check if the option entered is actually an email
                                  else if(!checkForEmail(newItem)){
                                      alert('Please enter a valid email')
                                      newValue.pop()
                                  }
                                  //Otherwise, if it passes the checks, add it to the email list
                                  else{
                                      setOrgDetails({...orgDetails, email_list: [...orgDetails.email_list, newValue[newValue.length - 1]]})
                                  }
                                  
                              }
                              else{
                                  //Setting the wholse list to the state if the user wishes to do so
                                if(newValue[newValue.length -1] === 'Whole List'){
                                    setOrgDetails({...orgDetails, email_list: emailOptions})
                                }
                                else{
                                    //if very last of these options if it is just an option from the options list in the autocomplete
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
                            //Just setting the type of organisation from the corresponding dropdown
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
                    <Button type='submit' onClick={postForm} className='btn'>Submit</Button>
                      </div>
                </form>
                :
                //If the form is in a 'loading' state, we then need to check if the status is failed, loading, or done and display the correct Box components
                status == 'Done' ?
                <Box
                display="flex"
                flexDirection="column"
                alignSelf="center"
                justifySelf="center"
                alignItems="center"
            >
                <Typography variant="h3" color="primary">
                    Workspace Created
                </Typography>
                <Button component={Link} to="/">
                    Go Back
                </Button>
                 </Box>
                : 
                status == 'Failed' ?
                <Box
                display="flex"
                flexDirection="column"
                alignSelf="center"
                justifySelf="center"
                alignItems="center"
            >
                <Typography variant="h3" color="primary">
                    Failed Creating Workspace
                </Typography>
                <Button  component={Link} to="/">
                    Go Back
                </Button>
                <Button
                    onClick={() => {
                        //Simple onclicks to repost the form if it has failed 
                        postForm();
                        setStatus('')
                    }}
                >
                    Retry
                </Button>
            </Box>
                :
                <Box
                display="flex"
                flexDirection="column"
                alignSelf="center"
                justifySelf="center"
                alignItems="center"
            >
                <Typography variant="h3" color="primary">
                    Creating Workspace...
                </Typography>
                <CircularProgress color="primary" />
            </Box>
            }    
                </Card>
            </div>
            </React.Fragment>
    )
}

export default withTheme(OrgCreator);