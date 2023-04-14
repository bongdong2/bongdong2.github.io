---
title: "인프런 코드팩토리 Dart - Functional Programming"
date: 2023-04-14 16:58:00 -0400
categories: flutter
---

## Functional Programming

```dart
void main() {

  List<String> animals = ['개', '고양이', '말', '소', '호랑이', '호랑이'];
  print(animals); // [개, 고양이, 말, 소, 호랑이, 호랑이]

  // List -> Map
  print(animals.asMap()); // {0: 개, 1: 고양이, 2: 말, 3: 소, 4: 호랑이, 5: 호랑이}

  // List -> Set
  print(animals.toSet()); // {개, 고양이, 말, 소, 호랑이}

  Map animalsMap = animals.asMap();
  print(animalsMap.keys); // (0, 1, 2, 3, 4, 5)
  print(animalsMap.values); // (개, 고양이, 말, 소, 호랑이, 호랑이)
  print(animalsMap.keys.toList()); // [0, 1, 2, 3, 4, 5]
  print(animalsMap.values.toList()); // [개, 고양이, 말, 소, 호랑이, 호랑이]

  // List -> Set
  Set animalsSet = Set.from(animals);
  print(animalsSet); // {개, 고양이, 말, 소, 호랑이}
  print(animalsSet.toList()); // [개, 고양이, 말, 소, 호랑이]
}
```
