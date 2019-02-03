var SO = {
    baseAddress: "https://api.stackexchange.com",
    version: "2.2",
    filters: {
        minAnswerInfo: '!4*tK)IDgUtZe7W.uT',
        minAnswerInfoWithTags:'!bL9HaJrfnv-Q0-',
        answerBody: '!bLf7X.NOsyYsJm',
        answersTotalCount: '!bGqd9.SFasj.6I'
    },
    sortBy:{
        'LastActivityDate': 'activity',
        'CreationDate': 'creation',
        'Score': 'votes'
    },
    answers(){
        var ids = [].slice.call(arguments);
        return {
            url: `answers/${ids}${ids.length?'':'/'}`,
            method: 'GET'
        };
    },
    users(){
        var ids = [].slice.call(arguments);
        return {
            url: `users/${ids}${ids.length?'':'/'}`,
            method: 'GET',
            answers(){
                return {
                    url: `${this.url}/answers`,
                    method: 'GET'
                };
            }
        };
    },
    exec(request, options){
        return fetch(`${this.baseAddress}/${this.version}/${request.url}?${this.optionsToQuery(options)}`,{
            method: request.method
        }).then(r=> r.json())
    },
    defaultOptions: {
        order:'desc',
        sort: 'votes',
        site: 'stackoverflow',
        key: 'tQnIcpToSZjxX8mrTSnFhw(('
    },
    optionsToQuery(options){
        return Object.entries(Object.assign({}, this.defaultOptions,options)).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }
};
