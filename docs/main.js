var grundyId = {
    ru: 186999
}
var site = "ru.stackoverflow";

(function (userId, site, SO) {
    window.addEventListener('hashchange', route);
    var routeMapping = [[
        /^#\/list\/top(\/(\d+))?$/, function (_, _, curPage) {
            showTop(Number(curPage) || 1);
        }, function (pageNum) { return `#/list/top/${pageNum}`; }], [
        /^#\/list\/active(\/(\d+))?$/, function (_, _, curPage) {
            showLast(Number(curPage) || 1);
        }, function (pageNum) { return `#/list/active/${pageNum}`; }], [
        /^#\/(a|q)\/(\d+)$/, function (_, type, id) {
            showPost(type, id);
        }, function (type, id) { return `#/${type}/${id}`; }], [
        /^#?\/?$/, main, function () { return ''; }
    ]
    ];
    var currentRoute;
    function route() {
        header.classList.remove('down');
        container.classList.remove('down');

        for (var [r, h, c] of routeMapping) {
            var m = location.hash.match(r);
            if (m) {
                currentRoute = c;
                h(...m);
                ga('send', 'pageview', {
                    'page': location.pathname + location.search + location.hash
                });
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

    function showList({ sort, pageHeading } = {}) {
        function loadUserAnswers({ page, pageSize }) {
            return SO.exec(userAnswers, {
                site,
                sort,
                page,
                pageSize,
                filter: SO.filters.minAnswerInfoWithTags
            }).then(({ items }) => {
                renderAnswersList(answersListEl, items);
            });
        }
        function loadAnswersCount({ page, pageSize }) {
            return SO.exec(userAnswers, {
                site,
                sort,
                filter: SO.filters.answersTotalCount
            }).then(({ total }) => {
                renderPager(pagerEl, total, pageSize, page, window.innerWidth < 420 ? 3 : 5);
            });
        }
        function renderAnswersList(answersListEl, answers) {
            answersListEl.innerHTML = answers.map(a => `
                <div class="answer">
                    <span class="score ${a.is_accepted ? 'accepted' : ''}">${a.score}</span>
                    <div class="info">
                        <div class="title"><a href="#/a/${a.answer_id}">${a.title}</a></div>
                        <div class="link">
                            <div class="tags">
                                ${ a.tags.map(tag => `<a target="_blank" rel="noreferrer" href="https://${site}.com/questions/tagged/${tag}">${tag}</a>`).join(' ')}
                            </div>
                            <a target="_blank" rel="noreferrer" href="https://${site}.com/a/${a.answer_id}/${userId}">источник</a>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        var { answersSectionEl, answersListEl, heading, pagerEl } = function createAnswersListEl() {
            var answersSectionEl = document.createElement('section');
            answersSectionEl.classList.add('page');

            var heading = document.createElement('h2');
            heading.textContent = pageHeading;
            answersSectionEl.appendChild(heading);

            var answersListEl = document.createElement('div');
            answersListEl.classList.add('answers-list');
            answersSectionEl.appendChild(answersListEl);

            var pagerEl = document.createElement('div');
            pagerEl.classList.add('pager');
            answersSectionEl.appendChild(pagerEl);

            return { answersSectionEl, answersListEl, heading, pagerEl };
        }();
        function renderPager(pagerEl, total, pageSize, curPage, pagerButtonCount) {
            var template = index => `<a href="${currentRoute(index)}" class="pager-button ${curPage == index ? 'active' : ''}">${index}</a>`;
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

        return function (page, pageSize = 30) {
            header.classList.add('small');

            answersSectionEl.classList.add('loading');
            loadUserAnswers({ page, pageSize }).then(() => answersSectionEl.classList.remove('loading'));
            loadAnswersCount({ page, pageSize });
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
        var { el: postEl, heading, content, info, source } = function createPostEl() {
            var el = document.createElement('section');
            el.classList.add('post', 'page');

            var info = document.createElement('div');
            info.classList.add('tags');
            el.appendChild(info);

            var heading = document.createElement('h2');
            heading.classList.add('heading');
            el.appendChild(heading);

            var content = document.createElement('div');
            el.appendChild(content);

            var source = document.createElement('div');
            source.classList.add('source-link-container');
            el.appendChild(source);
            return { el, heading, content, info, source };
        }();
        function clearPost(heading, content) {
            heading.innerHTML = '';
            content.innerHTML = '';
            info.innerHTML = '';
            source.innerHTML = '';
        }
        function showPost(post) {
            info.innerHTML = post.tags.map(tag => `<a target="_blank" rel="noreferrer" href="https://${site}.com/questions/tagged/${tag}">${tag}</a>`).join(' ');
            heading.innerHTML = post.title;
            content.innerHTML = post.body;
            source.innerHTML = `<a target="_blank" rel="noreferrer" href="https://${site}.com/a/${post.answer_id}/${userId}">источник</a>`

            for (var a of content.querySelectorAll('a')) {
                a.target = '_blank';
                a.rel = 'noreferrer';
            }
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
                    site,
                    filter: SO.filters.answerBody
                })
                    .then(({ items: [item] }) => !item ? Promise.reject(`Not found post #${id}`) : item)
                    .then(showPost)
                    .catch((error) => console.log(error) || showOops())
                    .then(() => postEl.classList.remove('loading'));

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
        oopsEl.innerHTML = `Что-то пошло не так... <br>Попробуйте <a href="#">начать с начала</a>`;
        return function () {
            header.classList.add('oops');
            if (container.firstChild) {
                return container.replaceChild(oopsEl, container.firstChild);
            }

            container.appendChild(oopsEl);
        };
    }();
    route();
})(grundyId.ru, site, SO);
