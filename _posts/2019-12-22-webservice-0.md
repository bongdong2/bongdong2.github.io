---
title: "springboot & AWS - 스프링부트 테스트 코드"
date: 2019-12-25 11:23:00 -0400
categories: spring
---

Springboot 테스트 코드를 작성해보자

### 목차
[1. 테스트 코드](#1-테스트-코드)<br>
[1.1 테스트-코드-소개](#11-테스트-코드-소개)<br>
[1.2 Hello Controller 테스트 코드 작성하기](#12-hello-controller-테스트-코드-작성하기)<br>

## 1. 테스트 코드
대부분의 회사가 테스트 코드를 작성하는 개발자를 선호한다. 서비스 회사에 취업과 이직을 하기 위해서는 테스트 코드는 절대 빠질 수 없는 요소다.

### 1.1 테스트 코드 소개
- TDD(Test Driven Development) : 테스트 주도 개발. 테스트 코드를 먼저 작성하는 것부터 시작한다.
    - RED : 항상 실패하는 테스트를 먼저 작성
    - GREEN : 테스트가 통과하는 프로덛션 코드를 작성
    - BLUE : 테스트가 통과하면 프로덕션 코드를 리펙토링

- Unit Test(단위 테스트) : TDD의 첫 번째 단계인 기능 단위의 테스트 코드를 작성하는 것. 테스트 코드를 먼저 작성하거나 리펙토링을 의미하는 게 아니라 순수하게 테스트 코드만 작성하는 것.

- 테스트 코드를 작성하여 얻는 이점
    - 단위 테스트는 개발 초기에 문제를 발견할 수 있게 도와 준다.
    - 나중에 코드를 리펙토링 하거나 라이브러리 업그레이드 등에서 기존 기능이 올바르게 작동하는 지 확인할 수 있다. (예. 회귀테스트)
    - 단위 테스트는 기능에 대한 불확실성을 감소시킬 수 있다.
    - 단위 테스트가 문서로 사용될 수 있다.
    - 사람이 눈으로 검증하지 않게 자동검증이 가능하다.
    - 개발자가 만든 기능을 안전하게 보호해 준다.

- 테스트를 작성할 수 있게 도와주는 프레임워크를 여럿 있는데 JUnit을 사용하겠다.

### 1.2 Hello Controller 테스트 코드 작성하기

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "hello";
    }
}
```
```java
@RunWith(SpringRunner.class)
@WebMvcTest
public class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser(roles = "USER")
    public void hello가_리턴된다() throws Exception {
        String hello = "hello";

        mockMvc.perform(get("/hello"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().string(hello));
    }
```
- @RunWith(SpringRunner.class)
    - 테스트를 실행할 때 JUnit에 내장된 실행자 외에 다른 실행자인 SpringRunner를 사용한다.
    - 스프링 부트 테스트와 JUnit 사이의 연결자 역할을 한다.
- @WebMvcTest
    - 여러 스프링 테스트 애노테이션 중, Web(Spring MVC)에 집중할 수 있는 애노테이션
    - 선언할 경우 @Controller, @ControllerAdvice 등을 사용할 수 있다.
    - 단, @Service, @Component, @Repository등은 사용할 수 없다.
    - 여기서는 컨트롤러만 사용하므로 사용했다.
- mockMvc.perform(get("/hello"))
    - MockMvc를 통해 /hello 주소로 HTTP GET 요청을 한다.
    - 체이닝이 지원되어 여러 검증 기능을 이어서 선언할 수 있다.
- .andExpect(status().isOk())
    - mvc.perform의 결과를 검증한다.
    - HTTP Header의 Status를 검증한다.
    - 여기서는 isOK(), 200인지 아닌지 검증한다.
- .andExpect(content().string(hello))
    - mvc.perform의 결과를 검증한다.
    - 응답 본문(body) 내용을 검증한다.
    - Controller에서 "hello"를 리턴하는데 이 값이 맞는지 검증한다.

```java
@Getter
@RequiredArgsConstructor
public class HelloResponseDto {

    private final String name;
    private final int amount;
}
```
```java
public class HelloResponseDtoTest {

    @Test
    public void 롬복_기능_테스트() {
        // given
        String name = "test";
        int amount = 1000;

        // when
        HelloResponseDto dto = new HelloResponseDto(name, amount);

        // then
        assertThat(dto.getName()).isEqualTo(name);
        assertThat(dto.getAmount()).isEqualTo(amount);
    }
}
```
- assertThat
    - assertj라는 테스트 검증 라이브러리의 검증 메소드이다.
    - 검증하고 싶은 대상을 메소드의 인자로 받는다.
    - 메소드 체이닝이 지원되어 isEqualTo와 같은 메소드를 이어서 사용할 수 있다.
- isEqualsTo
    - assertj의 동등 비교 메소드이다.
    - assertThat에 있는 값고 isEqualTo의 값을 비교해서 같을 때만 성공이다.

- 여기서 JUnit의 assertThat가 아닌 assertj의 assertThat을 사용한 이유
    - JUnit의 assertThat를 사용하면 CoreMatchers 라이브러리가 필요하다.
    - 자동완성이 좀 더 잘 된다.

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class PostsRepositoryTest {

    @Autowired
    PostsRepository postsRepository;

    @After
    public void cleanup() {
        postsRepository.deleteAll();
    }

    @Test
    public void 게시글저장_불러오기() {
        // given
        String title = "테스트 게시글";
        String content = "테스트 본문";

        postsRepository.save(Posts.builder()
                .title(title)
                .content(content)
                .author("jsu373712@naver.com")
                .build());

        // when
        List<Posts> postsList = postsRepository.findAll();

        // then
        Posts posts = postsList.get(0);
        assertThat(posts.getTitle()).isEqualTo(title);
        assertThat(posts.getContent()).isEqualTo(content);
    }

    @Test
    public void BaseTimeEntity_등록() {
        // given
        LocalDateTime now = LocalDateTime.of(2019,12,30,12,17,0);
        postsRepository.save(Posts.builder()
                    .title("title")
                    .content("content")
                    .author("author")
                    .build());

        // when
        List<Posts> postsList = postsRepository.findAll();

        // then
        Posts posts = postsList.get(0);

        System.out.println(">>>>>>> createDate = " + posts.getCreatedDate() + ", modifiedDate = " + posts.getModifiedDate());

        assertThat(posts.getCreatedDate()).isAfter(now);
        assertThat(posts.getModifiedDate()).isAfter(now);
    }
}
```