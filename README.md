# UnJ - 일정 조율 웹 애플리케이션

When2Meet 스타일의 그룹 일정 조율 서비스입니다. 여러 참여자가 가능한 시간대를 표시하면, 모두에게 맞는 시간을 한눈에 확인할 수 있습니다.

---

## 주요 기능

### 이벤트 생성
- 이벤트 이름 입력
- 주 단위 선택 (이번 주 / 다음 주 / 다다음 주)
- 시간 범위 설정 (0:00 ~ 24:00, 30분 단위)

### 가용 시간 입력
- **드래그 선택** - 마우스 또는 터치로 시간 슬롯을 드래그하여 선택/해제
- **2단계 상태** - 가능(초록) / 가능할수도(주황) 두 가지 상태 지원
- **자동 저장** - 변경 시 500ms 디바운스 후 자동 저장
- **세로 단일 컬럼** - 하루 단위로만 드래그 가능 (날짜 간 교차 방지)

### 그룹 결과 보기
- **히트맵 시각화** - 참여자 수에 따른 색상 농도 표시
- **가능/가능할수도 분리 표시** - 슬롯별 확정/미확정 인원 구분
- **최소 연속 시간 필터** - 30분 ~ 전체 시간 범위 필터링
- **최소 참여자 수 필터** - 특정 인원 이상 가능한 시간만 표시
- **툴팁** - 호버 시 해당 시간대 참여자 이름 표시
- **참여자별 하이라이트** - 특정 참여자 클릭 시 해당 스케줄 강조

### 참여자 관리
- **이름 기반 참여** - 별도 회원가입 없이 이름만으로 참여
- **비밀번호 보호** - 참여자별 선택적 비밀번호 설정 (bcrypt 해싱)
- **참여자 필터링** - 개별 참여자 표시/숨김 토글
- **세션 유지** - localStorage 기반 자동 재참여
- **링크 공유** - 이벤트 URL 클립보드 복사

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15.1.6 (App Router) |
| UI | React 19.0.0 |
| 스타일링 | styled-components 6.1.14 |
| 데이터베이스 | MongoDB (MongoDB Atlas) |
| DB 드라이버 | mongodb 6.12.0 |
| 인증/해싱 | bcryptjs 3.0.3 |
| 빌드 도구 | Turbopack |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.js                          # 루트 레이아웃 (StyledComponents SSR 레지스트리)
│   ├── page.js                            # 홈 - 이벤트 생성 페이지
│   ├── globals.css                        # 전역 CSS
│   ├── [eventId]/
│   │   └── page.js                        # 이벤트 상세 페이지
│   └── api/
│       └── events/
│           ├── route.js                   # POST: 이벤트 생성
│           └── [id]/
│               ├── route.js               # GET: 이벤트 조회
│               ├── join/
│               │   └── route.js           # POST: 이벤트 참여 (비밀번호 검증)
│               └── participants/
│                   ├── route.js           # GET: 참여자 목록 / POST: 가용시간 업데이트
│                   └── [participantId]/
│                       └── password/
│                           └── route.js   # POST: 비밀번호 설정
├── components/
│   ├── AvailabilityGrid.jsx               # 개인 가용시간 그리드 (편집 가능)
│   ├── GroupResultGrid.jsx                # 그룹 결과 히트맵 (읽기 전용)
│   ├── WeekSelector.jsx                   # 주 단위 탭 선택
│   ├── TimeRangePicker.jsx                # 시간 범위 선택 드롭다운
│   ├── DateSelector.jsx                   # 달력 날짜 선택기
│   └── Header.jsx                         # 상단 네비게이션 헤더
├── lib/
│   ├── mongodb.js                         # MongoDB 연결 싱글턴
│   └── registry.js                        # StyledComponents SSR 레지스트리
└── styles/
    └── GlobalStyles.js                    # 전역 스타일 (라이트/다크 모드)
```

---

## API 엔드포인트

### 이벤트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/events` | 새 이벤트 생성 |
| `GET` | `/api/events/[id]` | 이벤트 상세 조회 |

### 참여자

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/events/[id]/join` | 이벤트 참여 (신규/기존 참여자 처리, 비밀번호 검증) |
| `GET` | `/api/events/[id]/participants` | 참여자 목록 조회 |
| `POST` | `/api/events/[id]/participants` | 가용시간 업데이트 (upsert) |
| `POST` | `/api/events/[id]/participants/[participantId]/password` | 참여자 비밀번호 설정 |

---

## 데이터 모델

### Event (이벤트)
```javascript
{
  _id: ObjectId,
  name: String,              // 이벤트 이름
  dates: [Date],             // 선택된 날짜 배열
  startTime: Number,         // 시작 시간 (0-24)
  endTime: Number,           // 종료 시간 (0-24)
  createdAt: Date
}
```

### Participant (참여자)
```javascript
{
  _id: ObjectId,
  eventId: String,           // 이벤트 ID
  name: String,              // 참여자 이름
  password: String | null,   // bcrypt 해시된 비밀번호 (선택)
  availability: [{           // 가용 시간 슬롯 배열
    dateIdx: Number,         // 날짜 인덱스 (0-6)
    hour: Number,            // 시간 (0-23)
    minute: Number,          // 분 (0 또는 30)
    status: String           // "available" | "maybe"
  }]
}
```

---

## 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- MongoDB Atlas 계정 또는 로컬 MongoDB

### 설치

```bash
# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

### 실행

```bash
# 개발 서버 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

---

## 사용 흐름

1. **이벤트 생성** - 홈에서 이벤트 이름, 주, 시간 범위를 설정하고 생성
2. **링크 공유** - 생성된 이벤트 URL을 참여자들에게 공유
3. **참여** - 참여자가 이름을 입력하여 이벤트에 참여
4. **시간 선택** - 드래그로 가능한 시간대를 선택 (가능 / 가능할수도)
5. **결과 확인** - 그룹 결과 히트맵에서 모두에게 맞는 시간 확인
6. **필터링** - 최소 연속 시간, 최소 참여자 수 등으로 결과 필터링

---

## 테마

라이트 모드와 다크 모드를 지원합니다. CSS 변수 기반으로 구현되어 있습니다.

| 변수 | 라이트 모드 | 다크 모드 |
|------|------------|----------|
| `--bg-primary` | `#ffffff` | `#121212` |
| `--bg-secondary` | `#f5f5f5` | `#1e1e1e` |
| `--text-primary` | `#111111` | `#ffffff` |
| `--text-secondary` | `#666666` | `#aaaaaa` |
| `--accent` | `#4CAF50` | `#4CAF50` |

---

## 성능 최적화

- **디바운스 저장** - 가용시간 변경 시 500ms 디바운스 적용
- **폴링** - 5초 간격으로 참여자 목록 갱신
- **sendBeacon** - 페이지 이탈 시 미저장 데이터 전송 보장
- **터치 최적화** - 그리드 영역 터치 스크롤 방지 (`touch-action: none`)
- **클립보드 폴백** - `navigator.clipboard` 미지원 시 `textarea + execCommand` 방식 사용

---

## 반응형 디자인

- 브레이크포인트: `768px`
- 모바일에서 그리드 좌우 스크롤 지원
- 터치 드래그 인터랙션 지원
- 모바일 최적화 패딩 및 폰트 크기
