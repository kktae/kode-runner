# 카카오뱅크 x 메가존클라우드 Kode Runner 2026 - 바이브 코딩 테트리스

카카오뱅크 및 메가존클라우드 테크 부스 방문자를 위해 제작된 웹 기반 아케이드 테트리스 게임 프로젝트입니다. HTML5 Canvas 2D API, Web Audio API, Socket.io 네트워크 프로토콜을 활용하여 외부 미디어 자원 의존성 없이 높은 성능의 60fps 싱글 및 실시간 1v1 PvP 대전 환경을 제공합니다.

---

## 주요 기능

### 1. 실시간 1v1 PvP 멀티플레이 대전 (Realtime PvP Multiplayer)
- **실시간 상호작용**: Socket.io 및 Memorystore Redis 기반 네트워크 동기화를 통해 상대방의 테트리스 보드 상태, 낙하 블록, 콤보 이펙트를 실시간 관전할 수 있습니다.
- **방 생성 및 입장**: 4자리 자동 생성 난수 방 코드를 통한 비공개/공개 매칭 시스템 및 한국어 임의 닉네임 자동 생성을 지원합니다.
- **가비지 타격 메커니즘**: 연속 콤보 및 테트리스(4줄) 달성 시 상대방 보드 하단에 공격 가비지 줄을 실시간으로 발송합니다.
- **서바이벌 진검승부**: 게임 시작 후 한 유저가 블록 한계선을 초과하여 KO될 때까지 진검승부를 펼치는 클래식 서바이벌 모드가 적용되어 있습니다.

### 2. Memorystore Redis 기반 글로벌 클라우드 리더보드 (Cloud Leaderboard)
- **Redis Sorted Sets (ZADD / ZREVRANGE)**: 타임어택 및 클래식 모드의 점수를 실시간으로 저장 및 집계하여 상위 순위를 즉시 제공합니다.
- **실시간 순위 브로드캐스팅**: 스코어 등록 시 Socket.io `leaderboard_update` 이벤트를 통해 접속 중인 모든 클라이언트에 갱신된 순위를 실시간 전파합니다.

### 3. 싱글 플레이어 게임 모드 (Single Player Modes)
- **90초 타임어택 모드**: 정해진 제한 시간 동안 최고 점수를 목표로 대전을 펼치는 모드입니다.
- **클래식 가속 모드**: 10줄 클리어마다 낙하 속도가 점진적으로 가속되는 오리지널 테트리스 모드입니다.

### 4. 클린 실시간 채팅 & 도배 방지 (Clean Chat & Anti-Spam)
- **한국어 비속어 필터링**: badwords-ko 엔진 기반 이중 순화 필터링을 탑재하여 욕설 및 비속어를 자동 감지 및 마스킹 처리합니다.
- **도배 방지 쿨다운**: 1초 전송 제한 메커니즘을 적용하여 연속 메시지 및 도배를 방지합니다.
- **퀵 이모지 숏컷**: 한 번의 클릭으로 응원 및 인사를 전달할 수 있는 감정 표현 버튼을 제공합니다.

### 5. 비주얼 및 오디오 엔진 (Visual & Audio Engine)
- **7-Bag 생성 알고리즘**: 오리지널 테트리스 가이드라인 7-Bag 주머니 알고리즘(MinoFactory)을 준수하여 블록 편차 없는 공정한 대전 환경을 보장합니다.
- **High-DPI Canvas 렌더링**: 고해상도 디스플레이에 최적화된 3D 타일 그래픽 및 GSAP 기반 파티클 시스템을 탑재했습니다.
- **카카오 브랜드 비주얼**: 카카오프렌즈 테마 블록 컬러 및 Kakao Yellow 기반 UI 레이아웃을 제공합니다.
- **Web Audio API 합성 사운드**: 외부 오디오 파일 없이 브라우저 내장 신디사이저로 동적 BGM 및 효과음을 실시간 생성합니다.

---

## 기술 스택

- **Runtime & Package Manager**: Bun
- **Frontend Framework & Bundler**: Vite, TypeScript, HTML5 Canvas 2D API
- **Realtime Networking**: Socket.io, Socket.io-client, Memorystore for Redis (ioredis)
- **Profanity Filtering**: badwords-ko
- **Animation & Audio**: GSAP, Web Audio API Synthesis
- **Container & Infrastructure**: Docker, Terraform, Google Cloud Platform (GCP)
  - **GCP Compute**: Cloud Run v2 (Serverless Container)
  - **GCP Database**: Memorystore for Redis (Basic Tier 1GB)
  - **GCP Network**: Serverless VPC Access Connector (`e2-micro`)
  - **GCP Load Balancing**: Global External Application Load Balancer, Serverless NEG
  - **GCP Security & Cert**: GCP Certificate Manager (Wildcard SSL `*.your-custom-domain.com` & `your-custom-domain.com`)
  - **Custom Domain**: https://your-custom-domain.com

---

## 프로젝트 구조

```
kode-runner/
├── src/
│   ├── assets/        # 캐릭터 브랜드 자원 및 Canvas 타일 렌더러
│   ├── audio/         # Web Audio API 사운드 신디사이저 엔진
│   ├── engine/        # 게임 루프, 테트리스 보드 로직, 7-Bag MinoFactory, 파티클
│   ├── stores/        # Zustand 기반 멀티플레이어 대전 상태 관리 스토어
│   ├── types/         # TypeScript 모듈 및 타입 선언
│   ├── ui/            # 상대방 보드 렌더러, 리더보드, 콤보 배너, 모바일 컨트롤러
│   ├── utils/         # 한국어 비속어 필터, 닉네임 생성기, 리더보드 유틸
│   ├── main.ts        # 애플리케이션 메인 컨트롤러 및 DOM 이벤트 핸들러
│   └── style.css      # E-Sports 3열 832px 정밀 그리드 디자인 시스템
├── server/            # Socket.io 멀티플레이 대전 및 Redis 아키텍처 서버
├── terraform/         # GCP Serverless 인프라 자동화 HCL 모듈 (Cloud Run, Load Balancer, Certificate Manager)
├── scripts/
│   └── deploy.sh      # 원클릭 GCP 배포 자동화 파이프라인 스크립트
├── Dockerfile         # 컨테이너 멀티스테이지 linux/amd64 빌드 명세
├── docker-compose.yml # 애플리케이션 및 Redis 컨테이너 연동 설정
├── index.html         # 메인 HTML 구조
├── package.json       # 프로젝트 의존성 및 스크립트
├── tsconfig.json      # TypeScript 컴파일 설정
└── vite.config.ts     # Vite 번들러 설정
```

---

## 실행 및 배포 가이드

### 개발 환경 실행 (Bun)

1. **의존성 패키지 설치**
```bash
bun install
```

2. **개발 서버 실행**
```bash
bun run dev
```
브라우저에서 `http://localhost:5173` 접속하여 실행을 확인합니다.

3. **프로덕션 번들 빌드**
```bash
bun run build
```

---

### Docker Local 실행

Docker Compose를 사용하여 Socket.io 게임 서버, 웹 클라이언트, Redis 인메모리 데이터베이스를 한 번에 컨테이너로 배포할 수 있습니다.

```bash
docker compose up -d --build
```
서비스가 실행되면 `http://localhost:3000` 접속을 통해 완벽하게 연동된 실시간 멀티플레이 테트리스를 이용할 수 있습니다.

---

### GCP Serverless 원클릭 프로덕션 배포

프로젝트 루트의 배포 스크립트를 통해 Docker 이미지 빌드, Artifact Registry 푸시, Terraform 인프라 프로비저닝을 한 번에 자동화할 수 있습니다.

```bash
bun run deploy
# 또는
bash scripts/deploy.sh
```

배포 완료 시 할당된 **Global Load Balancer Static IP (예: <LOAD_BALANCER_IP>)**와 **https://your-custom-domain.com** URL이 출력됩니다.
