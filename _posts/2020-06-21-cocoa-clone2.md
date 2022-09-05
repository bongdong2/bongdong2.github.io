---
title: "HTML & CSS - Flex"
date: 2020-06-14 18:05:00 -0400
categories: html&css
---

플렉스란?

## flex

- 기존의 문제

  - diaplay inline-block 박스를 많이 만들면 옆으로 붙다가 아래로 이동하고 margin을 같은 값으로 맞춰도 margin이 각각 달라지는 지점이 존재한다. 자동으로 완성되는 그리드가 없어지게 된 것이다. 디바이스에 따라 다른 모습이 출력되어 보인다.
  - 이것을 플렉스로 고칠 수 있다.

- 규칙

  - 일단 부모를 만들고 박스를 만든다.
  - 플렉스를 사용할 때는 자식 박스에 적용하지 않는다. 오직 부모 클래스에만 적용하면 된다.
  - 부모 클래스를 플렉스 컨테이너로 만들고 자식 박스에게는 명령할 필요 없이 부모 클래스한테 한 번 명령하면 된다.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Flex</title>
    <style>
      .parents {
        display: flex;
      }
      .box {
        background-color: red;
        height: 200px;
        width: 200px;
      }
    </style>
  </head>
  <body>
    <div class="parents">
      <div class="box"></div>
      <div class="box"></div>
      <div class="box"></div>
    </div>
  </body>
</html>
```

- 자식 박스들에게 인라인-블록을 적용하지 않고 부모에게 플렉스를 적용시키니 인라인-블록을 적용한 것처럼 박스들이 옆으로 붙는다.

```html
<style>
  html,
  body {
    height: 100%;
  }
  .parents {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    flex-direction: column;
  }
  .box {
    background-color: red;
    height: 200px;
    width: 200px;
  }
</style>
```

- 플렉스 속성

  - justify-content: center; 라고 작성하니 가운데로 이동한다. 수평.
  - align-item 수직
  - flex-direction의 디폴트는 row이다.
  - flex-direction이 column이 되면 justify-content는 수직이 되고, 반대로 align-item은 수평이 된다. 여기서 align-item을 center라고 쓰면 수평적으로 적용되어 가운데 정렬한다.
  - 요약하면 justify는 수평, align은 수직인데 디폴트 row인 flex-direction을 column으로 설정하면 justify가 수직, align은 수평이 된다는 말이다.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Flex</title>
    <style>
      html,
      body {
        height: 100%;
      }
      .parents {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-direction: row-reverse;
        flex-wrap: wrap;
        height: 100%;
      }
      .box {
        background-color: red;
        height: 200px;
        width: 200px;
        border: black;
        border-style: solid;
        border-width: 1px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="parents">
      <div class="box">1</div>
      <div class="box">2</div>
      <div class="box">3</div>
      <div class="box">4</div>
      <div class="box">5</div>
      <div class="box">6</div>
      <div class="box">7</div>
      <div class="box">8</div>
      <div class="box">9</div>
      <div class="box">10</div>
    </div>
  </body>
</html>
```

- 플렉스 컨테이너이므로 박스 width가 줄어든 것을 확인할 수 있다. 창을 줄여도 그 창에 맞춰서 폭이 조정된다.
- flex-wrap: warp; 속성을 사용하면 폭은 같고 밑으로 워프시킬 수 있다. 디폴트는 no-warp
- 자식 박스도 플렉스로 선언하고 숫자를 넣는다. 부모 flex-direction을 row-reverse라고 선언하면 10부터 1까지 나온다. column-reverse는 수직으로 10 ~ 1 순으로 박스를 나열한다.

- 결론
  - 플렉스 어렵다.
  - 이것저것 시도하면서 공부하자.
  - [개구리 플렉스 링크](http://flexboxfroggy.com/#ko)

## Selector

- 가상 셀렉터
  - 셀렉터인데 element가 아닌 것

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Selectors</title>
    <style>
      input[type="submit"] {
        background-color: red;
      }
      input[type="password"] {
        background-color: blue;
      }

      input[required="required"] {
        background-color: palegreen;
      }
      input {
        border: 1px solid yellow;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box"></div>
      <div class="box"></div>
      <div class="box">
        <input type="password" />
        <input type="submit" />
        <input required="required" />
      </div>
    </div>
  </body>
</html>
```

```html
<style>
  .box:last-child{
    blabla..
  }
  .fist-child, .nth-child(2) // 2번째 자식
  .nth-child(2n) { // 2의 배수 위치한 자식에게 스타일 적용
    asdfasdfasd
  }
</style>
```

- class, id를 쓰지 않고 선택하는 방법이 있다는 것. 이게 pseudo-selector(가상 셀렉터)이다.

- attribu.te를 쓰거나, 순서를 쓰거나, 직계 관계를 불러내거나 .. 등등 많다

```html
<style>
  input + box { // 서로 형제다
    asdfasdf
  }

  input > box { // direct child 직계

  }
</style>
```

## CSS State

- 요소검사 > .hov에서 state를 볼 수 있다. 개발자 도구에서 눌러서 확인 가능

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=f, initial-scale=1.0" />
    <title>css state</title>
    <style>
      .box {
        background-color: red;
        font-size: 40px;
      }
      .box:hover {
        background-color: pink;
      }
      .box:active {
        background-color: green;
      }
      .box:focus {
        background-color: blue;
      }
    </style>
  </head>
  <body>
    <textarea class="box">lalalalala</textarea>
  </body>
</html>
```

## CSS 요약

- css-html 연결
- 박스모델(마진, 패딩)
- 포지션(static, fixed, relative, absolute)
- 디스플레이(블록, 인라인-블록, 인라인)
- 플렉스 박스
- 가상 셀렉터(type, nth child..)
- element status(hover, active, focus, visited)
