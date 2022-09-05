---
title: "springboot & AWS - 무중단 배포"
date: 2020-01-23 13:32:00 -0400
categories: spring
---

24시간 265일 중단 없는 서비스를 만들자

### 목차
[1. 무중단 배포](#1-무중단-배포)<br>
[1.1 무중단 배포 소개](#11-무중단-배포-소개)<br>
[1.2 엔진엑스 설치와 스프링 부트 연동하기](#12-엔진엑스-설치와-스프링-부트-연동하기)<br>
[1.3 무중단 배포 스크립트 만들기](#13-무중단-배포-스크립트-만들기)<br>
[1.4 무중단 배포 테스트](#14-무중단-배포-테스트)<br>

## 1. 무중단 배포
이전 포스트에서 Travis CI를 활용해 배포 자동화 환경은 구축했다. 하지만 배포하는 동안 애플리케이션이 종료되는 문제가 남았다. 새로운 Jar가 실행되기 전 까지는 기존 Jar를 종료시켜 놓기 때문에 서비스가 중단된다. 이번 포스트에는 서비스 중단 없이 배포를 계속학 수 있게 서비스에 적용하겠다.

### 1.1 무중단 배포 소개
서비스를 정지하지 않고 배포하는 것을 무중단 배포라고 한다. 무중단 배포 방식 종류에는 몇 가지가 있다.

- AWS에서 블루 그린(Blue-Green)무중단 배포
- Docker를 이용한 웹서비스 무중단 배포
- L4 스위치
- 엔진엑스(nginx)

여기서는 엔진엑스를 이용한 무중단 배포를 진행한다. 엔진엑스는 웹 서버, 리버스 프록시, 캐싱, 로드 벨런싱, 미디어 스트리밍 등을 위한 오픈소스 소프트웨어이다.

리버스 프록시란 엔진엑스가 외부의 요청을 받아 백엔드 서버로 요청을 전달하는 행위를 말한다. 리버스 프록시 서버(엔진엑스)는 요청을 전달하고, 실제 요청에 대한 처리는 뒷단의 웹 애플리케이션 서버들이 처리한다. 엔진엑스를 이용하는 이유는 가장 저렴하기 때문이다.

기존에 쓰던 EC2에 그대로 적용하면 되므로 배포를 위해 AWS EC2인스턴스가 하나 더 필요하지 않다. 이 방식은 꼭 AWS와 같은 클라우드 인프라가 구축되어 있지 않아도 사용할 수 있는 범용적인 방법이다.

구조는 하나의 EC2 혹은 리눅스 서버에 엔진엑스 1대와 스프링 부트 Jar를 2대 사용하는 것이다.
- 엔진엑스는 80(http), 443(https) 포트를 할당한다.
- 스프링 부트 1은 8081 포트로 실행한다.
- 스프링 부트 2는 8082 포트로 실행한다.

운영과정은 다음과 같다.
- 사용자는 서비스 주소로 접속한다.(80 혹은 443포트)
- 엑진엑스는 사용자의 요청을 받아 현재 연결된 스프링 부트로 요청을 전달한다.
    - 스프링 부트1 즉, 8081포트로 요청을 전달한다고 가정한다.
- 스프링 부트2는 엔진엑스와 연결된 상태가 아니므로 요청받지 못 한다.
- 1.1 버전이 필요하면 엔진엑스와 연결되지 않은 스프링 부트2(8082포트)로 배포한다.

1. 배포하는 동안에도 서비스는 중단 되지 않는다.
    - 엔진엑스가 스프링 부트2을 바라보기 때문이다.
2. 배포가 끝나고 정상적으로 스프링 부트2가 구동 중인지 확인한다.
3. 스프링 부트2가 정상 구동 중이면 nginx reload 명령어를 통해 8081대신 8082를 바라보도록 한다.
4. nginx reload는 0.1초 내에 완료된다.


### 1.2 엔진엑스 설치와 스프링 부트 연동하기

- EC2에 접속해 엔진엑스 설치하기
    - sudo yum install nginx
- 엔진엑스 실행
    - sudo service nginx
- AWS 보안 그룹에 80포트를 추가한다.
- 구글, 네이버 리다이렉션 주소를 추가한다. 기존 퍼블릭 도메인에서 ':8080'포트만 제외한 주소를 하나 추가한다.
- 브라우저에 ':8080'을 뺀 EC2퍼블릭도메인 주소를 입력하여 접속하면 엔직엑스 웹페이지를 볼 수 있다.
- 엔진엑스와 스프링 부트 연동
    - sudo vim etc/nginx/nginx.conf
    - 설정 내용 중 server 아래의 location / 부분을 찾아서 추가한다.
    ```bash
    location / {
         proxy_pass http://localhost:8080;
         proxy_set_header X-Real-IP $remote_addr;
	 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	 proxy_set_header Host $http_host;
     ```
        - proxy_pass : 엔진엑스로 요청이 오면 해당 주소로 전달.
        - proxy_set_header XXX : 실제 요청 데이터를 header의 각 항목에 할당
    - 설정이 끝나면 저장후 종료(:wq)하고 엔진엑스를 재시작한다.
        - sudo service nginx restart
    - 아까 접속한 엔진엑스 페이지를 접속하면 스프맅 부트 웹앱페이지가 정상적으로 나온다.
}

### 1.3 무중단 배포 스크립트 만들기
무중단 배포 스크립트 작업 전에 API를 하나 만든다. 이 API는 이후에 8081포트를 쓸지, 8082 포트를 쓸지 판단하는 기준이 된다.

- ProfileController 추가
```java
@RequiredArgsConstructor
@RestController
public class ProfileController {

    private final Environment environment;

    @GetMapping("/profile")
    public String profile() {
        List<String> profiles = Arrays.asList(environment.getActiveProfiles());
        List<String> realProfiles = Arrays.asList("real", "real1", "real2");
        String defaultProfile = profiles.isEmpty()? "default" : profiles.get(0);

        return profiles.stream()
                .filter(realProfiles::contains)
                .findAny()
                .orElse(defaultProfile);
    }
}
```

- ProfileControllerUnitTest
```java
public class ProfileControllerUnitTest {

    @Test
    public void real_profiles이_조회된다() {
        // given
        String expectedProfile = "real";
        MockEnvironment environment = new MockEnvironment();
        environment.addActiveProfile(expectedProfile);
        environment.addActiveProfile("oauth");
        environment.addActiveProfile("real-db");

        ProfileController controller = new ProfileController(environment);

        // when
        String profile = controller.profile();

        // then
        assertThat(profile).isEqualTo(expectedProfile);
    }

    @Test
    public void real_profile이_없으면_첫_번째가_조회된다() {
        // given
        String expectedProfile = "oauth";
        MockEnvironment environment = new MockEnvironment();

        environment.addActiveProfile(expectedProfile);
        environment.addActiveProfile("real-db");

        ProfileController controller = new ProfileController(environment);

        // when
        String profile = controller.profile();

        // then
        assertThat(profile).isEqualTo(expectedProfile);
    }

    @Test
    public void active_profile이_없으면_default가_조회된다() {
        // given
        String expectedProfile = "default";
        MockEnvironment environment = new MockEnvironment();
        ProfileController controller = new ProfileController(environment);

        // when
        String profile = controller.profile();

        // then
        assertThat(profile).isEqualTo(expectedProfile);
    }

}
```

- ProfileControllerTest
```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ProfileControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void profile은_인증없이_호출된다() throws Exception {

        String expected = "oauth";

        ResponseEntity<String> response = restTemplate.getForEntity("/profile", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(expected);
    }

}
// 책에서는 default인데 oauth가 나온다.
```

- SecurityCofig - "/profile" 추가
```java
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final CustomOauth2UserService customOauth2UserService;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .csrf().disable().headers().frameOptions().disable()
                .and()
                    .authorizeRequests()
                    .antMatchers("/", "/css/**", "/images/**", "/js/**", "/h2-console/**", "/profile").permitAll()
                    .antMatchers("/api/v1/**").hasRole(Role.USER.name())
                    .anyRequest().authenticated()
                .and()
                    .logout()
                        .logoutSuccessUrl("/")
                .and()
                    .oauth2Login()
                        .userInfoEndpoint()
                            .userService(customOauth2UserService);
    }
}
```
- 테스트가 모두 성공했다면 깃헙으로 푸시하여 배포한다. 배포가 끝나면 브라우저에서 /profile로 접속하여 profile이 잘 나오는지 확인한다. (real)

- real1, real2 profile 생성
```properties
# application-real1.properties
server.port=8081
spring.profiles.include=oauth,real-db
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
spring.session.store-type=jdbc

# application-real2.properties
server.port=8082
spring.profiles.include=oauth,real-db
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL5InnoDBDialect
spring.session.store-type=jdbc
```

- 엔진엑스 설정 수정
    - 무중단 배포의 핵심은 엔진엑스 설정이다. 엔진엑스의 프록시 설정(스프링 부트로 요청을 흘러보내는)이 순식간에 교체된다. 프록시 설정이 교체될 수 있게 설정을 추가한다.
    - 엔진엑스의 설정이 모여있는 /etc/nginx/conf.d/ 에 server-url.inc파일을 추가한다.
        - sudo vim /etc/nginx/conf.d/service-url.inc
    - 그리고 다음 코드를 입려하고 저장종료한다.
        - set $service_url http://127.0.0.1:8080;
    - nginx.conf 파일 열기
        - sudo vim /etc/nginx/nginx.conf
    - location 부분 수정하기
        - include /etc/nginx/conf.d/service-url.inc;
        - proxy_pass $service_url;
    - 저장 종료한 뒤 재시작한다.
        - sudo service nginx restart
    - 브라우저에서 확인하고 정상작동하면 엔진엑스 설정까지 완료된 것이다.

- 배포 스크립트들 작성
    - step2 와 중복되지 않게 step3 디렉토리 생성한다.
        - mkdir ~/app/step3 && mkdir ~/app/step3/zip
    - 무중단 배포는 앞으로 step3를 사용할 것이므로 appspec.yml역시 step3로 변경한다.
    ```bash
    version: 0.0
    os: linux
    files:
    - source:  /
        destination: /home/ec2-user/app/step3/zip/
        overwrite: yes

    permissions:
    - object: /
        pattern: "**"
        owner: ec2-user
        group: ec2-user

    hooks:
    AfterInstall:
        - location: stop.sh # nginx와 연결되어 있지 않은 스프링 부트를 종료한다.
        timeout: 60
        runas: ec2-user
    ApplicationStart:
        - location: start.sh # nginx와 연결되어 있지 않은 Port로 새 버전의 스프링 부트를 시작한다.
        timeout: 60
        runas: ec2-user
    ValidateService:
        - location: health.sh # 새 스프링 부트가 정상적으로 실행됐는지 확인한다.
        timeout: 60
        runas: ec2-user
    ```
    - 무중단 배포 스크립트는 총 5개이다.
        - stop.sh : 기존 엔진엑스에 연결되어 있진 않지만, 실행 중이던 스프링 부트 종료.
        - start.sh : 배포할 신규 버전 스프링 부트 프로젝트를 stop.sh로 종료한 'profile'로 실행
        - health.sh : 'start.sh'로 실행시킨 프로젝트가 정상적으로 실행됐는지 체크
        - switch.sh : 엔진엑스가 바라보는 스프링 부트를 최신 버전으로 변경
        - profile.sh : 앞선 4개 스크립트 파일에서 공용르로 사용할 'profile'과 포트 체크 로직
        - 아래에 profile, stop, start, health, switch 순으로 나열한다.

```bash
#!/usr/bin/env bash

# bash는 return value가 안되니 *제일 마지막줄에 echo로 해서 결과 출력*후, 클라이언트에서 값을 사용한다

# 쉬고 있는 profile 찾기: real1이 사용중이면 real2가 쉬고 있고, 반대면 real1이 쉬고 있음
function find_idle_profile()
{
    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/profile)

    if [ ${RESPONSE_CODE} -ge 400 ] # 400 보다 크면 (즉, 40x/50x 에러 모두 포함)
    then
        CURRENT_PROFILE=real2
    else
        CURRENT_PROFILE=$(curl -s http://localhost/profile)
    fi

    if [ ${CURRENT_PROFILE} == real1 ]
    then
      IDLE_PROFILE=real2
    else
      IDLE_PROFILE=real1
    fi

    echo "${IDLE_PROFILE}"
}

# 쉬고 있는 profile의 port 찾기
function find_idle_port()
{
    IDLE_PROFILE=$(find_idle_profile)

    if [ ${IDLE_PROFILE} == real1 ]
    then
      echo "8081"
    else
      echo "8082"
    fi
}
```
```bash
#!/usr/bin/env bash

ABSPATH=$(readlink -f $0)
ABSDIR=$(dirname $ABSPATH)
source ${ABSDIR}/profile.sh

IDLE_PORT=$(find_idle_port)

echo "> $IDLE_PORT 에서 구동중인 애플리케이션 pid 확인"
IDLE_PID=$(lsof -ti tcp:${IDLE_PORT})

if [ -z ${IDLE_PID} ]
then
  echo "> 현재 구동중인 애플리케이션이 없으므로 종료하지 않습니다."
else
  echo "> kill -15 $IDLE_PID"
  kill -15 ${IDLE_PID}
  sleep 5
fi
```
```bash
#!/usr/bin/env bash

ABSPATH=$(readlink -f $0)
ABSDIR=$(dirname $ABSPATH)
source ${ABSDIR}/profile.sh

REPOSITORY=/home/ec2-user/app/step3
PROJECT_NAME=freelec-springboot2-webservice

echo "> Build 파일 복사"
echo "> cp $REPOSITORY/zip/*.jar $REPOSITORY/"

cp $REPOSITORY/zip/*.jar $REPOSITORY/

echo "> 새 어플리케이션 배포"
JAR_NAME=$(ls -tr $REPOSITORY/*.jar | tail -n 1)

echo "> JAR Name: $JAR_NAME"

echo "> $JAR_NAME 에 실행권한 추가"

chmod +x $JAR_NAME

echo "> $JAR_NAME 실행"

IDLE_PROFILE=$(find_idle_profile)

echo "> $JAR_NAME 를 profile=$IDLE_PROFILE 로 실행합니다."
nohup java -jar \
    -Dspring.config.location=classpath:/application.properties,classpath:/application-$IDLE_PROFILE.properties,/home/ec2-user/app/application-oauth.properties,/home/ec2-user/app/application-real-db.properties \
    -Dspring.profiles.active=$IDLE_PROFILE \
    $JAR_NAME > $REPOSITORY/nohup.out 2>&1 &
```
```bash
#!/usr/bin/env bash

ABSPATH=$(readlink -f $0)
ABSDIR=$(dirname $ABSPATH)
source ${ABSDIR}/profile.sh
source ${ABSDIR}/switch.sh

IDLE_PORT=$(find_idle_port)

echo "> Health Check Start!"
echo "> IDLE_PORT: $IDLE_PORT"
echo "> curl -s http://localhost:$IDLE_PORT/profile "
sleep 10

for RETRY_COUNT in {1..10}
do
  RESPONSE=$(curl -s http://localhost:${IDLE_PORT}/profile)
  UP_COUNT=$(echo ${RESPONSE} | grep 'real' | wc -l)

  if [ ${UP_COUNT} -ge 1 ]
  then # $up_count >= 1 ("real" 문자열이 있는지 검증)
      echo "> Health check 성공"
      switch_proxy
      break
  else
      echo "> Health check의 응답을 알 수 없거나 혹은 실행 상태가 아닙니다."
      echo "> Health check: ${RESPONSE}"
  fi

  if [ ${RETRY_COUNT} -eq 10 ]
  then
    echo "> Health check 실패. "
    echo "> 엔진엑스에 연결하지 않고 배포를 종료합니다."
    exit 1
  fi

  echo "> Health check 연결 실패. 재시도..."
  sleep 10
done
```

```bash
#!/usr/bin/env bash

ABSPATH=$(readlink -f $0)
ABSDIR=$(dirname $ABSPATH)
source ${ABSDIR}/profile.sh

function switch_proxy() {
    IDLE_PORT=$(find_idle_port)

    echo "> 전환할 Port: $IDLE_PORT"
    echo "> Port 전환"
    echo "set \$service_url http://127.0.0.1:${IDLE_PORT};" | sudo tee /etc/nginx/conf.d/service-url.inc

    echo "> 엔진엑스 Reload"
    sudo service nginx reload
}
```

### 1.4 무중단 배포 테스트
- 잦은 배포로 Jar 파일명이 겹칠 수 있으므로 자동으로 변경되도록 build.gradle을 수정한다.
```gradle
version '1.0.1-SNAPSHOT-'+new Date().format("yyyyMMddHHmmss")
``

build.gradle은 Groovy 기반의 빌드툴이고 Groovy언어의 여러 문법을 사용했는데 여기서는 new Date()로 빌드마다 그 시간이 버전에 추가되도록 하였다.

- 배포가 자동으로 진행되면 CodeDeploy 로그로 잘 진행되는 지 확인한다.
    - tail -f /opt/codedeploy-agent/deployment-root/deployment-logs/codedeploy-agent-deploymnets.log
- 스프링 부트 로그 보기
    - vim ~/app/step3/nohup.out
- 자바 애플리케이션 실행 여부 확인
    - ps -ef | grep java