# 카카오뱅크 Kode Runner 2026 - 바이브 코딩 테트리스 (Vibe Coding Tetris)

카카오 기업 파트너 부스 방문자를 위해 제작된 웹 기반 아케이드 테트리스 게임 프로젝트입니다. HTML5 Canvas 2D API와 Web Audio API를 활용하여 외부 미디어 자원 의존성 없이 고성능 60fps 게임 플레이 환경을 제공합니다.

---

## 주요 기능 (Core Features)

### 게임 모드 (Game Modes)
- **90초 타임어택 모드**: 정해진 제한 시간 동안 최고 점수를 목표로 하는 부스 이벤트 전용 모드입니다.
- **클래식 가속 모드**: 10줄 클리어마다 낙하 속도가 점진적으로 가속되는 오리지널 테트리스 모드입니다.

### 비주얼 및 게임 엔진 (Visual & Engine)
- **High-DPI Canvas 렌더링**: 레티나 및 고해상도 디스플레이에 최적화된 3D Gem 타일 그래픽 및 파티클 시스템을 탑재했습니다.
- **카카오프렌즈 캐릭터 블록**: 테트리스 테트리미노 7종(I, J, L, O, S, T, Z)에 라이언, 어피치, 춘식이, 무지, 프로도, 네오, 튜브 테마 컬러를 적용했습니다.
- **GSAP 애니메이션 모션**: 콤보 연속 달성 시 화면 쉐이크 및 타이포그래피 모션 효과를 연출합니다.

### 오디오 엔진 (Audio Engine)
- **Web Audio API 합성 사운드**: 외부 오디오 파일 없이 브라우저 내장 신디사이저로 동적 BGM 및 가속 피치 효과음을 실시간 생성합니다.

### 사용자 편의성 (User Experience)
- **리더보드 관리**: LocalStorage 기반으로 모드별 최고 점수 TOP 5를 기록하며, 닉네임 검색 및 순위 조회가 가능합니다.
- **모바일/터치 지원**: 반응형 인터페이스 및 모바일 터치 패드 컨트롤러를 지원합니다.

---

## 프로젝트 구조 (Project Structure)

```
kode-runner/
├── src/
│   ├── assets/        # 캐릭터 정보 및 Canvas 타일 렌더러
│   ├── audio/         # Web Audio API 사운드 신디사이저 엔진
│   ├── engine/        # 게임 루프, 테트리스 보드 로직, 파티클 엔진
│   ├── types/         # TypeScript 타입 정의
│   ├── ui/            # 리더보드, 콤보 배너, 모바일 터치 컨트롤러
│   ├── main.ts        # 애플리케이션 진입점 및 이벤트 바인딩
│   └── style.css      # CSS 시스템 스타일시트
├── docs/              # 설계 문서 및 개발 계획서
├── index.html         # 메인 HTML 구조
├── package.json       # 프로젝트 의존성 및 스크립트
├── tsconfig.json      # TypeScript 설정
└── vite.config.ts     # Vite 번들러 설정
```

---

## 기술 스택 (Tech Stack)

- **Runtime & Bundler**: Bun, Vite
- **Language**: TypeScript
- **Graphics Engine**: HTML5 Canvas 2D API
- **Audio Engine**: Web Audio API Synthesis
- **Animation**: GSAP (GreenSock Animation Platform)

---

## 개발 및 빌드 환경 (Getting Started)

### 요구 사항
- Bun 1.0 이상 또는 Node.js 18 이상

### 의존성 설치
```bash
bun install
```
또는 npm 사용 시:
```bash
npm install
```

### 개발 서버 실행
```bash
bun run dev
```
브라우저에서 `http://localhost:5173` 접속하여 실행 확인이 가능합니다.

### 프로덕션 빌드
```bash
bun run build
```
빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

---

## 미구현 기능 및 향후 개선 방향 (Future Roadmap & Unimplemented Features)

현재 클라이언트 중심 단일 데모 버전에서 확장하여, 엔터프라이즈 부스 운영 및 글로벌 스케일 환경을 고려한 아키텍처 개선 로드맵입니다.

### 1. 실시간 1v1 멀티플레이어 배틀 (Realtime PvP Multiplayer)
- **WebRTC / WebSocket (Socket.io) 기반 P2P 및 게임 서버 통신**:
  - 유저 간 실시간 대전 화면 동기화 및 콤보/가비지 라인(Garbage Attack Line) 메커니즘 탑재.
  - 클라이언트 사이드 예측(Client Prediction) 및 결정론적(Deterministic) 상태 동기화 처리.

### 2. 서버리스 리더보드 실시간 동기화 (Serverless Leaderboard Sync)
- **Edge DB / Distributed Key-Value (Upstash Redis / Supabase) 구축**:
  - 기존 브라우저 `localStorage` 단일 기기 기록 방식에서 **Upstash Redis (Sorted Set)** 또는 **Supabase** 기반 서버리스 DB로 리팩토링.
  - 행사 방문객 전체 통합 실시간 랭킹 산출 및 SSE/WebSocket을 통한 부스 대형 전광판 자동 스코어 스트리밍.

### 3. 서버리스 수평 확장 아키텍처 (Serverless Horizontal Scaling)
- **Cloudflare Workers / Vercel Edge Serverless Functions**:
  - API 백엔드를 글로벌 Edge Network 서버리스 환경에 배포하여 저지연(Low-Latency) API 응답 확보.
  - 부스 트래픽 폭주 시에도 전용 서버 관리 부담 없이 **자동 수평 확장(Auto-scaling)** 대응.

### 4. 점수 조작 방지 및 무결성 검증 (Anti-Cheat & Validation System)
- **백엔드 게임 세션 재검증 (Server-side Session Validation)**:
  - 단순 클라이언트 점수전송 방식의 스푸핑(Score Spoofing) 방지.
  - 게임 개시 시 암호화 세션 토큰(`gameSessionId`) 발급 및 유저 조작 시퀀스(Input Command Stream) 백엔드 검증.

---

## 환경 설정 및 보안 (Security & Config)

- **환경 변수**: 개발 환경 설정이 필요한 경우 `.env.example` 파일을 복사하여 `.env` 또는 `.env.local`로 사용합니다.
- **보안 규칙**: API 키, 개인 보안 키(`*.pem`, `*.key`), `.env` 파일 및 빌드 아티팩트(`dist/`)는 Git 추적 대상에서 제외되어 있습니다.

---

## 상표권 명시 및 면책 조항 (Trademark & Legal Disclaimer)

### 1. 상표권 및 저작권 명시 (Trademark & Copyright Notice)
- '카카오(Kakao)', '카카오뱅크(kakaobank)', '카카오프렌즈(Kakao Friends)' 및 해당 캐릭터(라이언, 어피치, 춘식이, 무지, 프로도, 네오, 튜브 등)의 명칭, 브랜드 로고, 상표권 및 지적 재산권은 **주식회사 카카오** 및 **주식회사 카카오뱅크**에 귀속되어 있습니다.
- 본 프로젝트는 비상업적 부스 체험 및 기술 시연 목적으로 제작된 데모 프로젝트이며, 카카오 공식 보증을 의미하지 않습니다.

### 2. 면책 조항 (Disclaimer of Liability)
- 본 소프트웨어는 어떠한 명시적 또는 묵시적 보증 없이 **"있는 그대로(AS IS)"** 제공됩니다.
- 개발자 및 기여자는 본 소프트웨어의 사용, 미사용 또는 작동으로 인해 발생하는 어떠한 직·간접적 손해, 데이터 손실, 서비스 중단 또는 법적 분쟁에 대해 일체의 책임을 지지 않습니다.
