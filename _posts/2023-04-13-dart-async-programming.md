---
title: "인프런 코드팩토리 Dart - Async Programming"
date: 2023-04-13 09:50:00 -0400
categories: flutter
---

## Async Programming

```dart
import 'dart:async';

void main() {
  final controller = StreamController();
  final stream = controller.stream.asBroadcastStream();

  final streamListener1 = stream.where((val) => val % 2 == 0).listen((val) {
    print('Listener 1 : ${val}');
  });

  final streamListener2 = stream.where((val) => val % 2 == 1).listen((val) {
    print('Listener 2 : ${val}');
  });

  controller.sink.add(1);
  controller.sink.add(2);
  controller.sink.add(3);
  controller.sink.add(4);
  controller.sink.add(5);
  controller.sink.add(6);

  calculate(1).listen((val){
    print('calculate(1): $val');
  });

  calculate(4).listen((val){
    print('calculate(4): $val');
  });
}
```

```dart
void main() {
  calculate(1).listen((val){
    print('calculate(1): $val');
  });

  calculate(4).listen((val){
    print('calculate(4): $val');
  });
}

Stream<int> calculate(int number) async* {
  for (int i = 0; i < 5; i++) {
    yield i * number;
    await Future.delayed(Duration(seconds: 1));
  }
}
```

```dart
void main() {
  playAllCalculate().listen((val){
    print('$val');
  });
}

Stream<int> playAllCalculate() async* {
  yield* calculate(4);
  yield* calculate(100);
}

Stream<int> calculate(int number) async* {
  for (int i = 0; i < 5; i++) {
    yield i * number;

    await Future.delayed(Duration(seconds: 1));
  }
}
```
