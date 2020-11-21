import { Auth } from 'aws-amplify'

//This function is for creating ids to post unique items to the backend
export const makeId = (length = 8) => {
    let text = '';
    const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

//api root for rest API for getting and posting
const api_root = 'https://l23a5cgikg.execute-api.eu-west-2.amazonaws.com/dev/'

export const GET = async (resource, additional_params) => {
    const creds = await Auth.currentSession();
    const IDToken = creds.getIdToken().getJwtToken();
    const options = {
        headers: {
            Authorization: IDToken,
            'Content-Type': 'application/json',
        },
    };
    const url = api_root + resource;
    console.debug('STREAMLINE GETting', url);
    let response = await fetch(url, options);
    response = await response.json();
    console.debug('response from', resource, ':', response);
    return response;
};

export const POST = async (resource, body) => {
    const creds = await Auth.currentSession();
    const IDToken = creds.getIdToken().getJwtToken();
    const options = {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify(body),
        headers: {
            Authorization: IDToken,
            'Content-Type': 'application/json',
        },
    };
    const url = api_root + resource;
    let response = await fetch(url, options);
    response = await response.json();
    console.debug('response from', resource, ':', response);
    return response;
};

export const checkForEmail = (val) => {
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    return emailRegex.test(val)
}


