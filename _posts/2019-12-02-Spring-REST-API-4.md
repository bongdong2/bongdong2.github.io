---
title: "Spring기반 REST API - 4"
date: 2019-12-01 09:23:30 -0400
categories: spring

---

ch4. 이벤트 조회 및 수정 REST API 개발
===================

### Event 목록 조회 API 구현
- 페이징, 정렬 어떻게 하지?
  - 스프링 데이터 JPA가 제공하는 Pageable

- Page<Event>에 안에 들어있는 Event 들은 리소스로 어떻게 변경할까?
  - 하나씩 순회하면서 직접 EventResource로 맵핑을 시킬까..
  - PagedResourceAssembler<T> 사용하기

- 테스트 할 때 Pageable 파라미터 제공하는 방법
  - page: 0부터 시작
  - size: 기본값 20
  - sort: property,property(ASC|DESC)


### Event 조회 API
- 조회하는 이벤트가 있는 경우 이벤트 리소스 확인
  - 링크
  - self
  - profile
  - (update)
  - 이벤트 데이터

- 조회하는 이벤트가 없는 경우 404 응답 확인


### Events 수정 API
- 이벤트 수정 테스트 4개를 만들고 로직 구현

  - 수정하려는 이벤트가 없는 경우 404 NOT_FOUND
  - 입력 데이터 (데이터 바인딩)가 이상한 경우에 400 BAD_REQUEST
  - 도메인 로직으로 데이터 검증 실패하면 400 BAD_REQUEST
  - (권한이 충분하지 않은 경우에 403 FORBIDDEN)
  - 정상적으로 수정한 경우에 이벤트 리소스 응답
    - 200 OK
    - 링크
    - 수정한 이벤트 데이터
    
### 테스트 코드 리팩토링
- 여러 컨트롤러 간의 중복 코드 제거하기
   - 클래스 상속을 사용하는 방법
     - BaseControllerTest.java를 만들기
     - 기존 테스트관련 애노테이션 잘라서 붙이기   
     - @Ignore 애노테이션으로 테스트로 간주되지 않도록 설정
     - 앞으로 컨트롤러 테스트를 만들 때는 BaseControllerTest를 상속받으면 된다.
