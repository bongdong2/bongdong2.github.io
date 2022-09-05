---
title: "Spring기반 REST API - 3"
date: 2019-11-14 10:30:00 -0400
categories: spring

---

ch3. Spring HATEOAS
===================

### 스프링 HATEOAS ?
- 링크를 만드는 기능
  - 문자열 가지고 만들기
  - 컨트롤러와 메소드로 만들기
- 리소스를 만드는 기능
  - 리소스? 테이터(우리가 만들어 보내주는 본문) + 링크
- 링크를 찾아주는 기능 (이 강좌에서는 다루지 않음)
  - Traverson
  - LinkDeiscoverers
- 링크
  - HREF : hypermedia reference(uri, url)
  - REL : relation 현재 이 리소스와의 관계를 표현
    - self : 자기 자신에 대한 url을 넣어 줄 때
    - profile : 응답 본문에 대한 설명을 가지고 있는 문서로 링크를 걸 때
    - update-event
    - query-events

### 스프링 HATEOAS 적용
- EvnetResource 만들기
  - extends RepresentationModel 문제 
    - @JsonUnwrapped로 해결
    - extends EntityModel<T>로 해결
- 테스트 할 것
  - 응답에 HATEOAS와 profile 관련 링크가 있는지 확인
    - self(view)
    - update(만든 사람은 수정할 수 있으므로)
    - events(목록으로 가는 링크)


### 스프링 REST Docs 소개
- 스프링 MVC 테스트를 사용하여 REST API문서의 일부분을 생성하는 유용한 기능을 제공하는 라이브러리

- Spring REST Docs / Swagger 가 있는데 이 강좌에서 Swagger는 다루지 않음

- REST Docs 코딩
  - andDo(document(“doc-name”, snippets))
  - snippets
    - links()
    - requestParameters() + parameterWithName()
    - pathParameters() + parametersWithName()
    - requestParts() + partWithname()
    - requestPartBody()
    - requestPartFields()
    - requestHeaders() + headerWithName()
    - requestFields() + fieldWithPath()
    - responseHeaders() + headerWithName()
    - responseFields() + fieldWithPath()
    - ...
  - Relaxed*
  - Processor
    - preprocessRequest(prettyPrint())
    - preprocessResponse(prettyPrint())
    - ...

### 스프링 REST Docs 적용
- REST Docs 자동 설정
  - @AutoConfigureRestDocs
  
  
- 테스트코드에  ' .andDo(document("create-event")) ' 만 추가해도 target/generated-snippets/create-event에 문서가 생김
  - 이렇게 실행하면 문서가 포맷팅이 되어 있지 않은데 test/java/common/RestDocsConfiguration.class를 만들어서 해결 (prettyPrint())


- RestDocMockMvc 커스터마이징
  - RestDocsMockMvcConfigurationCustomizer 구현한 빈 등록
  - @TestConfiguration

 
### 스프링 REST Docs: 링크, (Req, Res) 필드와 헤더 문서화
- 요청 필드 문서화
  - requestFields() + fieldWithPath()
  - responseFields() + fieldWithPath()
  - requestHeaders() + headerWithName()
  - responseHedaers() + headerWithName()
  - links() + linkWithRel()
  
- Relaxed 접두어
  - 장점: 문서 일부분만 테스트 할 수 있다.
  - 단점: 정확한 문서를 생성하지 못한다.
  - 강좌에서는 relaxedResponseFields 사용해서 문서의 일부분만 확인하여 에러 해결
  - 또는 
  ```java 
  fieldWithPath("_link.self.href").description("link to self"),
  fieldWithPath("_link.query-events.href").description("link to query event list"),
  fieldWithPath("_link.update-event.href").description("link to update existing event")
  ```
  - 되도록이면 Relaxed 접두어 사용하지 않는 후자의 방법을 추천
  
  
### 스프링 REST Docs: 문서 빌드

- pom.xml  메이븐 플러그인 설정

- 템플릿 파일 추가
  - src/main/asciidoc/index.adoc

- 문서 생성하기
  - mvn package
  - test
  - prepare-package :: process-asciidoc
  - prepare-package :: copy-resources
  
- 문서 확인
  - target/classes/me/static/docs/index.html 
  - Web Server를 띄우고 http://localhost:8080/docs/index.html 에서 확인 가능

- profile 링크 추가
```java
class EventController{
@PostMapping
    public ResponseEntity createEvent(@RequestBody @Valid EventDto eventDto, Errors errors) {
        // .....
        // .....
        eventResource.add(new Link("/docs/index.html#resources-events-create").withRel("profile"));
        return ResponseEntity.created(createUri).body(eventResource);
    }
}
```

### PostgreSQL 적용
- test에서는 h2를 사용하고 애플리케이션 서버를 실행할 때에는 postgresql을 사용한다.
- /scripts.md 참고

1. PostgreSQL 드라이버 의존성 추가

```
<dependency>
	<groupId>org.postgresql</groupId>
	<artifactId>postgresql</artifactId>
</dependency>
```

2. 도커로 PostgreSQL 컨테이너 실행

docker run --name rest -p 5432:5432 -e POSTGRES_PASSWORD=pass -d postgres

3. 도커 컨테이너에 들어가보기

docker exec -i -t ndb bash
su - postgres
psql -d postgres -U postgres
\l
\dt

4. 데이터소스 설정

application.properties
```properties
spring.datasource.username=postgres
spring.datasource.password=pass
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.driver-class-name=org.postgresql.Driver
```

5. 하이버네이트 설정 

application.properties
```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

애플리케이션 설정과 테스트 설정 중복 어떻게 줄일 것인가?
프로파일과 @ActiveProfiles 활용

test 디렉토리의 application.properties 이름이 같으면 덮어 씌워버리므로 
이름을 변경한다. 대신 따로 선언을 해야 한다.

application-test.properties 에는 h2 인메모리 DB로 설정한다.
```properties
spring.datasource.username=sa
spring.datasource.password=
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver

spring.datasource.hikari.jdbc-url=jdbc:h2:mem:testdb

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

### 인덱스 핸들러 만들기
- 인덱스 핸들러
  - 다른 리소스에 대한 링크 제공
  - 문서화

- IndexController.java
```java
@RestController
public class IndexController {

    @GetMapping("/api")
    public RepresentationModel index() {
        var index = new RepresentationModel<>();

        index.add(linkTo(EventController.class).withRel("events"));
        return index;
    }
}
```

- 테스트 컨트롤러 리팩토링
  - 중복 코드 제거
- 에러 리소스
  - 인덱스로 가는 링크 제공
