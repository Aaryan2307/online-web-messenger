

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
const api_root = ''

