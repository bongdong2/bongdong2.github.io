---
title: "springboot & AWS - mustache, social login"
date: 2019-12-26 13:58:00 -0400
categories: spring
---

머스테치로 화면 구성 & 소셜 로그인 구현

### 목차
[1. 머스테치로 화면 구성](#1-머스테치로-화면-구성)<br>
[2. 스프링 시큐리티 로그인 구현](#2-스프링-시큐리티-로그인-구현)<br>

## 1. 머스테치로 화면 구성

### 1.1 템플릿 엔진과 머스테치 소개
- 템플릿 엔진 : 지정된 템플릿 양식과 테이터가 합쳐져 HTML문서를 출력하는 소프프퉤어
    - 서버 템플릿 엔진 : JSP, Thymeleaf, ...
    - 클라이언트 텝플린 엔진 : vue, react, ...
- 서버 템플릿 엔진을 이용한 화면 생성은 서버에서 Java 코드로 문자열을 만든 뒤 문자열을 HTML로 변환하여 브라우저로 전달한다. 
- 자바스크립트는 브라우저 위에서 작동한다.
- Vue.js나 React.js를 이용한 SPA(Single Page Application)는 브라우저에서 화면을 생성한다. 서버에서는 Json / Xml 형식의 데이터만 전달하고 클라이언트에서 조립한다. 요즘은 서버사이드 렌더링을 지원하기도 한다.
- 머스테치는 수많은 언어를 지원하는 가장 심플한 템플릿 엔진이다.
    - 서버 템플릿 엔진, 클라이언트 템플릿 엔진 둘 다 사용할 수 있다. (Mustache.js / Mustache.java)
    - 문법이 다른 템플릿 엔진보다 심플하다.
    - 로직코드를 사용할 수 없어 View의 역할과 서버의 역할을 명확히 분리한다.

### 1.2 기본 페이지 만들기

index.mustache
```html
<!DOCTYPE HTML>

<html>
<head>
    <title>스프링 부트 웹 서비스</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
</head>
<body>
    <h1>스프링 부트로 시작하는 웹 서비스</h1>
</body>
</html>
```

index.mustache 테스트 코드
```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class IndexContollerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void 메인페이지_로딩() {
        // when
        String body = this.restTemplate.getForObject("/", String.class);

        // then
        assertThat(body).contains("스프링 부트로 시작하는 웹 서비스");
    }
}
```

### 1.3 게시글 등록 화면 만들기
부트스트랩, 제이쿼리 같은 외부 라이브러리를 사용하여 화면을 만든다. 외부 CDN을 사용하거나 직접 라이브러리를 받아서 사용하는데 공부용으로는 CDN을 사용하고 실제 서비스에서는 직접 라이브러리를 받아서 외부 서비스에 의존을 줄인다.

2개의 라이브러리를 index.mustache 에 추가하는데, 바로 추가하지 않고 레이아웃 방식으로 추가한다.

header.mustache
```html
<!DOCTYPE HTML>
<html>
<head>
    <title>스프링부트 웹서비스</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
</head>
<body>
```

footer.mustache
```html
<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
</body>
</html>
```

css는 header에 js는 footer에 두었는데 페이지 로딩속도를 높이기 위해서다.<br>
HTML은 위에서부터 코드가 시작되기 때문에 head가 시작되고서야 body가 실행된다.<br>
css는 화면을 그리는 역할이므로 head에서 불러오는 것이좋다.<br>
bootstrap.js는 제이쿼리가 꼭 있어야만 하기 때문에 부트스랩보다 먼저 호출되도록 했다. 이를 bootstrap.js가 제이쿼리에 의존한다고 한다.

```html
{{>layout/header}}

<h1>스프링 부트로 시작하는 웹 서비스</h1>

{{>layout/footer}}

<!-- {{>}} 는 현재 머스테치 파일을 기준으로 다른 파일을 가져온다.  -->
```

글 등록 버튼 추가 index.mustache
```html
{{>layout/header}}

<h1>스프링 부트로 시작하는 웹 서비스</h1>
<div class="col-md-12">
    <div class="row">
        <div class="col-md-6">
            <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
        </div>
    </div>
</div>

{{>layout/footer}}
```

게시글 등록 화면 추가 post-save.mustache
```html
{{>layout/header}}

<h1>게시글 등록</h1>

<div class="col-md-12">
    <div class="col-md-4">
        <form>
            <div class="form-group">
                <label for="title">제목</label>
                <input type="text" class="form-control" id="title" placeholder="제목을 입력하세요">
            </div>
            <div class="form-group">
                <label for="author"> 작성자 </label>
                <input type="text" class="form-control" id="author" placeholder="작성자를 입력하세요">
            </div>
            <div class="form-group">
                <label for="content"> 내용 </label>
                <textarea class="form-control" id="content" placeholder="내용을 입력하세요"></textarea>
            </div>
        </form>
        <a href="/" role="button" class="btn btn-secondary">취소</a>
        <button type="button" class="btn btn-primary" id="btn-save">등록</button>
    </div>
</div>

{{>layout/footer}}
```

resources/static/js/app/index.js 추가
```javascript
var index = {
    init : function () {
        var _this = this;
        $('#btn-save').on('click', function () {
            _this.save();
        });
    },
    save : function () {
        var data = {
            title : $("#title").val(),
            author : $("#author").val(),
            content : $("#content").val()
        };

        $.ajax({
            type : 'POST',
            url : '/api/v1/posts',
            dataType : 'json',
            contentType : 'application/json; charset=uft-8',
            data : JSON.stringify(data)
        }).done(function () {
            alert('글이 등록되었습니다.');
            window.location.href = '/';
        }).fail(function (error) {
            alert(JSON.stringify(error));
        });
    }
};

index.init();
```

index.js에서 index라는 변수의 속성으로 function을 추가한 이유는?<br>
또다른 자바스크립트 파일에서도 같은 이름의 함수를 사용할 수 있고, 브라우저의 스코프는 공용공간으로 쓰이기 때문에 나중에 로딩된 js의 함수가 먼저 호출된 js함수를 덮어쓰게 된다. 이러한 문제를 해결하려고 index.js만의 유효범위(scope)를 만들어 사용한다.<br>

var index이란 객체를 만들어 해당 객체에 모든 function을 선언하는 것이다. 이렇게 하면 해당 객체 안에서만 function이 유효하기 때문에 다른 js와 겹칠 위험이 사라진다.

index.js를 footer.mustache에 등록한다.
```html
<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>

<!--index.js 추가-->
<script src="/js/app/index.js"></script>
</body>
</html>
```

정상적으로 글이 등록된다.

### 1.4 전체 조회 화면 만들기

- 머스테치 문법

    - '{{#posts}}' -> posts라는 List를 순회한다.
    - '{{id}} 등의 {{변수명}}' -> List에서 뽑아낸 객체의 필드를 사용한다.


- Spring Data JPA에서 제공하지 않는 메서드를 쿼리로 작성하기
```java
public interface PostsRepository extends JpaRepository<Posts, Long> {

    @Query("select p from Posts p order by p.id desc")
    List<Posts> findAllDesc();
}
```
실제로 Spring Data JPA에서 제공하는 기본 메소드만으로도 해결할 수 있지만 @Query가 가독성이 좋으니 선택해서 사용한다.

규모가 있는 프로젝트에서의 데이터 조회는 FK의 조인, 복잡한 조건 등으로 인해 Entity클래스 만으로 처리하기 어려워 조회용 프레임워크를 추가로 사용한다.(querydsl)

PostsService.java
```java
@Transactional(readOnly = true)
    public List<PostsListResponseDto> findAllDesc() {
        return postsRepository.findAllDesc().stream()
                .map(PostsListResponseDto::new)
                .collect(Collectors.toList());
    }
```

@Transactional(readOnly = true) : 트랜잭션 범위는 유지하고 조회 기능만 남겨두어 조회 속도가 개선되기 때문에 등록, 수정, 삭제 기능이 전혀 없는 메소드에 사용하는 것을 추천.

.map(PostsListResponseDto::new) : .map(posts -> new PostsListResponseDto(posts))

PostsListResponseDto.java
```java
@Getter
public class PostsListResponseDto {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime modifiedDate;

    public PostsListResponseDto(Posts entity) {
        this.id = entity.getId();
        this.title = entity.getTitle();
        this.author = entity.getAuthor();
        this.modifiedDate = entity.getModifiedDate();
    }
}
```

IndexController.java
```java
@RequiredArgsConstructor
@Controller
public class IndexController {

    private final PostsService postsService;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("posts", postsService.findAllDesc());
        return "index";
    }
}
```

### 1.5 게시글 수정, 삭제 화면 만들기
게시글 수정 머스테치 화면을 만들어보자.
- 글 번호, 제목, 작성자, 내용 인풋박스
- 글 번호, 작성자는 readonly
- 취소, 수정, 삭제 버튼

index.js 소스 추가하자
```javascript
var main = {
    init : function () {
        var _this = this;

        $('#btn-save').on('click', function () {
            _this.save();
        });

        $('#btn-update').on('click', function() {
            _this.update();
        });

        $('#btn-delete').on('click', function () {
            _this.delete();
        })
    },
    save : function () {
        var data = {
            title : $("#title").val(),
            author : $("#author").val(),
            content : $("#content").val()
        };

        $.ajax({
            type : 'POST',
            url : '/api/v1/posts',
            dataType : 'json',
            contentType : 'application/json; charset=uft-8',
            data : JSON.stringify(data)
        }).done(function () {
            alert('글이 등록되었습니다.');
            window.location.href = '/';
        }).fail(function (error) {
            alert(JSON.stringify(error));
        });
    },

    update : function () {
        var data = {
            title: $('#title').val(),
            content: $('#content').val()
        };

        var id = $('#id').val();

        $.ajax({
            type: 'PUT',
            url: '/api/v1/posts/'+id,
            dataType: 'json',
            contentType:'application/json; charset=utf-8',
            data: JSON.stringify(data)
        }).done(function() {
            alert('글이 수정되었습니다.');
            window.location.href = '/';
        }).fail(function (error) {
            alert(JSON.stringify(error));
        });
    },

    delete : function () {
        var id = $('#id').val();

        $.ajax({
            type: 'DELETE',
            url: '/api/v1/posts/' + id,
            dataType: 'json',
            contentType:'application/json; charset=utf-8',
        }).done(function() {
            alert('글이 삭제되었습니다.');
            window.location.href = '/';
        }).fail(function (error) {
            alert(JSON.stringify(error));
        });
    }
};

main.init();
```

PostsService
```java
@Transactional
public Long update(Long id, PostsUpdateRequestDto requestDto) {
    Posts posts = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다. id=" + id));
    posts.update(requestDto.getTitle(), requestDto.getContent());

    return id;
}

@Transactional
public void delete(Long id) {
    Posts posts = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id=" + id));
    postsRepository.delete(posts); // JpaRepository에서 지원하는 delete 메소드
}
```

PostApiController.java
```java
@PutMapping("/api/v1/posts/{id}")
public Long update(@PathVariable Long id, @RequestBody PostsUpdateRequestDto requestDto) {
    return postsService.update(id, requestDto);
}

@DeleteMapping("/api/v1/posts/{id}")
public Long delete(@PathVariable Long id) {
    postsService.delete(id);
    return id;
}
```

요약
- 서버 템플릿 엔진과 클라이언트 템플릿 엔진의 차이
- 머스테치의 기본 사용법
- 스프링 부트에서의 화면 처리 방식
- js/css 선언 위치를 다르게 하여 웹사이트의 로딩 속도를 향상하는 방법
- js 객체를 이용하여 브라우저의 전역 변수 충돌 문제를 회피하는 방법


## 2. 스프링 시큐리티 로그인 구현

스프링 시큐리티는 막강항 인증(Authentication)과 인가(Authorization : 권한 부여) 기능을 가진 프레임워크다. 인터셉터 필터 기능을 구현하는 것보다 더 권장된다.
이번에는 스프링 시큐리티와 OAuth 2.0을 구현한 구글 로그인을 연동하겠다.

### 2.1 스프링 시큐리티와 스프링 시큐리티 Oauth2 클라이언트
소셜 로그인을 사용하지 않고 직접 모든 것을 구현하려면 배보다 배꼽이 더 커지는 경우가 많다.
 - 로그인시 보안
 - 비밀번호 찾기
 - 회원가입 시 이메일 혹은 전화번호 인증
 - 비밀번호 변경
 - 회원정보 변경

위에 나열할 것들을 모두 구글, 페이스북, 네이버 등에 맡기면 되니 서비스 개발에 더 집중할 수 있다.

### 2.2 스프링 부트 1.5 vs 스프링 부트 2.0

스프링 부트 1.5 에서의 OAuth2 연동 방법은 2.0 에서는 크게 바뀌었는데 설정 방법에 차이가 없는 경우를 자주 보게 된다. 이는 spring-security-oauth2-autoconfigure 라이브러리 덕분이다. 여기서는 스프링 부트 2 방식인 Spring Security Oauth2 Client 방식을 사용한다. 스프링 부트 2 방식의 자료를 찾고 싶은 경우 인터넷 자료들 사이에서 2가지만 확인하면 된다. 
 - 먼저 spring-security-oahtu2-autoconfigure 라이브러리를 썼는지 확인
 - application.properties 혹은 application.yml 정보의 차이를 확인
    - 1.5 방식에는 url 주소를 모두 명시해야 했지만, 2.0 방식에서는 client인증 정보만 입력하면 된다.
    - 1.5 방식에서 입력했던 값들은 2.0버전으로 오면서 모두 enum으로 대체되었다.
    - CommonOAuth2Provider 라는 enum이 새로 추가되어 구글, 깃허브, 페이스북, 옥타의 기본 설정값은 모두 여기서 제공한다.

### 2.3 구글 서비스 등록
자세한 건 생략한다.

### 2.4 구글 로그인 연동하기
```java
@Getter
@NoArgsConstructor
@Entity
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column
    private String picture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder
    public User(String name, String email, String picture, Role role) {
        this.name = name;
        this.email = email;
        this.picture = picture;
        this.role = role;
    }

    public User update(String name, String picture) {
        this.name = name;
        this.picture = picture;

        return this;
    }

    public String getRoleKey() {
        return this.role.getKey();
    }
}
```
- @Enumerated(EnumType.STRING)
    - JPA에서 Enum값을 디폴트는 int를 저장하는데 문자열로 저장해야 가독성이 높아진다.

```java
@Getter
@RequiredArgsConstructor
public enum Role {

    GUEST("ROLE_GUEST", "손님"),
    USER("ROLE_USER", "일반 사용자");

    private final String key;
    private final String title;
}
```

```java
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
```
- findByEmail 메소드
    - 소셜로그인으로 반환되는 값 중 email을 통해 이미 생성된 사용자인지 처음 가입한 사용자인지 판단하기 위한 메소드

```gradle
// 소셜로그인 등 클라이언트 입장에서 소셜 기능 구현시 필요한 의존성
	implementation('org.springframework.boot:spring-boot-starter-oauth2-client')
```

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
                    .antMatchers("/", "/css/**", "/images/**", "/js/**", "/h2-console/**").permitAll()
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
- @EnableWebSecurity 
    - Spring Security 설정들을 활성화시켜 준다.
- csrf().disable().headers().frameOptions().disable() 
    - h2-console 화면을 사용하기 위해 해당 옵션들을 disable한다.
- authorizeRequests() 
    - URL별 권한 관리를 설정하는 옵션의 시작점
    - 이게 선언되어야 antMatcher 옵션을 사용할 수 있다.
- antMatchers 
    - 권한 관리 대상을 지정하는 옵션
    - URL, HTTP 메소드 별로 관리 가능
    - "/"등 지정된 URL들은 permilAll() 옵션을 통해 전체 열람 권한 부여
    - POST 메소드이면서 "/api/v1/**" 주소를 가진 API는 USER권한을 가진 사람만 가능하도록 했다.
- anyRequest 
    - 설정된 값들 이외 나머지 URL들을 나타낸다.
- logout().logoutSuccessUrl("/")
    - 로그아웃 기능에 대한 여러 설정의 진입점이다.
    - 로그아웃 성공 시 / 주소로 이동한다.
- oauth2Login
    - OAuth2 로그인 기능에 대한 여러 설정의 진입점이다.
- userInfoEndpoint
    - OAuth2 로그인 성공 이후 사용자 정보를 가져올 때의 설정들을 담당
- userService
    - 소셜 로그인 성공 시 후속 조치를 진행할 UserService 인터페이스의 구현체를 등록.
    - 리소스 서버 (즉, 소셜 서비스들)에서 사용자 정보를 가져온 상태에서 추가로 진행하고자 하는 기능을 명시할 수 있다.

```java
@RequiredArgsConstructor
@Service
public class CustomOauth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;
    private final HttpSession httpSession;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2UserService delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        User user = saveOrUpdate(attributes);

        httpSession.setAttribute("user", new SessionUser(user));

        return new DefaultOAuth2User (
                Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())),
                attributes.getAttributes()
                ,attributes.getNameAttributeKey());
    }

    private User saveOrUpdate(OAuthAttributes attributes) {
        User user = userRepository.findByEmail(attributes.getEmail()).map(entity -> entity.update(attributes.getName(), attributes.getPicture()))
                .orElse(attributes.toEntity());

        return userRepository.save(user);
    }
}
```
- getRegistrationId
    - 현재 로그인 진행 중인 서비스를 구분하는 코드
    - 지금은 구글만 사용하는 불필요한 값이나, 이후 네이버 로그인 연동 시에 네이버로 로그인인지, 구글 로그인인지 구분하기 위해 사용한다.
- getUserNameAttributeName
    - OAuth2 로그인 진행 시 키가 되는 필드값을 이야기한다. Primary Key와 같은 의미이다.
    - 구글의 경우 기본적으로 코드를 지원하지만, 네이버 카카오 등은 기본 지원하지 않는다. 구글의 기본 코드는 "sub" 이다.
    - 이후 네이버 로그인과 구글 로그인을 동시 지원할 때 사용된다.
- OAuthAttributes 
    - OAuth2UserService 를 통해 가져온 OAuth2User의 attribute를 담을 클래스.
    - 이후 네이버 등 다른 소셜 로그인도 이 클래스를 사용한다.
- SessionUser 
    - 세션에 사용자를 저장하기 위한 Dto 클래스이다.
    - 엔티티 클래스에는 언제 다른 엔티티와 관계형성이 될 지 모르기 때문에 성능 이슈, 부수효과가 발생할 확률이 높다. 직렬화 기능을 가진 Dto를 하나 만드는 것이 이후 운영 유지보수 때 많은 도움이 된다.

```java
@Getter
public class OAuthAttributes {

    private Map<String, Object> attributes;
    private String nameAttributeKey;
    private String name;
    private String email;
    private String picture;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email, String picture) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.picture = picture;
    }

    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        return ofGoogle(userNameAttributeName, attributes);
    }

    private static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .picture((String) attributes.get("picture"))
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    public User toEntity() {
        return User.builder()
                .name(name)
                .email(email)
                .picture(picture)
                .role(Role.GUEST)
                .build();
    }
}
```
- of()
    - OAuth2User에서 반환하는 사용자 정보는 Map이기 때문에 값 하나하나를 변환해야 한다.
- toEntity()
    - User 엔티티를 생성한다.
    - OAuthAttribute에서 엔티티를 생성하는 시점은 처음 가입할 때다.
    - 가입할 때 기본권한을 GUEST로 주기 위해 role 빌더값에는 Role.GUEST를 사용한다.
    - OAuthAttribute 클래스 생성이 끝났으면 같은 패키지에 SessionUser 클래스를 생성한다.

```java
@Getter
public class SessionUser implements Serializable {

    private String name;
    private String email;
    private String picture;

    public SessionUser(User user) {
        this.name = user.getName();
        this.email = user.getEmail();
        this.picture = user.getPicture();
    }
}
```

index.mustache를 수정한다.

```html
<h1>스프링 부트로 시작하는 웹 서비스</h1>
<div class="col-md-12">
    <div class="row">
        <div class="col-md-6">
            <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
            {{#userName}}
                Logged in as: <span id="user">{{userName}}</span>
                <a href="/logout" class="btn btn-info active" role="button">Logout</a>
            {{/userName}}
            {{^userName}}
                <a href="/oauth2/authorization/google" class="btn btn-success active" role="button">Google Login</a>
            {{/userName}}
        </div>
    </div>
    <br>
    ...
```
- {{#userName}}
    - 머스테치는 다른 언어와 같은 if문 등을 제공하지 않는다.
    - true/false 여부만 판단할 뿐이다.
    - 그래서 머스테치에서는 항상 최종값을 넘겨줘야 한다.
    - 여기서도 역시 userName이 있다면 userName을 노출시키도록 규정했다.

- a href = "/logout"
    - 스프링 시큐리티에서 기본적으로 제공하는 로그아웃 URL이다.
    - 즉, 개발자가 별로도 저 URL에 해당하는 컨트롤러를 만들 필요가 없다.
    - SecurityConfig 클래스에서 URL을 변경할 수 있지만 여기서는 그냥 사용한다.
- {{^userName}}
    - 머스테치에서 해당 값이 존재하지 않는 경우에는 ^를 사용한다.
    - 여기서는 userName이 없다면 로그인 버튼을 노출시키도록 구성했다.
- a href="/oauth2/authorization/google"
    - 스프링 시큐리티에서 기본적으로 제공하는 로그인 URL이다.
    - 로그아웃 URL처럼 별도의 컨트롤러를 생서할 필요가 없다.

```java
@RequiredArgsConstructor
@Controller
public class IndexController {

    private final PostsService postsService;
    private final HttpSession httpSession;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("posts", postsService.findAllDesc());

        SessionUser user = (SessionUser) httpSession.getAttribute("user");

        if(user != null) {
            model.addAttribute("userName", user.getName());
        }

        return "index";
    }
    ...
}
```
- (SessionUser) httpSession.getAttribute("user");
    - 앞서 작성된 CustomOAuthUserService에서 로그인 성공 시 세션에 SessionUser를 저장하도록 구성했다.
    - 즉, 로그인 성공 시 httpSession.getAttribute("user")에서 값을 가져올 수 있다.
- if(user != null)
    - 세션에 저장된 값이 있을 때만 model에 userName으로 등록한다.
    - 세션에 저장된 값이 없으면 model엔 아무런 값이 없는 생태이니 로그인 버튼이 보이게 된다.

### 2.5 애노테이션 기반으로 개선하기
IndexController에서 세션값을 받아오는 부분을 개선하자. 메소드 인자로 세션값을 바로 받을 수 있도록 변경하겠다.

```java
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface LoginUser {
}
```
- @Target(ElementType.PARAMETER)
    - 이 애노테이션이 생성될 수 있는 위치를 지정한다.
    - PARAMETER로 지정했으니 메소드의 파라미터로 선언된 객체에서만 사용할 수 있다.
    - 이 외에도 클래스 선어문에 쓸 수 있는 TYPE 등이 있다.
- @interface
    - 이 파일을 애노테이션 클래스로 지정한다.
- @Retention(RetentionPolicy.RUNTIME)
    - 애노테이션 범위. 런타임시 적용된다.

```java
@RequiredArgsConstructor
@Component
public class LoginUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final HttpSession httpSession;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {

        boolean isLoginUserAnnotation = parameter.getParameterAnnotation(LoginUser.class) != null;
        boolean isUserClass = SessionUser.class.equals(parameter.getParameterType());
        return isLoginUserAnnotation && isUserClass;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
        return httpSession.getAttribute("user");
    }
}
```
- HandlerMethodArgumentResolver
    - 조건에 맞는 경우 메소드가 있다면 HandlerMethodArgumentResolver의 구현체가 지정한 값으로 해당 메소드의 파라미터로 넘길 수 있다.
- supportsParameter()
    - 컨트롤러 메서드의 특정 파라미터를 지원하는지 판단한다.
    - 여기서는 파라미터에 @LoginUser 애노테이션이 붙어 있고, 파라미터 클래스 타입이 SessionUser.class인 경우 true를 반환한다.
- resolveArgument
    - 파라미터에 전달할 객체를 생성한다.
    - 여기서는 세션에서 객체를 가져온다.

```java
@RequiredArgsConstructor
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final LoginUserArgumentResolver loginUserArgumentResolver;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(loginUserArgumentResolver);
    }
}
```
LoginUserArgumentResolver가 스프링에서 인식할 수 있도록 WebMvcConfigurer에 추가했다.

```java
@RequiredArgsConstructor
@Controller
public class IndexController {

    private final PostsService postsService;
    //private final HttpSession httpSession;

    @GetMapping("/")
    public String index(Model model, @LoginUser SessionUser user) {
        model.addAttribute("posts", postsService.findAllDesc());

        // SessionUser user = (SessionUser) httpSession.getAttribute("user");

        if(user != null) {
            model.addAttribute("userName", user.getName());
        }

        return "index";
    }
    ...
}
```
IndexController에 @LoginUser 애노테이션 적용


### 2.6 세션 저장소롤 데이터베이스 사용하기
이제까지 만든 서비스는 애플리케이션을 재시작하면 로그인이 풀린다. 이는 세션이 내장 톰캣에 저장되기 때문이다. 새션은 실행되는 WAS의 메모리에서 저장되고 호출된다. 메모리에 저장되다 보니 내장 톰캣처럼 애플리케이션 실행 시 실행되는 구조에선 항상 초기화가 된다. 즉 배포할 때마다 톰캣이 재시작된다.<br>
2대 이상의 서버에서 서비스하고 있다면 톰캣마다 세션 도익화 설정을 해야만 한다. 그래서 실제 현업에서는 세션 저장소에 대해 다음의 3가지 중 한 가지를 선택한다.

1. 톰캣 세션을 사용한다.
    - 일반적으로 별다른 설정을 하지 않을 때 기본적으로 선택하는 방식이다.
    - 톰캣에 세션이 저장되기 때문에 2대 이상의 WAS가 구동되는 환경에서는 톰캣들 간의 세션 공유를 위한 추가 설정이 필요하다.
2. MySQL과 같은 데이터베이스를 세션 저장소로 사용한다.
    - 여러 WAS 간의 공용 세션을 사용할 수 있는 가장 쉬운 방법이다.
    - 많은 설정이 필요 없지만, 결국 로그인 요청마다 DB IO가 발생하여 성능상 이슈가 발생할 수 있다.
    - 보통 로그인 요청에 많이 없는 백오피스, 사내 시스템 용도에서 사용한다.
3. Redis, Mermcached와 같은 메모리 DB를 세션 저장소로 사용한다.
    - B2C 서비스에서 가장 많이 사용하는 방식이다.
    - 실제 서비스로 사용하기 위해서는 Embeded Redis와 같은 방식이 아닌 외부 메모리 서버가 필요하다.

여기서는 두 번째 방식인 데이터베이스를 세션 저장소로 사용하겠다. 설정이 간단하고 사용자가 많은 서비스가 아니며, 비용 절감을 위해서다. 이후 AWS에서 배포하고 운영할 때를 생각하면 Redis는 추가 요금을 지불해야 하므로 부담된다.

- spring-session-jdbc 등록
    - implementation('org.springframework.session:spring-session-jdbc')
- application.properties
    - spring.session.store-type=jdbc
- 애플리케이션을 실행 후 로그인하고 h2-console에 접속하면 세션을 위한 테이블 2개가 생성된 것을 볼 수 있다. JPA로 인해 세션 테이블이 자동 생성되었다.
    - 기존과 동일하게 스프링을 재시작하면 세션이 풀린다. H2도 재시작되기 때문.
    - 이후 AWS로 배포하게 되면 AWS의 데이터베이스 서비스인 RDS(Relational Database Service)를 사용하게 되니 이때부터는 세션이 풀리지 않는다.

### 2.7 네이버 로그인
네이버 오픈 API 등록한다.<br>
https://developers.naver.com/apps/#/register?api=nvlogin

```properties
# registration
spring.security.oauth2.client.registration.naver.client-id=2C7xicmaL4txM8cy5Y4Q
spring.security.oauth2.client.registration.naver.client-secret=DzdlYdu8JC
spring.security.oauth2.client.registration.redirect_uri_template={baseUrl}/{action}/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.naver.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.naver.client-name=Naver

# provider
spring.security.oauth2.client.provider.naver.authorization-uri=https://nid.naver.com/oauth2.0/authorize
spring.security.oauth2.client.provider.naver.token-uri=https://nid.naver.com/oauth2.0/token
spring.security.oauth2.client.provider.naver.user-info-uri=https://openapi.naver.com/v1/nid/me
spring.security.oauth2.client.provider.naver.user-name-attribute=response
```
- user-name-attribute=response
    - 기준이 되는 user_name의 이름을 네이버에서는 response로 해야 한다.
    - 이유는 네이버 회원 조회 시 반환되는 JSON의 형태 때문이다.

스프링 시큐리티에선 하위 필드를 명시할 수 없다. 최상위 필드만 user_name으로 지정 가능하다. 하지만 네이버 응답값 최상위 필드는 resultCode, message, response이다. 이러한 이유로 스프링 시큐리티에서 인식 가능한 필드는 저 3개 중에 골라야 한다. 본문에서 담고 있는 response를 user_name으로 지정하고 이후 자바코드로 reaponse의 id를 user_name으로 지정하겠다.

OAuthAttributes에 네이버인지 판단하는 코드와 네이버 생성자 추가
```java
@Getter
public class OAuthAttributes {

    ...

    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {

        if("naver".equals(registrationId)) {
            return ofNaver("id", attributes);
        }

        return ofGoogle(userNameAttributeName, attributes);
    }

    ...

    private static OAuthAttributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");

        return OAuthAttributes.builder()
                .name((String) response.get("name"))
                .email((String) response.get("email"))
                .picture((String) response.get("profile_image"))
                .attributes(response)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }

    ...
}
```

index.mustach에 네이버 로그인 버튼 추가
```html
{{^userName}}
    <a href="/oauth2/authorization/google" class="btn btn-success active" role="button">Google Login</a>

    <a href="/oauth2/authorization/naver" class="btn btn-secondary active" role="button">Naver Login</a>
{{/userName}}
```
- /oauth2/authorization/naver
    - 네이버 로그인 URL은 application-oauth.properties에 등록한 redirect-uri 값에 맞춰 자동으로 등록된다.
    - /oauth2/authorization 까지는 고정이고 마지막 Path만 각 소셜 로그인 코드를 사용하면 된다.


### 2.8 기존 테스트에 시큐리티 적용하기
시큐리티 적용으로 인해 기존 테스트의 문제를 해결해야 한다. 시큐리티 옵션이 활성화되면서 인증된 사용자만 API를 호출할 수 있다. 테스트코드마다 인증한 사용자가 호출한 것처럼 작동하도록 수정해야 한다.

Intellij - Gradle탭 - Tasks - verification - test 를 실행해 전체 테스트를 수행한다.

테스트 환경을 위한 application.properties를 생성한다.
```properties
spring.jpa.show-sql=true
spring.jpa.hibernate.dialect=org.hibernate.dialect.MySQL5Dialect
spring.h2.console.enabled=true
spring.profiles.include=oauth
spring.session.store-type=jdbc

# Test OAuth
spring.security.oauth2.client.registration.google.client-id=test
spring.security.oauth2.client.registration.google.client-secret=test
spring.security.oauth2.client.registration.google.scope=profile,email
```

스프링 시큐리티 테스트를 위한 여러 도구를 지원하는 의존성 추가
```gradle
dependencies {
	implementation('org.springframework.security:spring-security-test')
    ...
}
```

PostsApiControllerTest 의 테스트 메소드에 임의의 사용자 인증 추가
```java
@Test
    @WithMockUser(roles="USER")
    public void Posts_등록된다() throws Exception {
        ...
    }
```
- @WithMockUser(roles="USER")
    - 인증된 가짜 사용자를 만들어서 사용한다.
    - roles에 권한을 추가할 수 있다.
    - ROLE_USER 권한을 가진 사용자가 API를 요청하는 것과 동일한 효과를 가진다.

```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class PostApiControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private PostsRepository postsRepository;

    @After
    public void tearDown() throws Exception {
        postsRepository.deleteAll();
    }

    @Autowired
    private WebApplicationContext context;

    private MockMvc mvc;

    @Before
    public void setup() {
        mvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser(roles="USER")
    public void Posts_등록된다() throws Exception {
        // given
        String title = "title";
        String content = "content";
        PostsSaveRequestDto requestDto = PostsSaveRequestDto
                .builder()
                .title(title)
                .content(content)
                .build();

        String url = "http://localhost:" + port + "/api/v1/posts";

        // when
        //ResponseEntity<Long> responseEntity = restTemplate.postForEntity(url, requestDto, Long.class);
        mvc.perform(post(url)
                        .contentType(MediaType.APPLICATION_JSON_UTF8)
                        .content(new ObjectMapper().writeValueAsString(requestDto)))
                    .andExpect(status().isOk());

        // then
        //assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        //assertThat(responseEntity.getBody()).isGreaterThan(0L);

        List<Posts> all = postsRepository.findAll();
        assertThat(all.get(0).getTitle()).isEqualTo(title);
        assertThat(all.get(0).getContent()).isEqualTo(content);
    }

    @Test
    @WithMockUser(roles="USER")
    public void posts_수정된다() throws Exception {

        // given
        Posts savedPosts = postsRepository.save(Posts.builder()
                .title("title")
                .content("content")
                .author("author")
                .build());

        Long updatedId = savedPosts.getId();
        String expectedTitle = "title2";
        String expectedContent = "content2";

        PostsUpdateRequestDto requestDto = PostsUpdateRequestDto.builder()
                .title(expectedTitle)
                .content(expectedContent)
                .build();

        String url = "http://localhost:" + port + "/api/v1/posts/" + updatedId;

        //HttpEntity<PostsUpdateRequestDto> requestEntity = new HttpEntity<>(requestDto);

        // when
        //ResponseEntity<Long> responseEntity = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Long.class);
        mvc.perform(put(url)
                .contentType(MediaType.APPLICATION_JSON_UTF8)
                .content(new ObjectMapper().writeValueAsString(requestDto)))
                .andExpect(status().isOk());

        // then
        //assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        //assertThat(responseEntity.getBody()).isGreaterThan(0L);

        List<Posts> all = postsRepository.findAll();
        assertThat(all.get(0).getTitle()).isEqualTo(expectedTitle);
        assertThat(all.get(0).getContent()).isEqualTo(expectedContent);
    }
}
```
- @Before
    - 매번 테스트가 시작되기 전에 MockMvc 인스턴스를 생성한다.
- mvc.perform
    - 생성된 MockMvc를 통해 API를 테스트 한다.
    - 본문(Body) 영역은 문자열로 표현하기 위해서 ObjectMapper를 통해 문자열 JSON으로 변환한다.


HelloControllerTest는 @WebMvcTest를 사용하므로 다른 테스트와는 다르다.
```java
@RunWith(SpringRunner.class)
@WebMvcTest(controllers = HelloController.class,
excludeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
})
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

        //http://localhost:8080/hello/
    }

    @Test
    @WithMockUser(roles = "USER")
    public void helloDto가_리턴된다() throws Exception {
        String name = "hello";
        int amount = 999;

        mockMvc.perform(get("/hello/dto")
                            .param("name", name)
                            .param("amount", String.valueOf(amount)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is(name)))
                .andExpect(jsonPath("$.amount", is(amount)));

        //http://localhost:8080/hello/dto?name=seungui&amount=30
    }
}
```

- 스캔대상에서 SecurityConfig를 제거한다.
- Application.java 에서 @EnableAuditing 애노테이션 삭제
- config 패키지에 JpaConfig를 생성하여 @EnableAuditing 추가

```java
@Configuration
@EnableJpaAuditing // JPA Auditing 활성화
public class JpaConfig {
}
```


### 정리
- 스프링 부트 1.5와 스프링 부트 2.0에서 시큐리티 설정의 차이점
- 스프링 시큐리티를 이용한 구글/네이버 로그인 연동 방법
- 세션 저장소로 톰캣 / DB / 메모리DB가 있으며 이 중 DB를 사용하는 이유
- ArgumentResolver를 이용하면 애노테이션으로 로그인 세션 정보를 가져올 수 있다는 것
- 스프링 시큐리티 적용시 기존 테스트 코드에서 문제 해결법