class Config {
    apiRoot: string

    async load(): Promise<boolean> {
        const resp = await fetch('/config/config.json');
        if (resp.ok) {
            const body = await resp.json();
            console.log('body', body);
            this.apiRoot = body.apiRoot;
        } else {
            return false;
        }
        return true;
    }
}

export default new Config();