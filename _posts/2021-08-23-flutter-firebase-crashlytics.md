---
title: "플러터앱 Firebase Crashlytics 사용하기"
date: 2021-08-23 16:23:00 -0400
categories: flutter
---

## Firebase Crashlytics ??

앱이 비정상적으로 종료되었을 경우 문제를 추적할 수 있게 해주는 툴이다.

앱버전, 디바이스 OS 버전, 디바이스명, 비정상종료 일시 등을 보여 주며, 오류가 발생했을 때 키, 로그, 데이터를 Clashlytics로 전달할 수 있다.

## SDK 추가하기

파이어베이스 콘솔에서 Android, iOS앱에 각각 Crashlytics SDK를 추가해줘야 한다.

콘솔에서 '출시 및 모니터링' 메뉴의 Crashlytics를 선택한다.

'SDK추가' 버튼을 선택해서 Crashlytics를 활성화 한다.

앱을 비정상적으로 종료시키면 모니터링 화면이 등장한다.

![image](/images/Crashlytics/1.png)

## 플러터 의존성 추가 & 다운로드

pubspec.yaml

```yaml
dependencies:
  firebase_crashlytics: ^2.2.0
```

terminal

```bash
flutter pub get
```

## Android 설정

android/build.gradle

```groovy
dependencies {
  // ... other dependencies
  classpath 'com.google.gms:google-services:4.3.5'
  classpath 'com.google.firebase:firebase-crashlytics-gradle:2.5.1'
}
```

android/app/build.gradle

```groovy
// ... other imports

android {
  // ... 안드로이드 설정
}

dependencies {
  // ... 의존성들
}

// 반드시 파일 최하단에 작성해야 한다.
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.google.firebase.crashlytics'
```

## iOS 설정

xcode Runner 선택

![image](/images/Crashlytics/2.png)

Build Phases탭

'+' 버튼

New Run Script Phase

![image](/images/Crashlytics/3.png)

${PODS_ROOT}/FirebaseCrashlytics/run 입력

![image](/images/Crashlytics/4.png)

## 앱 다시 빌드

terminal

```bash
flutter run
```

## 플러터 프로젝트

```dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
```

```dart
void main() async {
	// ...

	await Firebase.initializeApp();

	// runZonedGuarded : 앱 실행중 강제 종료시 Firebase Crashlytics 보고
  runZonedGuarded(() {
    runApp(new MyApp());
  }, FirebaseCrashlytics.instance.recordError);
}
```

Crashlytics로 데이터를 전송하기 위해서는 반드시 애플리케이션을 재실행해야 합니다.

Crashlytics는 애플리케이션을 실행할 때 자동으로 모든 충돌 리포트를 전송합니다.

## 강제로 Crash 발생 시키기

**crash** 메서드를 사용해서 앱을 강제종료한다.

```dart
FirebaseCrashlytics.instance.crash();
```

## Crash 타입

Fatal crash(치명적 오류)

```dart
await FirebaseCrashlytics.instance.recordError(
  error,
  stackTrace,
  reason: 'a fatal error',
  // Pass in 'fatal' argument
  fatal: true
);
```

Non-Fatal crash(심각하지 않음)

```dart
await FirebaseCrashlytics.instance.recordError(
  error,
  stackTrace,
  reason: 'a non-fatal error'
);
```

## 커스텀 키

**setCustomKey** 메서드를 이용해서 키/값 리포트를 전송할 수 있다.

최대 64개까지 설정가능하다. 그 이상은 무시된다. 1024길이가 초과하는 키 또는 값은 잘린다.

```dart
//string, boolean, int, long, float, double 가능하다.
FirebaseCrashlytics
.instance
.setCustomKey('Exception', 'LoginConfig.dart > getGoogleAccount()');
```

![image](/images/Crashlytics/5.png)

## 커스텀 로그 메시지 추가

**log** 메소드를 사용해서 로그를 전송할 수 있다.

```dart
FirebaseCrashlytics.instance.log("Hello Clashlytics!");
```

![image](/images/Crashlytics/6.png)

## user identifiers 설정

고유한 유저 ID를 리포트에 추가할 수 있다. ID 숫자, 토큰, 해시값이어야 한다.

```dart
FirebaseCrashlytics.instance.setUserIdentifier("[unique-id]");
```

![image](/images/Crashlytics/7.png)
