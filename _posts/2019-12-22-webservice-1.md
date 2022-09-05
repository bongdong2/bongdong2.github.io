---
title: "springboot & AWS - Spring Data JPA 적용하기"
date: 2019-12-26 13:58:00 -0400
categories: spring
---

Spring Data JPA 적용하기

### 목차
[1. Spring Data JPA 적용하기](#1-Spring-Data-JPA-적용하기)<br>

## 1. Spring Data JPA 적용하기
mybatis 같은 매퍼 대신 JPA를 쓰는 이유? 객체지향 프로그래밍 언어인 JAVA와 SQL간의 패러다임 불일치 문제 때문.
개발자는 SQL매퍼가 아니다. SQL문 보다 비즈니스 로직에 집중할 수 있다.

### 1.1 dependency 추가
```source
dependencies {
    ...

    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'com.h2database:h2'

    ...
}
```

### 1.2 Entity 클래스 작성
```java
@Getter
@NoArgsConstructor // 기본 생성자 자동 추가
@Entity
public class Posts {

    // PK필드를 나타냄
    @Id
    // @GeneratedValues : PK 생성규칙을 나타냄
    // springboot 2.0부터 IDENTITY옵션을 추가해야 auto_increment
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 굳이 @Comumn을 추가하지 않아도 컬럼이되지만 기본값 외에 변경할 옵션이 있는 경우 사용한다.
    @Column(length = 500, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String author;

    // 해당 클래스의 빌더 패턴 클래스를 생성
    // 생성자 상단에 선언 시 생성자에 포함된 필드만 빌더에 포함
    @Builder
    public Posts(String title, String content, String author) {
        this.title = title;
        this.content = content;
        this.author = author;
    }
}
```
자바빈 규약을 생각하면서 getter/setter를 무작정 생성하는 경우가 있지만 차후 기능 변경이 복잡해진다.

그래서 Entity 클래스에서는 절대 Setter 메소드를 만들지 않는다.

해당 필드의 값 변경이 필요하면 명확히 그 목적과 의도를 나타낼 수 있는 메소드를 추가해야 한다.

주문 취소 메서드를 만든다고 가정하면
```java
public class Order {
    public void cancelOrder() {
        this.status = false;
    }

    public void 주문서비스의_취소이벤트() {
        order.cancelOrder();
    }
}
```
Setter가 없는 상황에서 어떻게 값을 채워 DB에 insert 하는가?

기본적인 구조는 생성자를 통해 최종값을 채운 후 DB에 insert한다.

값 변경이 필요한 경우 해당 이벤트에 맞는 public 메소드를 호출해 변경한다.
Builder패턴을 사용해도 된다.

Posts 클래스 생성이 끝났다면, Posts 클래스로 Database를 접근하게 해 줄 JpaRepository를 생성한다.


### 1.3 Repository Interface 작성
```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostsRepository extends JpaRepository<Posts, Long> {
}
```
단순히 Interface 생성 후, JpaRepository<Entity 클래스, PK 타입> 을 상속하면 기본적인 CRUD 메소드가 자동을 생성된다.

주의할 점은 Entity 클래스와 기본 Entity Repository는 함께 위치해야 한다는 점이다.
둘 은 아주 밀접한 관계이고, Entity 클래스는 기본 Repository 없이는 제대로 역할을 할 수가 없다.

나중에 프로젝트가 커져 도메인별로 프로젝트를 분리해야 한다면 이때 Entity 클래스와 기본 Repository는 함께 움직여야 하므로 도메인 패키지에서 관리한다.

### 1.4 Spring Data JPA 테스트 코드 작성
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
}
/*
1. @After
- Junit 단위테스트 끝날 때마다 호출
- 배포 전 테스트 수행시 테스트간 테이터 침범 예방

2. postsReporitory.save
- 테이블 posts에 insert/update 쿼리 실행
- id 값이 있다면 update, 없다면 insert 쿼리가 실행됨

3. postsRepository.findAll
- 테이블 posts에 있는 모든 데이터를 조회해오는 메소드
*/
```
별 다른 설정 없이 @SpringBootTest를 사용할 경우 H2 DB를 자동으로 실행해 준다.

출력되는 쿼리 로그 보기<br>
```source
// 쿼리 로그 보기
spring.jpa.show-sql=true
// mysql 버전으로 로그 보기
spring.jpa.hibernate.dialect=org.hibernate.dialect.MySQL5Dialect
```

### 1.5 등록 / 수정/ 조회 API 만들기
API를 만들기 위해 총 3개의 클래스가 필요하다.
- Request 데이터를 받을 Dto
- API 요청을 받을 Contoller
- 트랜젝션, 도메인 기능 간의 순서를 보장하는 Service

참고로 서비스는 비즈니스로직을 처리하는 것이 아니라 트렌젝션, 도메인 간의 순서 보장 역할만 한다.

Web(Contoller), Service, Repository, Dto, Domain 중에 비즈니스 로직을 처리하는 부분은 Domain이다.

기존의 서비스로 처리하던 방식을 '트랜젝션 스크립트'라고 한다.

모든 로직이 서비스 클래스 내부에서 처리되게 되면 서비스 계층이 무의미하며, 객체란 단순히 데이터 덩어리 역할만 하게 된다.

원래 서비스 메소드는 트랜젝션과 도메인 간의 순서만 보장해 준다. 여기서는 도메인 모델을 다룬다.

Entity와 거의 유사한 형태인데도 Dto클래스를 추가로 생성했다. Entity클래스를 Request/Response 클래스로 사용하면 안 되는 이유는 Entity 클래스는 데이터베이스와 맞닿은 핵심클래스이기 때문이다.


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

    @Test
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
        ResponseEntity<Long> responseEntity = restTemplate.postForEntity(url, requestDto, Long.class);

        // then
        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseEntity.getBody()).isGreaterThan(0L);

        List<Posts> all = postsRepository.findAll();
        assertThat(all.get(0).getTitle()).isEqualTo(title);
        assertThat(all.get(0).getContent()).isEqualTo(content);
    }
}
```
Api Controller를 테스트 하는데 HelloController와 달리 @WebMvcTest를 사용하지 않았다. @WebMvcTest의 경우 JPA 기능이 작동하지 않기 때문인데, Controller와 ControllerAdvice 등 외부 연동과 관련된 부분만 활성화되니 지금 같이 JPA 기능까지 한 번에 테스트 할 때는 @SpringBootTest와 TestRestTemplate을 사용하면 된다.


```java
@RequiredArgsConstructor
@Service
public class PostsService {

    private final PostsRepository postsRepository;

    @Transactional
    public Long save(PostsSaveRequestDto requestDto) {
        return postsRepository.save(requestDto.toEntity()).getId();
    }

    @Transactional
    public Long update(Long id, PostsUpdateRequestDto requestDto) {
        Posts posts = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다. id=" + id));
        posts.update(requestDto.getTitle(), requestDto.getContent());

        return id;
    }

    public PostsResponseDto findById(Long id) {
        Posts entity = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 사용자가 없습니다. id=" + id));
        return new PostsResponseDto(entity);
    }
}
```
update 기능에서 데이터베이스 쿼리를 날리는 부분이 없다. 이게 가능한 이유는 JPA의 영속성 컨텍스트 때문이다. 영속성 컨텍스트란 엔티티를 영구저장하는 환경을 말한다. 논리적인 개념이며, JPA의 핵심내용은 엔티티가 영속성 컨텍스트에 포함되느냐 아니냐로 갈린다.

JPA의 엔티티 매니저가 활성화된 상태로(Spring Data Jpa를 쓰면 기본 옵션) 트랜잭션 안에서 데이터베이스에서 테이터를 가져오면 이 데이터는 영속성 데이터가 유지된 상태이다. 이 상태에서 해당 데이터의 값을 변경하면 트랜젝션이 끝나는 시점에 해당 테이블에 변경분을 반영한다. 즉, Entity 객체의 값만 변경하면 별도로 Update 쿼리를 날릴 필요가 없다. 이 개념을 더티체킹이라고 한다.

업데이트 쿼리 테스트
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

    @Test
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
        ResponseEntity<Long> responseEntity = restTemplate.postForEntity(url, requestDto, Long.class);

        // then
        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseEntity.getBody()).isGreaterThan(0L);

        List<Posts> all = postsRepository.findAll();
        assertThat(all.get(0).getTitle()).isEqualTo(title);
        assertThat(all.get(0).getContent()).isEqualTo(content);
    }

    @Test
    public void posts_수정된다() throws Exception {

        // given
        Posts savedPosts = postsRepository.save(Posts.builder().title("title").content("content").author("author").build());

        Long updatedId = savedPosts.getId();
        String expectedTitle = "title2";
        String expectedContent = "content2";

        PostsUpdateRequestDto requestDto = PostsUpdateRequestDto.builder()
                .title(expectedTitle)
                .content(expectedContent)
                .build();

        String url = "http://localhost:" + port + "/api/v1/posts" + updatedId;

        HttpEntity<PostsUpdateRequestDto> requestEntity = new HttpEntity<>(requestDto);

        // when
        ResponseEntity<Long> responseEntity = restTemplate.exchange(url, HttpMethod.PUT, requestEntity, Long.class);

        // then
        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseEntity.getBody()).isGreaterThan(0L);

        List<Posts> all = postsRepository.findAll();
        assertThat(all.get(0).getTitle()).isEqualTo(expectedTitle);
        assertThat(all.get(0).getContent()).isEqualTo(expectedContent);
    }
}
```

1.5.1 H2 DB 설정하기<br>
- applications.properties에  spring.h2.console.enabled=true 추가
- http://localhost:8080/h2-console 접속
    - jdbc url : jdbc:h2:mem:testdb

### 1.6 JPA Auditing으로 생성시간/수정시간 자동화하기
보통 엔티티 클래스에는 생성시간/수정시간을 추가해서 차후 유지보수시에 중요한 정보로 사용한다.
매번 DB insert/update 전에 날짜 등록코드가 여기 저기 들어가면 복잡해지는 문제를 해결하기 위해 JPA Auditing을 사용한다.

자마8부터 LocalDate와 LocalDateTime이 생겨서 이전의 Date클래스의 문제점을 해결했으므로 적극 사용한다.

이전의 Date와 Calendar클래스는 불변객체가 아니고, 월(month)값 설계가 잘못되었다.

BaseTimeEntity 작성
```java
@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {
    
    @CreatedDate
    public LocalDateTime createdDate;
    
    @LastModifiedDate
    public LocalDateTime modifiedDate;
}
/*
1. MappedSuperclass
 JPA Entity 클래스들이 BaseTimeEntity를 상속할 경우 필드들(createdDate, modifiedDate)도 컬럼으로 인식하도록 한다.
 
2. @EntityListeners(AuditingEntityListener.class)
 BaseTimeEntity클래스에 Auditing 기능을 포함시킨다.
 
3. @CreatedDate
 Entity가 생성되어 저장될 때 시간이 자동 저장된다.
 
4. @LastModifiedDate
 조회한 Entity의 값을 변경될 때 시간이 자동 저장됩니다.
 */
```
그리고 Posts 클래스가 BaseTimeEntity를 상속받도록 변경한다.

메인 애플리케이션에 @EnableJpaAuditing 추가하여 JPA Auditing 애노테이션들을 모두 활성화 한다.
```java
@EnableJpaAuditing
@SpringBootApplication
public class MeetingApplication {

	public static void main(String[] args) {
		SpringApplication.run(MeetingApplication.class, args);
	}

}
```

Auditing 테스트코드 작성
```java
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
```
