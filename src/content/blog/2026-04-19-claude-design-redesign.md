---
title: "Claude Design으로 블로그를 통째로 갈아엎은 후기"
pubDate: 2026-04-19
description: "Jekyll 블로그를 Claude Design에서 프로토타입부터 만들고, Astro로 마이그레이션해서 새 디자인으로 재탄생시킨 과정."
tags: ["claude", "design", "astro", "jekyll", "github-pages"]
---

몇 년째 Jekyll + Bay 테마로 굴러가던 블로그가 어느 순간부터 내 눈에 안 들어오기 시작했다. "개발 블로그"라는 제목에 걸맞게 뭔가 더 집중된, 에세이 같은 느낌이 있으면 좋겠다고 생각하던 차에, **Claude Design**(claude.ai/design)으로 디자인부터 먼저 해보고 그대로 구현까지 해봤다.

## 1. 디자인 먼저, 코드는 나중에

Claude Design은 프롬프트로 UI를 만들어주는 툴이다. 채팅으로 원하는 방향을 설명하면 HTML/CSS/JS 프로토타입을 바로 보여준다. Figma처럼 드래그해서 만드는 게 아니라, **"이런 느낌으로"** 라고 말하면 그걸 해석해서 실제 동작하는 화면을 그려준다.

나는 이렇게 시작했다.

> github.io 로 블로그가 이미 하나 있는데 이걸 완전히 새로운 블로그 디자인으로 교체하고 싶은데 개발자 블로그 디자인 만들어줘.

Claude는 바로 몇 가지 질문을 던졌다. 무슨 바이브인지, 어떤 페이지가 필요한지, 콘텐츠 성격은 뭔지, 페르소나는 어떤지.

내 대답을 요약하면:

- **vibe**: 미니멀 타이포그래피, 여백 많고 읽기 편한 에세이 느낌
- **페이지**: 홈, 포스트 상세, About, 태그
- **콘텐츠**: 회고/커리어 이야기, 짧은 TIL
- **페르소나**: 닉네임 봉동이, 하는 일은 Spring·Flutter 개발

## 2. 실제 화면

몇 분 뒤 완성된 프로토타입.

![Claude Design에서 만든 봉동이.blog 프로토타입](/images/posts/claude-design-blog.png)

왼쪽은 내가 나눈 실제 대화, 오른쪽은 렌더링된 홈 화면이다. 체감한 포인트들:

- **Newsreader serif + Inter Tight + JetBrains Mono** 조합으로 에세이 느낌을 살림
- 따뜻한 off-white(`#faf9f5`) 배경 + 숲 녹색 액센트
- 680px 단일 컬럼, 번호 매긴 포스트 리스트, featured long-read 카드
- 우측 하단에 **Tweaks 패널** — 레이아웃 밀도(tight / regular / airy / essay)를 슬라이더로 실시간 조절

마지막 게 꽤 흥미로웠다. "여백이 좀 더 있었으면 좋겠다"는 요구를 **토글 가능한 기능으로** 심어둔 거다. 내가 원할 때 essay 모드로 바꿔서 읽을 수 있다. 이런 걸 직접 코딩하려면 꽤 시간이 걸렸을 텐데 프로토타입 단계에서 이미 들어가 있었다.

## 3. 프로토타입 → 실제 블로그

Claude Design은 "핸드오프 번들"이라는 걸 내보낼 수 있다. HTML/CSS/JS 프로토타입 파일 + 대화 기록 + README가 묶인 zip이다. 핵심은 **코딩 에이전트가 이걸 받아서 실제 코드베이스에 구현할 수 있게** 설계돼 있다는 점.

나는 Claude Code에 이렇게 말했다.

> 이 디자인 파일 가져와서 README 읽고, 관련 부분 구현해줘. index.html 을 반영하는 거로. 이 블로그에 이 디자인으로 변경해줘.

여기서부터가 진짜 재밌었다. Claude Code가 한 일을 정리하면:

### Jekyll 위에서 1차 적용

처음엔 기존 Jekyll 그대로 두고 레이아웃·SCSS·인클루드만 새 디자인으로 교체했다. 변경된 파일:

- `assets/css/main.scss` — 디자인 토큰과 전체 스타일
- `_includes/head.html` — Google Fonts 로드
- `_includes/header.html`, `footer.html` — 새 내비/푸터
- `_layouts/default.html`, `home.html`, `post.html`, `blog.html` — 새 레이아웃
- Liquid로 **연도별 포스트 그룹핑**, **번호 매기기**, **featured 선정** 로직 구현

이 단계에서 이미 디자인은 그럴싸하게 붙었다. 근데 내가 더 근본적인 질문을 던졌다.

> Jekyll이 github.io 블로그 베스트 프랙티스야?

### Astro 마이그레이션

Claude Code의 답은 깔끔했다: "예전엔 맞았는데, 지금은 Astro/Hugo/11ty 쪽이 더 현대적이다." Jekyll의 Ruby 의존성 때문에 로컬 환경 세팅도 자꾸 꼬이고(실제로 `public_suffix` 설치 에러로 로컬 빌드가 안 됐다), 빌드 속도도 느리다.

그래서 **Astro 6**로 마이그레이션하기로 했다. 대략 이런 순서로 진행:

1. `jekyll-backup` 브랜치로 기존 상태 통째로 백업
2. `package.json`, `astro.config.mjs`, `src/content.config.ts` 스캐폴드
3. `_posts/*.md` 63개를 스크립트로 `src/content/blog/*.md`로 옮기면서 frontmatter를 Astro 스키마에 맞게 변환
    - `date` → `pubDate`
    - `categories` → `tags`
    - `blurb` → `description`
    - Jekyll Liquid 태그(`{{ "..." | absolute_url }}`)는 정규식으로 정리
4. 디자인 CSS를 `src/styles/global.css`로 이식
5. `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `src/pages/index.astro`, `src/pages/blog/[...id].astro` 작성
6. `@astrojs/sitemap`으로 sitemap 자동 생성, `@astrojs/rss`로 RSS 피드 생성
7. `.github/workflows/deploy.yml` 추가 — `withastro/action@v6`로 GitHub Pages 자동 배포
8. 로컬 빌드 성공(**65 pages**) → Jekyll 파일 전부 삭제 → 커밋 → 푸시

배포는 GitHub Pages의 **Source**를 "Deploy from a branch"에서 "GitHub Actions"로 바꾸면 끝. 이후엔 푸시하면 1~2분 뒤 알아서 빌드되고 배포된다.

## 4. SEO도 잊지 않기

디자인만 예뻐서는 소용없다. 블로그가 검색 안 걸리면 아무도 안 본다.

- `public/robots.txt` — `sitemap-index.xml` 위치 명시
- `BaseLayout.astro`에 **JSON-LD 구조화 데이터** 삽입 (포스트는 `BlogPosting`, 나머지는 `WebSite`)
- Open Graph / Twitter Card 메타태그
- Google Search Console에 `sitemap-index.xml` 제출
- 네이버 웹마스터도구에도 사이트맵/RSS 등록

Jekyll 시절 써둔 Google·Naver 소유권 확인 파일도 `public/`에 복구해서 그대로 재활용했다.

## 5. 돌아보면

**Claude Design이 해준 것**

- 프롬프트로 시작해서 "디자인 시스템 선언 → 4개 페이지 프로토타입"까지 한 번에
- Tweaks 패널 같은 잔재미 있는 기능까지 심어줌
- 핸드오프 번들로 코딩 에이전트에 그대로 넘기기 좋게 포맷

**Claude Code가 해준 것**

- Jekyll 컨텍스트 파악, 디자인 붙이기
- "Jekyll 꼭 써야 해?" 질문에 솔직하고 실용적인 답
- Astro 마이그레이션 전체 실행 (63개 포스트 자동 변환 포함)
- GitHub Actions 워크플로, SEO 메타태그, JSON-LD까지

전체 작업은 대략 **한 저녁** 걸렸다. 예전 같으면 테마 고르고, 포크 뜨고, 커스터마이즈하고, 로컬 세팅하고, 설치 에러 붙잡고… 며칠 걸렸을 일이다. 무엇보다 결과물이 **내가 원한 방향**이라는 게 제일 크다. 남의 테마를 쓰면 결국 거기에 맞춰 살게 되는데, 이번엔 내 취향에서 출발해서 구체적인 구현까지 온 셈이니까.

디자인과 코드를 가르던 벽이 점점 얇아지는 걸 체감한 작업이었다.
