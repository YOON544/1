// ==UserScript==
// @name         Laftel Skip Next
// @namespace    https://gist.github.com/Ariette
// @version      0.2
// @description  라프텔에서 다음화 보기 카운트다운을 무시하고 바로 다음화로 넘어가는 유저스크립트
// @author       Ariette
// @match        https://laftel.net/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

function checkNext(e) {
    // Find Next Episode info only in player page
    if (window.location.pathname.indexOf('player') != -1) {
        const container = document.getElementById('root');
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver((mutations) => {
            const next = container.getElementsByClassName('next-episode');
            if (!next.length) return;
            const link = next[0].getElementsByClassName('same-item');
            if (!link.length) return;
            link[0].click();
            return;
        });
        observer.observe(container, config);
    }
    return;
};

// Hack history.pushState function
// Because there isn't any native API to detect history.pushState()
const origFunc = history.pushState;
history.pushState = function () {
    window.dispatchEvent(new Event('pushstate'));
    return origFunc.apply(this, arguments);
};

window.addEventListener('load', checkNext);
window.addEventListener('popstate', checkNext);
window.addEventListener('pushstate', checkNext);