exports.gameFromUrl = function(url) {
    const match = url.match(/^.*\/live\/game\/([a-zA-z_0-9]+).*$/)
    if (match) {
        return match[1];
    }
    return undefined;
}

exports.sendWsJson = function(websocketOrArray, body) {
    let all = websocketOrArray;
    if (!Array.isArray(websocketOrArray)) {
        all = [websocketOrArray];
    }

    for (const ws of all) {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify(body));
        }
    }
}
