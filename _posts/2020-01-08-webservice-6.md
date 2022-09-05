---
title: "springboot & AWS - Travis CI 배포 자동화"
date: 2020-01-11 10:03:00 -0400
categories: spring
---

코드가 푸쉬되면 자동으로 배포해 보자

### 목차
[1. Travis CI 배포 자동화](#1-travis-ci-배포-자동화)<br>
[1.1 CI & CD 소개](#11-ci-&-cd-소개)<br>
[1.2 Travis CI 연동하기](#12-travis-ci-연동하기)<br>
[1.3 Travis CI와 AWS S3 연동하기](#13-travis-ci와-aws-s3-연동하기)<br>
[1.4 Travis CI와 AWS S3 CodeDeploy 연동하기](#14-travis-ci와-aws-s3-codedeploy-연동하기)<br>
[1.5 배포 자동화 구성](#15-배포-자동화-구성)<br>
[1.6 CodeDeploy 로그 확인](#16-codedeploy-로그-확인)<br>

## 1. Travis CI 배포 자동화
여러 개발자의 코드가 실시간으로 병합되고, 테스트가 수행되는 환경, master 브랜치가 푸시되면 배포가 자동으로 이루어지는 환경을 구축하지 않으면 실수할 여지가 너무나 많다. 지속 가능한 통합 환경을 구축하고 배포해야 한다.

### 1.1 CI & CD 소개
CI(Continuous Integration - 지속적 통합) : VCS 시스템에 PUSH가 되면 자동으로 테스트와 빌드가 수행되어 안정적인 배포 파일을 만드는 과정

CD(Continuous Deployment - 지속적인 배포) : 빌드 결과를 자동으로 운영 서버에 무중단 배포까지 진행되는 과정

일반적으로 CI만 구축되어 있지는 않고, CD도 함께 구축된 경우가 대부분이다.

하나의 프로젝트를 여러 개발자가 개발하게되는데 예전에는 각자가 개발한 코드를 매주 병합일을 정해서 각자 개발한 코드를 합치기만 했다. 이런 수작업은 생산성이 좋지 않기 때문에 개발자들은 지속 가능한 통합 환경(CI)를 구축했다.

여기서 주의할 점은 단순히 CI 도구를 도입했다고 해서 CI를 하고 있는 것은 아니다. CI에 대하 4가지 규칙이 있다.
- 모든 소스 코드가 살이 있고(현재 실행되고) 누구든 현재의 소스에 접근할 수 있는 단일 지점을 유지할 것
- 빌드 프로세스를 자동화해서 누구든 소스로부터 시스템을 빌드하는 단일 명령어를 사용할 수 있게 할 것
- 테스팅을 자동화해서 단일 명령어로 언제든지 시스템에 대한 건전한 테스트 수트를 실행할 수 있게 할 것
- 누구나 현재 실행 파일을 얻으면 지금까지 가장 완전한 실행 파일을 얻었다는 확신을 하게 할 것

여기서 특히나 중요한 것은 테스팅 자동화다. 지속적으로 통합하기 위해서는 무엇보다 이 프로젝트가 완전한 상태임을 보장하기 위해 테스트 코드가 구현되어 있어야만 한다.

### 1.2 Travis CI 연동하기
Travis CI는 깃헙에서 제공하는 무료 CI 서비스다. 젠킨스는 설치형이기 때문에 이를 위한 EC2 인스턴스 하나가 더 필요하다. AWS에서 CI 도구로 CodeBuild를 제공하는데 빌드 시간만큼 요금이 발생한다.

- Travis CI 웹 서비스 설정
    - Travis 사이트에서 깃헙로그인
    - 계정명 > setting
    - 저장소를 찾고, 오른쪽 상태바를 활성화
    - 활성화한 저장소를 클릭하면 저장소 빌드 히스토리 페이지로 이동
- 프로젝트 설정
    - Travis CI의 상세한 설정은 프로젝트의 .travis.yml 파일로 할 수 있다.
        - YAML(야믈)은 쉽게 말해 JSON에서 괄호를 제거한 것이다. 기계에서 파싱하기 쉽게, 사람이 다루기 쉽게.
    - 프로젝트의 build.gradle과 같은 위치에 .travis.yml을 생성한다.
        ```properties
        language: java
        jdk:
        - openjdk8

        branches:
        only:
            - master

        # Travis CI 서버의 Home
        cache:
        directories:
            - '$HOME/.m2/repository'
            - '$HOME/.gradle'

        script: "./gradlew clean build"

        # CI 실행 완료 시 메일로 알람
        notifications:
        email:
            recipients:
            - 본인 메일 주소
        ```
        - branches
            - Travis CI를 어느 브랜치가 푸시될 때 수행할지 지정
            - 현재 옵션은 오직 master 브랜치에 push될 때만 수행한다.
        - cache
            - 그레이들을 통해 의존성을 받게 되면 이를 해당 디렉토리에 캐시하여, 같은 의존성은 다음 배포 때부터 다시 받지 않도록 설정한다.
        - notifications
            - Travis CI 실행 완료 시 자동으로 알람이 가다록 설정한다.

### 1.3 Travis CI와 AWS S3 연동하기
S3란 AWS에서 제공하는 일종의 파일 서버다. 이미지 파일 등과 같은 정적 파일들을 관리하거나 배포 파일들을 관리하는 등의 기능을 지원한다. 보통 이미지 업로드를 구현한다면 이 S3를 이용하여 구현하는 경우가 많다.

첫 번째 단계로 Travis CI와 S3를 연동한다. 실제 배포는 AWS CodeDeploy라는 서비스를 이용한다. S3 연동이 먼저 필요한 이유는 Jar 파일을 전달하기 위해서다. CodeDeploy는 저장 기능이 없어서 S3를 이용한다.

CodeDeploy가 빌드도 하고 배포도 할 수 있으나 빌드 없이 배포만 할 때 대응이 어렵다. 웬만하면 빌드와 배포는 분리하는 것이 좋다.

- AWS Key발급
    - 일반적으로 AWS에 외부 서비스가 접근하려면 권한을 가진 Key가 필요하며, 이러한 인증과 관련된 기능을 제공하는 서비르로 IAM(Identity and Access Management)가 있다.
    - IAM는 AWS에서 제공하는 서비스의 접근 방식과 권한을 관리한다.
    - AWS웹 콘솔에서 IAM을 검색하여 이동, IAM 페이지 왼쪽 사이드바에서 '사용자 -> 사용자 추가' 버튼을 차례로 클릭
    - 사용자 이름 입력, 엑세스 유형을 프로그래밍 방식 엑세스로 선택
    - 권한 설정 방식은 '기존 정책 직접 연결'로 선택
    - 정책 검색 화면에서 s3full로 검색하여 체크, codedeployf 검색하여 체크
    - 태그 등록시 키 Name, 값은 인지 가능한 정도의 이름을 선택
    - 최종 생성 완료되면 엑세스 키와 비밀 엑세스 키가 생성된다. 이 두 값은 Travis에서 사용될 키다.

- Travis Ci에 키 등록
    - TravisCI의 설정화면에서 Environment Variables항목에 아까 발급된 키를 등록한다.
    - Name은 .Travis.yml에서 사용될 이름이므로 잘 지어야 한다.
    - AWS_ACCESS_KEY, AWS_SECRET_KEY로 등록했다. yml에서는 $AWS_ACCESS_KEY 변수명으로 사용된다.

- S3 버킷 생성
    - AWS의 S3서비스는 일종의 파일 서버이다. 순수하게 파일을 저장하고 접근 권한을 관리, 검색 등을 지원하는 파일 서버의 역할을 한다. 보통 게시글을 쓸 때 나오는 첨부파일 등록을 구현할 때 많이 이용한다. 여기서는 Travis CI에서 생성된 Build 파일을 저장하도록 구성하겠다.
    - AWS 서비스에서 S3를 검색하여 이동하고 버킷을 생성한다.
    - 버킷명은 이 버킷에 배포할 Zip 파일이 모여있는 장소임을 의미하도록 짓는 것을 추천한다.
    - 버전관리는 별다른 설정을 하지 않고 넘어간다.
    - 보안과 권한 설정 부분은 '모든 퍼블릭 엑세스 차단'만 체크한다.

- .travis.yml 추가
    ```properties
    ...

    before_deploy:
  - zip -r springboot-webservice *
  - mkdir -p deploy
  - mv springboot-webservice.zip deploy/springboot-webservice.zip

    deploy:
    - provider: s3
        access_key_id: $AWS_ACCESS_KEY # Travis repo setting에 설정된 값
        secret_access_key: $AWS_SECRET_KEY # Travis repo setting에 설정된 값
        bucket: webservice-build # s3 버킷
        region: ap-northeast-2
        skip_cleanup: true
        acl: private # zip 파일 접근을 private으로
        local_dir: deploy # before_deploy에서 생성한 디렉토리
        wait-until-deployed: true

    ...
    ```

    - before_deploy:
        - deploy 명령어가 실행되기 전에 수행된다.
        - CodeDeploy는 Jar파일을 인식 못 하므로 Jar+ 기타 설정 파일들을 모아 압축한다.
    - mkdir -p deploy
        - deploy 라는 디렉토리를 Travis Ci 실행 중인 위치에서 생성한다.
    - deploy
        - S3로 파일 업로드 혹은 CodeDeploy로 배포 등 외부 서비스와 연동될 행위들을 선언한다.
    - local_dir deploy
        - 앞에서 생성한 deploy 디렉토리를 지정한다.
        - 해당 위치의 파일들만 S3로 전송한다.

### 1.4 Travis CI와 AWS S3 CodeDeploy 연동하기

- EC2에 IAM 역할 추가하기
    - IAM을 검색하고 역할 탭에서 역할만들기 버튼을 선택한다.
        - 역할 : AWS 서비스에서만 할당할 수 있는 권한 (예, EC2, CodeDeploy 등)
        - 사용자 : AWS 서비스 외에 사용할 수 있는 권한 (에, 로컬 PC, IDC 서버 등)
    - 서비스 선택에서 AWS서비스 EC2를 선택한다.
    - 정책에서는 EC2RoleForA를 검색해 AmazonEC2RoleforAWS-CodeDeploy를 선택한다.
    - 태그는 원하는 이름을 짓는다.
    - 역할의 이름을 등록하고 나머지 등록 정보를 최종적으로 확인한다.
    - EC2 인스턴스 목록으로 이동한 뒤, 인스턴스를 마우스 오른쪽으로 클릭하고 인스턴스 설정 > IAM 역할 연결/바꾸기 를 차례로 선택한다. 방금 생성한 역할을 선택한다.
    - 역할 선택이 완료되면 해당 EC2 인스텀스를 재부팅한다.

- CodeDeploy 에이전트 설치
    - EC2에 접속하여 다음 명령어를 입력한다.
        - aws s3 cp s3:aws-codedeploy-ap-northeast-2/latest/install . -- region ap-northeast-2
        - install 파일을 내려 받는다.
    - 파일 실행권한 추가
        - chmod +x ./install
    - install 파일로 설치를 진행
        - sudo ./install auto
    - 설치가 끝나면 Agent가 정상적으로 실행되는지 상태 검사
        - sudo service codedeploy-agent status
        - running 메시지가 출력되면 정상이다.
        - ruby 관련 에러가 발생하면 루비를 설치한다.
            - sudo yum install ruby

- CodeDeploy를 위한 권한 생성
    - CodeDeploy에서 EC2에 접근하려면 마찬가지로 권한이 필요하다.
    - AWS서비스 > CodeDeploy를 선택한다.
    - 권한이 하나 뿐이라 바로 다음으로 이동
    - 태그는 원하는 이름으로 짓는다. (예: codedeploy-role)
    - 생성완료한다.

- CodeDeploy 생성
    - CodeDeploy는 AWS의 배포 삼형제 중 하나다.
        - Code Commit
            - 깃헙과 같은 코드 저장소의 역할을 한다.
            - 프라이빗 기능을 지원한다는 강점이 있으나 현재 깃헙에서 무료로 프라이빗 지원을 하므로 거의 사용 안 함.
        - Code Build
            - Travis CI와 마찬가지로 빌드용 서비스이다.
            - 규모가 있는 서비스에서는 젠킨스/팀시티 등을 이용하므로 거의 사용 안 함.
        - CodeDeploy
            - AWS의 배포 서비스이다.
            - 대체제가 없다.
            - 오토 스케일링 그룹 배포, 블루 그린 배포, 롤링 배포, EC2 단독 배포 등 많은 기능을 지원한다.
        - CodeDeploy 서비스로 이동해서 애플리케이션 생성 버튼을 누른다.
        - 이름을 입력하고 컴퓨팅 플랫폼은 EC2/온프레미스를 선택한다.
        - 배포 그룹 생성 버튼을 누른다.
        - 배포 그룹 이름과 서비스 역할을 등록한다. 서비스 역할은 아까 생성한 CodeDeploy용 IAM역할을 선택한다.
        - 배포 유형은 현재위치 선택힌다.
        - 환경 구성은 Amazon EC2 인스턴스에 체크한다.
        - 배포 설정의 배포 구성은 CodeDeployDefalt.AllAtOnce, 로드 밸런서는 체크 해체한다.
    
- Travis CI, S3, CodeDeploy 연동
    - S3에서 넘겨줄 zip파일을 저장할 디렉토리 생성
        - mkdir ~/app/step2 && mkdir ~/app/step2/zip
    - Travis CI의 Build가 끝나면 S3에 zip파일이 전송되고, 이 zip파일은 /home/ec2-user/app/step2/zip으로 복사되어 압축을 풀 예정이다.
    - Travis CI의 설정은 .travis.yml로 진행하고, AWS CodeDeploy의 설정은 appspec.yml로 진행한다.
```properties
version: 0.0
os: linux
files:
    - source:  /
        destination: /home/ec2-user/app/step2/zip/
        overwrite: yes
```
- version: 0.0
    - CodeDeploy 버전. 프로젝트 버전 아니므로 0.0 외에 다른 버전 사용시 오류 발생
- source
    - CodeDeploy에서 전달해 준 파일 중 destination으로 이동시킬 대상을 지정한다.
    - 루트경로(/)를 지정하면 전체 파일을 이야기한다.
- destination
    - source에서 지정된 파일을 받은 위치.
    - 이후 Jar를 실행하는 등은 destination에서 옮긴 파일들로 진행된다.
```properties
- deploy :
    ...
    - provider: codedeploy 
    access_key_id: $AWS_ACCESS_KEY 
    secret_access_key: $AWS_SECRET_KEY
    bucket: webservice-build
    key: springboot-webservice.zip
    bundle_type : zip
    application : springboot-webservice
    deployment_group: deployment-group
    region: ap-northeast-2
    wait-until-deployed: true
```

### 1.5 배포 자동화 구성

- deploy.sh 파일 추가
    - 스프링부트 프로젝트 최상위에 scripts 디렉토리를 만들고 deploy.sh 파일을 생성한다.

```bash
#!/bin/bash

REPOSITORY=/home/ec2-user/app/step2
PROJECT_NAME=projcet name

echo "> Build 파일 복사"

cp $REPOSITORY/zip/*.jar $REPOSITORY/

echo "> 현재 구동중인 애플리케이션 pid 확인"

CURRENT_PID=$(pgrep -fl $PROJECT_NAME* | grep jar | awk '{print $1}')

echo "현재 구동중인 어플리케이션 pid: $CURRENT_PID"

if [ -z "$CURRENT_PID" ]; then
    echo "> 현재 구동중인 애플리케이션이 없으므로 종료하지 않습니다."
else
    echo "> kill -15 $CURRENT_PID"
    kill -15 $CURRENT_PID
    sleep 5
fi

echo "> 새 어플리케이션 배포"

JAR_NAME=$(ls -tr $REPOSITORY/*.jar | tail -n 1)

echo "> JAR Name: $JAR_NAME"

echo "> $JAR_NAME 에 실행권한 추가"

chmod +x $JAR_NAME

echo "> $JAR_NAME 실행"

nohup java -jar \
    -Dspring.config.location=classpath:/application.properties,classpath:/application-real.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties \
    -Dspring.profiles.active=real \
    $JAR_NAME > $REPOSITORY/nohup.out 2>&1 &
```
- chmod +x $JAR_NAME
    - Jar 파일은 실행 권한이 없는 상태. nohup으로 실행할 수 있게 실행 권한을 부여한다.
- JAR_NAME=$(ls -tr $REPOSITORY/*.jar | tail -n 1)
    - nohup 실행 시 CodeDeploy는 무한 대기한다.
    - 이 이슈를 해결하기 위해 nohup.out 파일을 표준 입출력용으로 별도로 사용한다.
    - 이렇게 하지 않으면 nohup.out 파일이 생기지 않고, CodeDeploy 로그에 표준 입출력이 출력된다.
    - nohup이 끝나기 전까지 CodeDeploy도 끝나지 않으니 꼭 이렇게 해야만 한다.

- .travis.yml 파일 수정
    - 현재는 프로젝트의 모든 파일을 zip 파일로 만드는데, 실제로 필요한 파일들은 Jar, appspec.yml, 배포를 위한 스크립트들이다.
    - .travis.yml 파일의 before_deploy를 수정한다.

```properties
before_deploy:
  - mkdir -p before-deploy # zip에 포함시킬 파일들을 담을 디렉토리 생성
  - cp scripts/*.sh before-deploy/
  - cp appspec.yml before-deploy/
  - cp build/libs/*.jar before-deploy/
  - cd before-deploy && zip -r before-deploy * # before-deploy로 이동후 전체 압축
  - cd ../ && mkdir -p deploy # 상위 디렉토리로 이동후 deploy 디렉토리 생성
  - mv before-deploy/before-deploy.zip deploy/seungui-springboot-webservice.zip # deploy로 zip파일 이동
```

    - Travis CI는 S3로 특정 파일만 업로드가 안 된다.
        - 디렉토리 단위로만 업로드 할 수 있기 때문에 deploy 디렉토리는 항상 생성한다.
    - before-deploy에는 zip 파일에 포함시킬 파일들을 저장한다.
    - zip -r 명령어를 통해 before-deploy 디렉토리 전체 파일을 압축한다.

- appspec.yml 파일 수정

```properties
version: 0.0
os: linux
files:
  - source:  /
    destination: /home/ec2-user/app/step2/zip/
    overwrite: yes

permissions:
  - object: /
    pattern: "**"
    owner: ec2-user
    group: ec2-user

hooks:
  ApplicationStart:
    - location: deploy.sh
      timeout: 60
      runas: ec2-user
```

- 실제 배포 과정 체험
    - build.gradle 에서 프로젝트 버전을 변경한다.
        - version '0.0.2-SNAPSHOT'
    - 변경된 내용을 확인 할 수 있게 index.mustache 내용을 수정한다.
    

### 1.6 CodeDeploy 로그 확인
- CodeDeploy 로그는 /opt/codedeploy-agent/deployment-root/deployment.logs 파일에 있다.