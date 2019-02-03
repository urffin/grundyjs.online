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
    answers: function(){
        var ids = [].slice.call(arguments);
        return {
            url: `answers/${ids}${ids.length?'':'/'}`,
            method: 'GET'
        };
    },
    users: function(){
        var ids = [].slice.call(arguments);
        return {
            url: `users/${ids}${ids.length?'':'/'}`,
            method: 'GET',
            answers: function(){
                return {
                    url: `${this.url}/answers`,
                    method: 'GET'
                };
            }
        };
    },
    exec: function(request, options){
        return fetch(`${this.baseAddress}/${this.version}/${request.url}?${this.optionsToQuery(options)}`,{
            method: request.method
        }).then(function(r){ return r.json();})
    },
    defaultOptions: {
        order:'desc',
        sort: 'votes',
        site: 'stackoverflow',
        key: 'tQnIcpToSZjxX8mrTSnFhw(('
    },
    optionsToQuery: function(options){
        return Object.entries(Object.assign({}, this.defaultOptions,options)).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    }
};
