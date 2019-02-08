var grundyId = {
    ru: 186999
}
var site = "ru.stackoverflow";

(function (userId, site, SO) {
    var meta = {
        description: document.querySelector('meta[name="description"]'),
        keywords: document.querySelector('meta[name="keywords"]'),
        title: document.querySelector('title'),
        canonical: document.querySelector('link[rel="canonical"]')
    };
    function setMeta(title, descr, keyw){
        meta.title.textContent = title + ' - Grundy On-line';
        if(descr)
            meta.description.setAttribute('content', descr);
        if(keyw)
            meta.keywords.setAttribute('content', keyw);
        meta.canonical.setAttribute('href', location);
    }
    window.addEventListener('hashchange', route);
    var routeMapping = [[
        /^#!\/list\/top(\/(\d+))?$/, function (_, _, curPage) {
            showTop(Number(curPage) || 1);
        }, function (pageNum) { return `#!/list/top/${pageNum}`; }], [
        /^#!\/list\/active(\/(\d+))?$/, function (_, _, curPage) {
            showLast(Number(curPage) || 1);
        }, function (pageNum) { return `#!/list/active/${pageNum}`; }], [
        /^#!\/(a|q)\/(\d+)$/, function (_, type, id) {
            showPost(type, id);
        }, function (type, id) { return `#!/${type}/${id}`; }], [
        /^(#!)?\/?$/, function(){ showTop(1); }, function () { return ''; }
    ]
    ];
    var currentRoute;
    function route() {
        header.classList.remove('down');
        container.classList.remove('down');

        for (var a in routeMapping) {
            var r = routeMapping[a][0];
            var h = routeMapping[a][1];
            var c = routeMapping[a][2];
            var m = location.hash.match(r);
            if (m) {
                currentRoute = c;
                h.apply(null,m);
                return;
            }
        }

        showOops();
    }
    var userAnswers = SO.users(userId).answers();
    var container = document.querySelector('.container');
    var header = document.querySelector('header');

    document.querySelector('.hamb').addEventListener('click', function () {
        if (header.classList.contains('down')) {
            header.classList.remove('down');
            container.classList.remove('down');
        } else {
            header.classList.add('down');
            container.classList.add('down');
        }
    });

    function main() {
        header.classList.remove('small', 'oops');
        if (container.firstChild) {
            return container.removeChild(container.firstChild);
        }
    };

    function showList(p) {
        p = p || {};
        var sort = p.sort;
        var pageHeading = p.pageHeading;
        function loadUserAnswers(p1) {
            var page = p1.page;
            var pageSize = p1.pageSize;
            return SO.exec(userAnswers, {
                site: site,
                sort: sort,
                page: page,
                pageSize: pageSize,
                filter: SO.filters.minAnswerInfoWithTags
            }).then(function(r) {
                var items = r.items;
                renderAnswersList(answersListEl, items);
            });
        }
        function loadAnswersCount(p2) {
            var page = p2.page;
            var pageSize = p2.pageSize;
            return SO.exec(userAnswers, {
                site: site,
                sort: sort,
                filter: SO.filters.answersTotalCount
            }).then(function (r) {
                var total = r.total;
                renderPager(pagerEl, total, pageSize, page, window.innerWidth < 420 ? 3 : 5);
            });
        }
        function renderAnswersList(answersListEl, answers) {
            answersListEl.innerHTML = answers.map(function(a){ return `
                <div class="answer">
                    <span class="score ${a.is_accepted ? 'accepted' : ''}">${a.score}</span>
                    <div class="info">
                        <div class="title"><a href="#!/a/${a.answer_id}">${a.title}</a></div>
                        <div class="link">
                            <div class="tags">
                                ${ a.tags.map(function(tag){ return `<a target="_blank" rel="noreferrer" href="https://${site}.com/questions/tagged/${tag}">${tag}</a>`;}).join(' ')}
                            </div>
                            <a target="_blank" rel="noreferrer" href="https://${site}.com/a/${a.answer_id}/${userId}">источник</a>
                        </div>
                    </div>
                </div>
            `;}).join('');
        }

        var cal = function createAnswersListEl() {
            var answersSectionEl = document.createElement('section');
            answersSectionEl.classList.add('page');

            var heading = document.createElement('h1');
            heading.textContent = pageHeading;
            answersSectionEl.appendChild(heading);

            var answersListEl = document.createElement('div');
            answersListEl.classList.add('answers-list');
            answersSectionEl.appendChild(answersListEl);

            var pagerEl = document.createElement('div');
            pagerEl.classList.add('pager');
            answersSectionEl.appendChild(pagerEl);

            return { a1: answersSectionEl, a2: answersListEl, a3: heading, a4: pagerEl };
        }();
        var answersSectionEl = cal.a1;
        var answersListEl = cal.a2;
        var heading = cal.a3;
        var pagerEl = cal.a4;
        function renderPager(pagerEl, total, pageSize, curPage, pagerButtonCount) {
            var template = function(index){ return `<a href="${currentRoute(index)}" class="pager-button ${curPage == index ? 'active' : ''}">${index}</a>`;};
            var half = Math.floor(pagerButtonCount / 2);
            var totalPageCount = Math.ceil(total / pageSize);
            var startPageNum = Math.max(curPage - half, 1);
            var endPageNum = Math.min(curPage + half, totalPageCount);
            var buttonCount = endPageNum - startPageNum + 1;
            var pages = new Array(pagerButtonCount + 4);
            if (startPageNum > pagerButtonCount - half) {
                pages[0] = template(1);
                pages[1] = "<span>...</span>";
            } else if (startPageNum > pagerButtonCount - half - 1) {
                pages[0] = template(1);
                pages[1] = template(2);
            } else if (startPageNum > 1) {
                pages[0] = template(1);
            }
            for (var i = 0; i < buttonCount; i++) {
                pages[i + 2] = template(startPageNum + i);
            }
            if (endPageNum < totalPageCount - pagerButtonCount - half) {
                pages[pages.length - 2] = "<span>...</span>";
                pages[pages.length - 1] = template(totalPageCount);
            } else if (endPageNum < totalPageCount - pagerButtonCount - half - 1) {
                pages[pages.length - 2] = template(totalPageCount - 1);
                pages[pages.length - 1] = template(totalPageCount);
            } else if (endPageNum < totalPageCount - 1) {
                pages[pages.length - 1] = template(totalPageCount);
            }
            pagerEl.innerHTML = pages.join('');
        };

        return function (page, pageSize) {
            pageSize = pageSize || 30;
            header.classList.add('small');

            answersSectionEl.classList.add('loading');
            loadUserAnswers({ page: page, pageSize: pageSize }).then(function(){ return answersSectionEl.classList.remove('loading');});
            loadAnswersCount({ page: page, pageSize: pageSize });
            
            setMeta(pageHeading + (page>1? ' стр. ' + page: ''), pageHeading +' ответы Grundy На ru.stackoverflow');
            
            if (answersSectionEl.parentNode) return;

            if (container.firstChild) {
                return container.replaceChild(answersSectionEl, container.firstChild);
            }
  
            container.appendChild(answersSectionEl);
        };
    };

    var showTop = showList({ sort: SO.sortBy.Score, pageHeading: 'Топ' });
    var showLast = showList({ sort: SO.sortBy.LastActivityDate, pageHeading: 'Активные' });

    var showPost = function () {
        var cpe = function createPostEl() {
            var el = document.createElement('section');
            el.classList.add('post', 'page');

            var info = document.createElement('div');
            info.classList.add('tags');
            el.appendChild(info);

            var heading = document.createElement('h1');
            heading.classList.add('heading');
            el.appendChild(heading);

            var content = document.createElement('div');
            el.appendChild(content);

            var source = document.createElement('div');
            source.classList.add('source-link-container');
            el.appendChild(source);
            return { el: el, heading: heading, content: content, info: info, source: source };
        }();
        var postEl = cpe.el;
        var heading = cpe.heading;
        var content = cpe.content;
        var info = cpe.info;
        var source = cpe.source;
        function clearPost(heading, content) {
            heading.innerHTML = '';
            content.innerHTML = '';
            info.innerHTML = '';
            source.innerHTML = '';
        }
        function showPost(post) {
            info.innerHTML = post.tags.map(function(tag){ return `<a target="_blank" rel="noreferrer" href="https://${site}.com/questions/tagged/${tag}">${tag}</a>`;}).join(' ');
            heading.innerHTML = post.title;
            content.innerHTML = post.body;
            source.innerHTML = `<a target="_blank" rel="noreferrer" href="https://${site}.com/a/${post.answer_id}/${userId}">источник</a>`

            for (var a of content.querySelectorAll('a')) {
                a.target = '_blank';
                a.rel = 'noreferrer';
            }
            return post;
        }
        return function (type, id) {
            if (postEl.dataset.postId != id) {
                clearPost(heading, content);
            }
            postEl.dataset.postId = id;
            header.classList.add('small');

            postEl.classList.add('loading');
            if (type == 'a') {
                SO.exec(SO.answers(id), {
                    site: site,
                    filter: SO.filters.answerBody
                })
                    .then(function(r){ return !r.items[0] ? Promise.reject(`Not found post #${id}`) : r.items[0];})
                    .then(showPost)
                    .then(function(post){setMeta('О: '+post.title, 'Ответ Grundy на вопрос '+ post.title)})
                    .catch(function(error){ return console.log(error) || showOops(error);})
                    .then(function() { return postEl.classList.remove('loading');});

            }

            if (container.firstChild) {
                return container.replaceChild(postEl, container.firstChild);
            }

            container.appendChild(postEl);
        }
    }();

    var showOops = function () {
        var oopsEl = document.createElement('div');
        oopsEl.classList.add('oops');
        var defaultMsg = `Что-то пошло не так... <br>Попробуйте <a href="#">начать с начала</a>`
        oopsEl.innerHTML = defaultMsg;
        return function (error) {
            header.classList.add('oops');
            if(error){
                oopsEl.innerHTML = defaultMsg + '<br>' + error;
            }
            if (container.firstChild) {
                return container.replaceChild(oopsEl, container.firstChild);
            }

            container.appendChild(oopsEl);
        };
    }();
    route();
})(grundyId.ru, site, SO);
