import config from './config';

function postOptionsWithBody(body: any): any {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    };
}

export default {
    createGame: async function(game: {code: string}) {
        const res = await fetch(`${config.apiRoot}/api/game`, postOptionsWithBody(game));
        return await res.json();
    }
}
