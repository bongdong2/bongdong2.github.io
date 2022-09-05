---
title: "springboot & AWS - AWS RDS"
date: 2020-01-07 12:50:00 -0400
categories: spring
---

AWS에 DB 환경을 만들어 보자

### 목차
[1. AWS RDS](#1-aws-rds)<br>
[1.1 RDS 인스턴스 생성하기](#11-rds-인스턴스-생성하기)<br>
[1.2 RDS 운영환경에 맞는 파라미터 설정하기](#12-rds-운영환경에-맞는-파라미터-설정하기)<br>
[1.3 내 PC에서 RDS 접속하기](#13-내-pc에서-rds-접속하기)<br>
[1.4 EC2에서 RDS에서 접근 확인](#14-ec2에서-rds에서-접근-확인)<br>


## 1. AWS RDS
데이터 베이스를 구축하고 앞 에서 만든 EC2 서버와 연동을 해야 한다. 직접 데이터베이스를 설치하지는 않는다. 직접 DB를 설치해서 다루게 되면 모니터닝, 알람, 백업, HA 구성 등을 모두 직접 해야만 한다. 처음 구축 시 며칠이 걸릴 수 있다.

AWS에서는 앞에서 언급한 작업을 모두 지원하는 RDS(Relational Database Service)를 제공한다. RDS는 AWS에서 지원하는 클라우드 기반 관계형 데이터베이스이다. 하드웨어 프로비저닝, 데이터베이스 설정, 패치 및 백업과 같이 잦은 운영 작업을 자동화하여 개발자가 개발에 집중할 수 있게 지원하는 서비스다. 추가로 조정 가능한 용량을 지원하여 예상치 못한 양의 데이터가 쌓여도 비용만 추가로 내면 정상적으로 서비스가 가능한 장점도 있다.

### 1.1 RDS 인스턴스 생성하기
- AWS 검색창에 RDS를 입력해서 선택하고 대시보드로 들어가 데이터베이스 생성 버튼을 누른다.
- DB 엔진 선택 화면
    - 표준생성
    - MariaDB
    - 프리티어
    - 스토리지 20GiB
    - 스토리지 자동 조정 활성화 해제
    - 퍼블릭 엑세스 기능 '예'

### 1.2 RDS 운영환경에 맞는 파라미터 설정하기
RDS를 처음 생성하면 몇 가지 설정을 필수로 해야 한다.
1. 타임존
2. Character Set
3. Max Connection


- 파라미터 그룹 탭 클릭
- 파라미터 그룹 생성 버튼 클릭
- DB엔진 선택 -> 방금 생성한 MarioDB와 같은 버전
- 생성 버튼 클릭
- 생성된 그룹 선택
- 파라미터 편집 버튼을 선택해 편집 모드로 전환
    - time_zone > asia/seoul
    - character_set > uf8mb4
    - max_connection > 150
- 생성된 파라미터 그룹을 데이터베이스에 연결
    - 데이터베이스 옵션 > DB 파라미터 그룹 선택
    - 즉시적용
    - 재부팅(재부팅을 해야 위의 수정사항들이 적용되었다.)

### 1.3 내 PC에서 RDS 접속하기
로컬 PC에서 RDS로 접근하기 위해서는 RDS의 보안 그웁에 본인의 PC IP를 추가해야 한다.

- EC2에 사용된 보안 그룹의 그룹 ID를 복사한다.
- 복사된 보안 그룹 ID와 본인의 IP를 RDS 보안 그룹의 인바운드로 추가한다.
- 인바운드 규칙 유형으로 MYSQL/Aurora를 선택한다.
    - 보안 그룹 첫 번째 줄 : 현재 내 PC의 IP를 등록
    - 보안 그룹 두 번째 줄 : EC2의 보안 그룹을 추가
        - 이렇게 하면 EC2와 RDS간에 접근이 가능하다
- Intellij database 탭을 열고 접속을 한다.
    - mysql 선택하고 HOST에 엔드포인트를 입력한다.
    - User / Password 입력후 Apply / OK
- SQL 콘솔창을 연다.
    - 쿼리가 수행될 db 선택
        - use 'AWS RDS 웹 콘솔에서 지정한 데이터베이스';
            - 여기서 DB를 못 찾는 경우, new schema로 하나 만든다.
            - 책에서는 웹 콘솔로 만든 DB가 있다고 했으나, 나는 없어서 그냥 만듬.
    - 현재의 chracter_set, collation 설정 확인
        - show variables like '%c';
    - character_set_database, collation_connection 2가지가 RDS파라미터 그룹으로 변경이 안 되는 경우
        - ALTER DATABASE 데이터베이스명
        - CHARACTER SET = "utf8mb4'
        - COLLATE = 'utf8mb4_general_ci';
            - 책에서는 안 됐는데 나는 RDS파라미터로 변경이 잘 되었다.
    - 타임존 확인
        - select @@time_zone, now();
    - 마지막으로 한글명이 잘 들어가는지 간단한 테이블 생성과 insert 쿼리 실행
        ```sql
        CREATE table `springboot-webservice`.test (
                      id bigint(20) not null auto_increment,
                      content varchar(255) default null,
                      primary key (id)
        ) ENGINE = InnoDB;

        insert into test(content) values ('테스트');

        select * from test;
        ```

### 1.4 EC2에서 RDS에서 접근 확인
- EC2에 ssh 접속을 한다.
    - ssh 서비스명(webservice)
- MySQL CLI 설치
    - sudo yum install mysql
- 설치가 다 되면 로컬에서 접근하듯이 계정, 비번, 호스트 주소를 사용해 RDS에 접속한다.
    - mysql -u '계정' -p -h 'Host 주소'
    - password 입력
    - mysql에 접속이 성공한다.
    - 실제로 생성한 RDS가 맞는지 간단 쿼리 날리기
        - show databases;