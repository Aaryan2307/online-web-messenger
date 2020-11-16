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


