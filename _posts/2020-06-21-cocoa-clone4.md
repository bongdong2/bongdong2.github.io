---
title: "HTML & CSS - practice 1"
date: 2020-06-28 16:48:00 -0400
categories: html&css
---

## 0. 사전작업

1. github desktop 설치하여 사용(사용 안 해도 상관 없음)
2. .gitignore 생성 > .DS_Store 추가
3. index.html 생성
4. prettier, colorzillar, page ruller redux 설치

## 1. status bar, header 만들기

- [fontawesome](https://fontawesome.com/) 사용하여 아이콘을 무료로 쓰자

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.13.1/css/all.css"
      integrity="sha384-xxzQGERXS00kBmZW/6qxqJPyxW3UR0BPsL4c8ILaIWXva5kFi7TxkIIaMiKtqV1Q"
      crossorigin="anonymous"
    />
    <title>Chats | Kakao Clone</title>
  </head>
  <body>
    <div class="status-bar">
      <div class="status-bar__column">
        <span class="status-bar__clock">13:54 </span>
      </div>
      <div class="status-bar__column">
        <i class="fas fa-clock"></i>
        <i class="fas fa-volume-mute"></i>
        <i class="fas fa-wifi"></i>
        <span class="status_bar__battery-level">100%</span>
        <i class="fas fa-battery-full"></i>
      </div>
    </div>
    <header class="header">
      <div class="header__header-column">
        <h1 class="header__title">Chats</h1>
      </div>
      <div class="header__header-column">
        <span class="header__icon">
          <i class="fas fa-search"></i>
        </span>
        <span class="header__icon">
          <i class="far fa-comment"></i>
        </span>
        <span class="header__icon">
          <i class="fas fa-cog"></i>
        </span>
      </div>
    </header>
  </body>
</html>

// 클래스 네이밍 규칙 부모 > 자식 : 언더스코어 2개 __ 단어 이어쓰기 : 언더스코어
1개 _
```
