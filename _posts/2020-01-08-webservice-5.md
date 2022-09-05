---
title: "springboot & AWS - EC2 배포"
date: 2020-01-08 13:49:00 -0400
categories: spring
---

EC2 서버에 프로젝트를 배포해 보자

### 목차
[1. EC2에 프로젝트 배포](#1-ec2에-프로젝트-배포)<br>
[1.1 EC2에 프로젝트 Clone 받기](#11-ec2에-프로젝트-clone-받기)<br>
[1.2 배포 스크립트 만들기](#12-배포-스크립트-만들기)<br>
[1.3 외부 Security 파일 등록하기](#13-외부-security-파일-등록하기)<br>
[1.4 스프링 부트 프로젝트로 RDS 접근하기](#14-스프링-부트-프로젝트로-rds-접근하기)<br>
[1.5 EC2에서 소셜 로그인 하기](#15-ec2에서-소셜-로그인-하기)<br>

## 1. EC2에 프로젝트 배포
스프링부트로 서비스 코드를 개발했고, 배포 환경을 구성했으니 이들을 조합해 실제로 서비스를 한 번 배포하겠다.

### 1.1 EC2에 프로젝트 Clone 받기
- 깃헙에서 코드를 받을 수 있게 EC2에 깃을 설치한다.
    - sudo yum install git
- git 설치상태 확인
    - git --version
- 깃이 성공적으로 설치되면, git clone으로 프로젝트를 저장할 디렉토리 생성
    - mkdir ~/app && mkdir ~/app/step1
- 생성된 디렉토리로 이동
    - cd ~/app/step1
- 프로젝트 깃헙 웹페이지에서 https 주소 복사
- 복사한 https 주소를 통해 git clone을 진행
    - git clone '복사한 주소'
- 파일들이 잘 복사되었는지 확인
    - cd '프로젝트 명'
    - ll
- 코드들이 잘 수행되는지 테스트
    - ./gradlew test
    - 나는 실패함
- 테스트가 실패해서 수정하고 깃허브에 푸시를 했다면 프로젝트 폴더 안에서 
    - git pull
만약 gradlew 실행 권한이 없다는 메시지가 뜨면
    - chmod +x ./gradlew
- EC2에 gradle을 설치하지 않았는데 gradle task를 수행할 수 있는 이유는 프로젝트 내부에 포함된 gradlew 파일 때문이다. 해당 프로젝트에 한해서 gradle을 쓸 수 있도록 지원하는 wrapper 파일이다.

### 1.2 배포 스크립트 만들기
배포는 작성한 코드를 실제 서버에 반영하는 것을 말한다. 여기서는
    - git clone 혹은 git pull을 통해 새 버전의 프로젝트 받음
    - Gradle이나 Maven을 통해 프로젝트 테스트와 빌드
    - EC2 서버에서 해당 프로젝트 실행 및 재실행

배포할 때마다 개발자가 하나하나 명령어를 실행하는 것은 불편하므로 이를 쉘 스크립트로 작성해 스크립트만 실행하면 앞의 작업이 차례로 진행되도록 하겠다.

쉘 스크립트와 vim은 서로 다른 역할을 한다. 쉘 스크립트는 .sh라는 파일 확장자를 가진 파일이다. 쉘 스크립트 역시 리눅스에서 기본적으로 사용할 수 있는 스크립트파일의 한 종류이다.

vim(빔)은 리눅스 환경과 같이 GUI가 아닌 환경에서 사용하는 편집 도구다. 리눅스에서는 빔 이외에도 이맥스, 나노등의 도구를 지원하나 가장 대중적인 도구가 빔이므로 빔으로 진행한다.

~/app/step1에 depoly.sh 파일을 하나 생성한다.
 - vim ~/app/step1/deploy.sh

 ```bash
 #!/bin/bash

REPOSITORY=/home/ec2-user/app/step1
PROJECT_NAME=springboot-webservice

cd $REPOSITORY/$PROJECT_NAME/

echo "> Git Pull"

git pull

echo "> 프로젝트Build 시작"

./gradlew build

echo "> step1 디렉토리로 이동"

cd $REPOSITORY

echo "> Build 파일 복사"

cp $REPOSITORY/$PROJECT_NAME/build/libs/*.jar $REPOSITORY/

echo "> 현재 구동중인 애플리케이션 pid 확인"

CURRENT_PID=$(pgrep -f ${PROJECT_NAME}*.jar)

echo "> 현재 구동 중인 애플리케이션 pid: $CURRENT_PID"

if [ -z "$CURRENT_PID" ]; then
    echo "> 현재 구동 중인 애플리케이션이 없으므로 종료하지 않습니다."
else
    echo "> kill -15 $CURRENT_PID"
    kill -15 $CURRENT_PID
    sleep 5
fi

echo "> 새 애플리케이션 배포"

JAR_NAME=$(ls -tr $REPOSITORY/ | grep *.jar | tail -n 1)

echo "> JAR Name: $JAR_NAME"

nohup java -jar $REPOSITORY/$JAR_NAME 2>&1 &
 ```

 - REPOSITORY=/home/ec2-user/app/step1
    - 프로젝트 디렉토리 주소는 스크립트에서 자주 사용하여 변수로 등록
    - 쉘에서는 타입 없이 저장하며 '$변수명'으로 변수를 사용할 수 있다.
- cd $REPOSITORY/$PROJECT_NAME/
    - 제일 처음 git clone 받았던 디렉토리로 이동
- git pull 
    - 디렉토리 이동 후, master 브랜치의 최신 내용을 받는다.
- ./gradlew build
    - 프로젝트 내부의 gradlew로 build를 수행한다.
- cp $REPOSITORY/$PROJECT_NAME/build/libs/*.jar $REPOSITORY/
    - 빌드된 jar 파일들 복사
- CURRENT_PID=$(pgrep -f ${PROJECT_NAME}*.jar)
    - pid 찾기. -f 옵션은 프로세스 이름으로 찾는다.
- if ~ else ~ fi
    - 현재 구동 중이 프로세스가 있는지 없는지를 판단해서 기능을 수행한다.
    - 구동 중인 프로세스가 있으면 해당 프로세스를 종료한다.
- JAR_NAME=$(ls -tr $REPOSITORY/ | grep *.jar | tail -n 1)
    - 새로 실행할 jar 파일을 찾는다.
    - 여러 jar 파일이 생기므로 tail -n로 가장 나중의 jar 파일(최신 파일)을 변수에 저장한다.
- nohup java -jar $REPOSITORY/$JAR_NAME 2>&1 &
    - 찾은 jar 파일명으로 해당 jar 파일을 nohub으로 실행한다.
    - 스프링부트의 장점. 외장 톰캣 필요 없이 jar파일만으로 웹 애플리케이션 서버를 실행할 수 있다.
    - 터미널 종료해도 애플리케이션은 계속 구동할 수 있도록 nohup 명령어를 사용한다.


### 1.3 외부 Security 파일 등록하기
위의 쉘 스크립트 애플리케이션을 실행하면 실패한다. ClientRegistrationRepository를 생성하려면 clientId와 clientSecret이 필요하기 때문이다. application-oauth.properties가 .gitignore로 제외 되었기 때문이다.

app 디렉토리에 properties 파일을 생성하고 로컬 application-oauth.properties의 내용을 복사한다.

그리고 나서 deploy.sh 파일을 수정한다.

```bash
nohup java -jar \
        -Dspring.config.location=classpath:/application.properties,/home/ec2-user/app/application-oauth.properties \
        $REPOSITORY/$JAR_NAME 2>&1 &
```
- -Dspring.config.location
    - 스프링 설정 파일 위치를 지정한다.
    - 기본 옵션을 담고 있는 application.properties와 OAuth 설정들을 담고 있는 application-oauth.properties의 위치를 지정한다.
    - classpath가 붙으면 jar 안에 있는 resources 디렉토리를 기준으로 경로가 생성된다.
    - application-oauth.properties는 외부에 있으므로, 절대경로를 사용한다.

### 1.4 스프링 부트 프로젝트로 RDS 접근하기
Maria DB에서 스프링부트 프로젝트를 실행하기 위해선 몇 가지 작업이 필요하다.

1. 테이블 생성
    - H2에서 자동 생성해주던 테이블들을 MariaDB에선 직접 쿼리를 이용해 생성한다.
2. 프로젝트 설정
    - 자바 프로젝트가 MariaDB에 접근하려면 데이터베이스 드라이버가 필요하다.
3. EC2(리눅스 서버) 설정
    - 프로젝트 안에 접속정보를 가지고 있다면 깃허브와 같이 오픈된 공간에서는 누구나 해킹할 위험이 있다. EC2 서버 내부에서 접속 정보를 관리하도록 설정한다.

- RDS 테이블 생성
    - 테스트 코드를 수행 시 생성되는 로그로 쿼리를 사용한다.
        - create table posts (id bigint not null auto_increment, created_date datetime, modified_date datetime, author varchar(255), content TEXT not null, title varchar(500) not null, primary key (id)) engine=InnoDB;
        - create table user (id bigint not null auto_increment, created_date datetime, modified_date datetime, email varchar(255) not null, name varchar(255) not null, picture varchar(255), role varchar(255) not null, primary key (id)) engine=InnoDB;
    - schema-mysql.sql 파일을 검색해서 스프링 세션 테이블 쿼리를 찾아 사용한다.
- 프로젝트 설정
    - MariaDB 드라이버를 build.gradle에 등록
        - compile('org.mariadb.jdbc:mariadb-java-client')
    - application-real.properties 파일 추가
        - profile=real인 환경을 구성한다.
        - 실제 운영될 환경이기 때문에 보안/로그상 이슈가 될 만한 설정들을 모두 제거하며 RDS환경 profile 설정이 추가된다.
- EC2 설정
    - OAuth와 마찬가지로 RDS 접속 정보도 보호해야 할 정보이니 EC2 서버에 직접 설정 파일을 둔다.
    - app 디렉토리에 application-real.properties 파일을 생성한다.
        - vim ~/app/application-real-db.properties
```properties
spring.jpa.hibernate.ddl-auto=none
spring.datasource.url=rds주소:포트명/db명
spring.datasource.username=db계정
spring.datasource.password=db계정 비밀번호
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
```

deploy.sh 수정
```bash
nohup java -jar \
        -Dspring.config.location=classpath:/application.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties \
        -Dspring.profiles.active=real \
        $REPOSITORY/$JAR_NAME 2>&1 &
```
- -Dspring.profiles.active=real
    - application-real.properties를 활성화 시킨다.
    - applicqtion-real.proeprties의 spring.profiles.include-oauth, real-db 옵션 때문에 real-db 역시 함께 활성화 대상에 포함 된다.

- 이후 ./deploy.sh 실행해서 에러가 없고, curl localhost:8080 명령어로 html코드가 보이면 정상적으로 성공한 것이다.

### 1.5 EC2에서 소셜 로그인 하기
curl 명령이를 통해 EC2 서비스가 잘 배포된 것은 확인했다.

- AWS 보안 그룹 변경
    - 스프링 부트 프로젝트가 8080포트에 배포되었으니, 8080포트가 보안 그룹에 열려 있는지 확인한다.
    - 사용자지정  TCP  8080  0.0.0.0/0, ::/0
- AWS EC2 도메인으로 접속
    - 인스턴스의 상세정보에서 퍼블릭 DNS를 확인할 수 있다. 이 주소가 EC2에 자동으로 할당된 도메인이고 이 주소를 입력해 EC2 서버에 접근할 수 있다. 뒤에 8080포트를 붙이면 접속에 성공한다.
    - 구글, 네이버 로그인이 되지 않는데 해당 서비스에 EC2의 도메인을 입력하지 않았기 때문이다.
- 구글에 EC2 주소 등록
    - 구글 웹 콘솔 > API 및 서비스 > OAuth 동의화면 > 앱 수정 > 승인된 도메인에 AWS EC2 퍼블릭 도메인 입력 후 저장
    - 구글 웹 콘솔 > 사용자 인증 정보 > 애플리케이션 선택 > 승인된 리다이렉션 URL에 AWS EC2 퍼블릭 도메인:8080:login/oauth2/code/google 입력
- 네이버에 EC2 주소 등록
    - 네이버 개발자 센터 접속 > 본인의 프로젝트 선택 > API 설정 탭 선택 > 서비스 URL, Callback URL 2개를 수정한다.
    - 서비스 URL
        - 로그인을 시도하는 서비스가 네이버에 등록된 서비스인지 판단하기 위한 항목이다.
        - 8080 포트는 제외하고 실제 도메인 주소만 입력한다.
        - 네이버에서 아직 지원하지 않아 하나만 등록 가능하다.
        - EC2 주소를 등록하면 localhost가 안 되므로 개발 단계에서는 등록하지 않는 것을 추천하다.
        - localhost도 테스트하고 싶으면 네이버 서비스를 하나 더 생성해서 키를 발급 받는다.
    - Callback URL
        - 전체 주소를 등록한다(EC2 퍼블릭 DNS:8080/login/oauth2/code/naver)


스프링 부트 프로젝트를 EC2에 배포했다. 현재 방식은 몇 가지 문제가 있다.
- 수동실행되는 테스트
    - 본인이 짠 코드가 다른 개발자의 코드에 영향을 끼치지 않는지 확인하기 위해 전체 테스트를 수행해야 한다.
    - 현재 상테에선 항상 개발자가 작업을 진행할 때마다 수동으로 전체 테스트를 수행해야만 한다.
- 수동 Build
    - 다른 사람이 작성한 브랜치와 본인이 작성한 브랜치가 합쳐졌을 때(Merge) 이상이 없는지는 Build를 수행해야만 알 수 있다.
    - 이를 매번 개발자가 직접 실행해봐야만 한다.