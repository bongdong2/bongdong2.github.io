---
title: "인프런 코드팩토리 Dart - Functional Programming"
date: 2023-04-14 16:58:00 -0400
categories: flutter
---

## Functional Programming

### List, Map, Set

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

### map

```dart
void main() {
  List<String> animals = ['개', '고양이', '말', '소', '호랑이'];

  // map
  final newAnimals = animals.map((x) {
    return '친환경 $x';
  });
  print(animals); // [개, 고양이, 말, 소, 호랑이]
  print(newAnimals); // (친환경 개, 친환경 고양이, 친환경 말, 친환경 소, 친환경 호랑이)

  // // 한 줄이면 arrow(=>)사용
  final arrowAnimals = animals.map((x) => '화살 $x');
  print(arrowAnimals); // (화살 개, 화살 고양이, 화살 말, 화살 소, 화살 호랑이)
  print(arrowAnimals.toList()); // [화살 개, 화살 고양이, 화살 말, 화살 소, 화살 호랑이]

  // map을 사용하면 다른 녀석이 되는군
  print(animals == animals); // true
  print(animals == newAnimals); // false
  print(newAnimals == arrowAnimals); // false

  // 문자를 split하고 map으로 순회하면서 '.jpg'를 추가하고 리스트로 반환
  String number = '12345';
  final parsed = number.split('').map((x) => '$x.jpg').toList();
  print(parsed); // [1.jpg, 2.jpg, 3.jpg, 4.jpg, 5.jpg]
}
```

```dart
void main() {
  Map<String, String> mdtb = {
    'CEO' : 'Cho ES',
    'COO' : 'Lee SA',
    'CTO' : 'Jwa SU',
  };

  // MAP의 .map 사용법
  final result = mdtb.map(
    (key, value) => MapEntry(
      'rank $key',
      'name $value',
    ),
  );

  print(mdtb); // {CEO: Cho ES, COO: Lee SA, CTO: Jwa SU}
  print(result); // {rank CEO: name Cho ES, rank COO: name Lee SA, rank CTO: name Jwa SU}

  final keys = mdtb.keys.map((x) => 'mdtb $x').toList();
  final values = mdtb.values.map((x) => 'mdtb $x').toList();
  print(keys); // [mdtb 직급 : CEO, mdtb 직급 : COO, mdtb 직급 : CTO]
  print(values); // [mdtb 인간명 : Cho ES, mdtb 인간명 : Lee SA, mdtb 인간명 : Jwa SU]
}
```

### where

```dart
void main() {
  Set mdtbSet = {
    '조성은',
    '이아상',
    '좌의승',
  };

  final mySet = mdtbSet.map((x) => 'mdtb $x').toSet();
  print(mySet); // {mdtb 조성은, mdtb 이아상, mdtb 좌의승}

  // .where()는 필터링 해주네
  final femail = people.where((x) => x['gender'] == 'F').toList();
  final male = people.where((x) => x['gender'] == 'M').toList();
  print(femail); // [{name: 이아상, gender: F}, {name: 조성은, gender: F}]
  print(male); // [{name: 좌의승, gender: M}]
}
```

### reduce

```dart
void main() {
  List<int> numbers = [1, 3, 5, 7, 9];

  final int result = numbers.reduce((prev, next) {
    print('----------------');
    print('previous : $prev');
    print('next : $next');
    print('total : ${prev + next}');

    // 리턴된 값이 prev로 들어가는군!
    // 1+3, 4+5, 9+7, 16+9
    return prev + next;
  });
  print(result);

  /*
    ----------------
    previous : 1
    next : 3
    total : 4
    ----------------
    previous : 4
    next : 5
    total : 9
    ----------------
    previous : 9
    next : 7
    total : 16
    ----------------
    previous : 16
    next : 9
    total : 25
    25
   */

   // 1 + 3 + 5 + 7 + 9
  final int result = numbers.reduce((prev, next) => prev + next);
  print(result); // 25
}
```

### .fold
```dart
void main() {
   
  List<String> words = ['오징어', '금붕어', '기러기'];
  final sentence = words.reduce((prev, next) => prev + next);
  print(sentence); // 오징어금붕어기러기
  
  List<int> numbers = [1, 3, 5, 7, 9];
  final sum = numbers.fold<int>(0, (prev, next) {
    print('------------');
    print('prev : $prev');
    print('next : $next');
    print('total : $prev + $next');
    return prev + next;
  });
  /*
  ------------
  prev : 0
  next : 1
  total : 0 + 1
  ------------
  prev : 1
  next : 3
  total : 1 + 3
  ------------
  prev : 4
  next : 5
  total : 4 + 5
  ------------
  prev : 9
  next : 7
  total : 9 + 7
  ------------
  prev : 16
  next : 9
  total : 16 + 9
  */
  
  print(sum); // 25
  
  // prev는 int니까 .length 없음
  final wordsLength = words.fold<int>(0, (prev, next) => prev + next.length);
  print(wordsLength); // 9
}
```

### ...(cascading operator)
```dart
void main() {
  List<int> even = [2, 4, 6, 8];
  List<int> odd = [1, 3, 5, 7];
  
  print([...even, ...odd]);  // [2, 4, 6, 8, 1, 3, 5, 7]
  print(even);               // [2, 4, 6, 8]
  print([...even]);          // [2, 4, 6, 8]
  print(even == [...even]);  // false
}
```

### bla bla
```dart
void main() {
  final List<Map<String, String>> people = [
    {
      'name': '봉동이',
      'gender': 'M',
    },
    {
      'name': '은승',
      'gender': 'F',
    },
    {
      'name': '아상',
      'gender': 'F',
    },
  ];

  print(people); // [{name: 봉동이, gender: M}, {name: 은승, gender: F}, {name: 아상, gender: F}]
  final parsedPeople = people
      .map((x) => Person(
            name: x['name']!,
            gender: x['gender']!,
          ))
      .toList();

  print(
      parsedPeople); // toString 메소드 없다면 -> [Instance of 'Person', Instance of 'Person', Instance of 'Person']]

  for (Person person in parsedPeople) {
    print(person.name);
    print(person.gender);
  }

//   봉동이
//   M
//   은승
//   F
//   아상
//   F

  final femele = parsedPeople.where((x) => x.gender == 'F');
  print(femele); // toString 메소드 만든 후 -> (Person(name: 은승, gender: F), Person(name: 아상, gender: F))
}

class Person {
  final String name;
  final String gender;

  Person({
    required this.name,
    required this.gender,
  });
  
  @override
  String toString() {
    return 'Person(name: $name, gender: $gender)';
  }
}
```