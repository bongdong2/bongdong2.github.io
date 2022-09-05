---
title: "ES6 - 1"
date: 2021-08-12 11:10:00 -0400
categories: javascript
---

let, closure

## 1. [클로저](https://developer.mozilla.org/ko/docs/Web/JavaScript/Closures)

### 1.1 클로저 개념

클로저는 자바스크립트의 고유한 개념이 아닌 함수를 일급 객체로 취급하는 함수형 프로그래밍 언어에서 사용되는 중요한 특성이다.

클로저는 함수와 함수가 선언된 어휘적 환경(Lexical Environmnet)의 조합이다. 클로저를 이해하려면 자바스크립트가 어떻게 변수의 유효범위를 지정하는지(Lexical scoping)를 먼저 이해해야 한다.

```javascript
function outerFunc() {
  var x = 999;
  
  function innerFunc() {
    console.log(x);
  }
  
  innerFunc();
}

outerFunc(); // 999
```
외부함수와 내부함수가 있다. 내부함수는 외부함수의 변수 x를 접근해 사용한다.

스코프는 함수를 호출할 때가 아니라 함수를 어디에 선언하였는지에 따라 결정된다. 이를 렉시컬 스코핑(Lexical scoping)라 한다. 위의 함수 innerFunc는 함수 outerFunc의 내부에서 선언되었기 때문에 함수 innerFunc의 상위 스코프는 함수 outerFunc이다. 함수 innerFunc가 전역에 선언되었다면 함수 innerFunc의 상위 스코프는 전역 스코프가 된다.

```javascript
function outerFunc() {
  var x = 123;
  
  var inner = function innerFunc() { console.log(x);}
  return inner;
}

var inner = outerFunc();
inner(); // 123
```

outerFunc 함수는 inner 변수에 할당되어 삶을 마감하는데 inner 변수를 호출하면 outerFunc 내부의 변수 x를 사용한다. 이렇게 라이프사이클이 종료 되었음에도 x를 사용할 수 있다.

이처럼 자신을 포함하고 있는 외부함수보다 내부함수가 더 오래 유지되는 경우, 외부 함수 밖에서 내부함수가 호출되더라도 외부함수의 지역 변수에 접근할 수 있는데 이러한 함수를 **클로저(Closure)**라고 부른다.

함수의 반환이 이미 끝났어도 함수의 내부 변수를 사용하는 내부함수가 존재하는 경우 변수는 계속 메모리에 남아 존재하게 된다. 외부함수에 있는 변수의 복제본이 아니라 실제 변수에 접근한다.

-----
클로저 다른 예
```javascript
function makeAdder(x) {
  var y = 1;
  return function(z) {
    y = 100;
    return x + y + z;
  };
}

var add5 = makeAdder(5);
var add10 = makeAdder(10);
//클로저에 x와 y의 환경이 저장됨

console.log(add5(2));  // 107 (x:5 + y:100 + z:2)
console.log(add10(2)); // 112 (x:10 + y:100 + z:2)
//함수 실행 시 클로저에 저장된 x, y값에 접근하여 값을 계산
```


###  1.2 클로저의 활용

#### 1.2.1 실용적인 클로저
현재 상태를 기억하고 변경된 최신 상태를 유지하는 것이다.

```html
<!DOCTYPE html>
<html>
<body>
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      font-size: 12px;
    }

    h1 {
      font-size: 1.5em;
    }
    h2 {
      font-size: 1.2em;
    }
  </style>
  
  <p>Some paragraph text</p>
  <h1>some heading 1 text</h1>
  <h2>some heading 2 text</h2>

  <a href="#" id="size-12">12</a>
  <a href="#" id="size-14">14</a>
  <a href="#" id="size-16">16</a>

  <script>
    function makeSizer(size) {
      return function() {
        document.body.style.fontSize = size + 'px';
      };
    }

    var size12 = makeSizer(12);
    var size14 = makeSizer(14);
    var size16 = makeSizer(16);

    document.getElementById('size-12').onclick = size12;
    document.getElementById('size-14').onclick = size14;
    document.getElementById('size-16').onclick = size16;
  </script>
</body>
</html>
```

### 1.2.2 private 메소드 흉내내기
자바스크립트는 문법적으로 프라이빗 메소드를 지원하지 않지만 클로저를 사용해서 흉내낼 수 있다.

아래 코드는 프라이빗 함수와 변수에 접근하는 퍼블릭 함수를 정의하기 위해 클로저를 사용하는 방법을 보여준다. 이렇게 클로저를 사용하는 것을 [모듈 패턴](https://www.google.com/search?q=javascript+module+pattern)이라 한다.



```javascript
var counter = (function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  };
})();

console.log(counter.value()); // logs 0
counter.increment();
counter.increment();
console.log(counter.value()); // logs 2
counter.decrement();
console.log(counter.value()); // logs 1
```

### 1.2.3 클로저 스코프 체인
```javascript
// 전역 범위 (global scope)
var e = 10;
function sum(a){
  return function(b){
    return function(c){
      // 외부 함수 범위 (outer functions scope)
      return function(d){
        // 지역 범위 (local scope)
        return a + b + c + d + e;
      }
    }
  }
}

console.log(sum(1)(2)(3)(4)); // log 20

// 익명 함수 없이 작성할 수도 있다.

// 전역 범위 (global scope)
var e = 10;
function sum(a){
  return function sum2(b){
    return function sum3(c){
      // 외부 함수 범위 (outer functions scope)
      return function sum4(d){
        // 지역 범위 (local scope)
        return a + b + c + d + e;
      }
    }
  }
}

var s = sum(1);
var s1 = s(2);
var s2 = s1(3);
var s3 = s2(4);
console.log(s3) //log 20
```

### 1.2.4 루프에서 클로저 생성하기: 일반적인 실수

```html
<p id="help">Helpful notes will appear here</p>
<p>E-mail: <input type="text" id="email" name="email"></p>
<p>Name: <input type="text" id="name" name="name"></p>
<p>Age: <input type="text" id="age" name="age"></p>

<script>
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function setupHelp() {
  var helpText = [
      {'id': 'email', 'help': 'Your e-mail address'},
      {'id': 'name', 'help': 'Your full name'},
      {'id': 'age', 'help': 'Your age (you must be over 16)'}
    ];

  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = function() {
      showHelp(item.help);
    }
  }
}

setupHelp();
</script>
```

onfocus 이벤트에 할당되는 함수가 클로저이다. item 변수는 (세개의 클로저가 공유한다) helpText 리스트의 마지막 요소를 가리키고 있을 것이다.

var 대신 let을 사용하여 모든 클로저가 블록 범위 변수를 바인딩할 것이므로 추가적인 클로저를 사용하지 않아도 완벽하게 동작할 것이다.
```javascript
let item = helpText[i];
```

### 1.2.5 성능 관련 고려 사항
클로저가 필요하지 않는데 다른 함수 내에서 함수를 불필요하게 작성하는 것은 현명하지 않다. 이것은 처리 속도와 메모리 소비 측면에서 스크립트 성능에 부정적인 영향을 미칠 것이다.

예를 들어, 새로운 객체/클래스를 생성 할 때, 메소드는 일반적으로 객체 생성자에 정의되기보다는 객체의 프로토타입에 연결되어야 한다. 그 이유는 생성자가 호출 될 때마다 메서드가 다시 할당되기 때문이다 (즉, 모든 개체가 생성 될 때마다).

```javascript
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}

// 클로저의 이점의 고려하여 다시 작성
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype = {
  getName: function() {
    return this.name;
  },
  getMessage: function() {
    return this.message;
  }
};

// 프로토타입을 다시 정의하는 것은 권장되지 않음으로 기존 프로토타입에 추가하는 예제
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};

// 더 깨끗한 방법
function MyObject(name, message) {
    this.name = name.toString();
    this.message = message.toString();
}
(function() {
    this.getName = function() {
        return this.name;
    };
    this.getMessage = function() {
        return this.message;
    };
}).call(MyObject.prototype);
```