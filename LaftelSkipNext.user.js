// ==UserScript==
// @name         Laftel Skip Next
// @namespace    https://gist.github.com/Ariette/a8e168d6a612c2d75a34bb7fb352e712
// @version      0.3
// @description  라프텔에서 다음화 보기 카운트다운을 무시하고 바로 다음화로 넘어가는 유저스크립트
// @author       Ariette
// @match        https://laftel.net/*
// @run-at       document-start
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

(async () => {
    // MutationObserver 초기화
    const container = document.getElementById('root');
    const config = { childList: true, subtree: true };
    const observer = new MutationObserver((m, o) => {
        const next = container.getElementsByClassName('next-episode');
        if (!next.length) return;
        const link = next[0].getElementsByClassName('same-item');
        if (!link.length) return;
        o.disconnect();
        link[0].click();
        return;
    });

    // history.pushState 함수 수정
    // pushState 이벤트를 받을 수 있는 네이티브 API가 없는 관계로 어쩔 수 없이 전역 함수를 수정해서 사용합니다.
    // 다른 더 좋은 방법이 있다면 알려주세요.
    const origFunc = history.pushState;
    history.pushState = function () {
        window.dispatchEvent(new Event('pushstate'));
        return origFunc.apply(this, arguments);
    };

    // 다음화 찾기 함수
    const checkNext = () => {
        // 플레이어 페이지에서만 MutationObserver 동작
        if (window.location.pathname.indexOf('player') === 1) {
            observer.observe(container, config);
            return;
        }
        // 플레이어 페이지가 아니라면 MutationObserver 끄기
        observer.disconnect();
    }


    // 스크립트 켜기/끄기 Notification(기본값 : 0.5초)
    const notiOn = '<div style="position:fixed; top:20px; left:20px; z-index:9000; background-color:black; color:white; padding:4px 8px; font-size:.8rem; border:1px solid #fff;" id="laftelSkipNextNoti">자동 넘김 On</div>'
    const notiOff = '<div style="position:fixed; top:20px; left:20px; z-index:9000; background-color:black; color:white; padding:4px 8px; font-size:.8rem; border:1px solid #fff;" id="laftelSkipNextNoti">자동 넘김 Off</div>'
    const notify = (html) => {
        const template = document.createElement('template');
        template.innerHTML = html;
        const noti = container.appendChild(template.content.firstChild);
        setTimeout(() => {
            noti.remove();
        }, 500)
    }

    // 스크립트 끄고 켜기
    const turnOnScript = () => {
        window.addEventListener('popstate', checkNext);
        window.addEventListener('pushstate', checkNext);
        checkNext();
    }
    const turnOffScript = () => {
        window.removeEventListener('popstate', checkNext);
        window.removeEventListener('pushstate', checkNext);
        observer.disconnect();
    }

    // 설정 읽기
    let active = await GM.getValue('active', true);

    // 단축키 구현(기본값 : Alt + `(~))
    window.addEventListener('keyup', (e) => {
        if (!e.altKey || e.key !== '`') return;
        if (active) {
            active = false;
            GM.setValue('active', false);
            turnOffScript();
            notify(notiOff);
        } else {
            active = true;
            GM.setValue('active', true);
            turnOnScript();
            notify(notiOn);
        }
    })

    // 스크립트 시작
    window.addEventListener('load', (e) => {
        if (active) turnOnScript();
    })
})();