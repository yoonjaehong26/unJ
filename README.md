# UnJ - 일정 조율 웹 애플리케이션

When2Meet 스타일의 그룹 일정 조율 서비스입니다. 여러 참가자가 가능한 시간대를 표시하면, 모두에게 맞는 시간을 한눈에 확인할 수 있습니다. 로그인 없이 이름만으로 참가하며, **방장 권한**, **익명 모드**, **개인 일정 저장/재사용** 기능을 지원합니다.

배포 주소: [www.unj.kr](https://www.unj.kr)

---

## 핵심 기능 한눈에 보기

| 기능 | 설명 |
|------|------|
| 이벤트 생성 | 이름·주·요일·시간 범위 선택, 익명 모드 토글 |
| 방장(Admin) | 생성자에게 발급되는 `adminToken`으로 시간·요일 사후 수정 / 참가자 삭제 |
| 익명 모드 | 참가자끼리 이름 대신 동물 별칭으로 표시 (방장·본인만 실명 확인) |
| 가용시간 입력 | 30분 단위 드래그 그리드 (가능 / 조정가능 2단계) |
| 그룹 결과 | 전체 참가자 가용시간 히트맵 + 연속시간·최소인원 필터 |
| 참가자 인증 | 이름 기반 참가 + 선택적 비밀번호(bcrypt) 보호 |
| 내 일정 | 요일별 개인 가용시간을 localStorage에 저장 → 어느 방에서나 가져오기 |
| 일정 가져오기 | 다른 참가한 방 / 내 일정에서 현재 방으로 가용시간 복사 |
| 최근 참가한 방 | 홈에서 최근 방·방장 링크 빠르게 재접근 |
| 다크/라이트 | 헤더 토글, `data-theme` + localStorage |
| SEO | OpenGraph 이미지, sitemap, robots, 메타데이터 |

---

## 기능 상세

### 1. 이벤트 생성 (`CreateEventForm`)

| 항목 | 설명 |
|------|------|
| 이벤트 이름 | 자유 텍스트 입력 |
| 주 선택 | 이번 주 / 다음 주 / 다다음 주 탭 (`WeekSelector`) |
| 요일 선택 | 월~일 중 원하는 요일만 토글 (선택한 요일의 날짜만 생성) |
| 시간 범위 | 시작·종료 시간 드롭다운 (`TimeRangePicker`, 기본 09:00~18:00) |
| 익명 모드 | 토글 ON 시 참가자에게 동물 별칭 표시 |
| 생성 결과 | MongoDB 저장 후 **방장 링크**와 **공유 링크** 두 개를 발급 |

생성 직후 두 종류의 링크가 표시됩니다.

- **방장 링크** (`/{eventId}?admin={adminToken}`) — 시간·요일 수정 권한. 생성자만 보관.
- **공유 링크** (`/{eventId}`) — 참가자에게 전달.

---

### 2. 방장(Admin) 시스템

이벤트 생성 시 `adminToken`(UUID)이 발급되며, URL 쿼리 `?admin={token}`으로 방장 권한이 활성화됩니다.

**방장 전용 기능**

- **이벤트 설정 수정**: 시간 범위, 표시 요일 변경 (`PATCH /api/events/[id]`, 서버에서 `adminToken` 검증)
- **참가자 삭제**: `DELETE /api/events/[id]/participants/[participantId]` (방장 토큰 필요)
- **익명 모드에서 실명 확인**: 참가자 목록 조회 시 `adminToken`을 넘기면 실명이 노출됨

> ⚠️ 참가자가 있는 상태에서 요일/날짜를 바꾸면 기존 가용시간 데이터의 날짜 인덱스가 어긋날 수 있어 경고 문구가 표시됩니다.

---

### 3. 익명 모드

이벤트의 `anonymous: true`일 때 동작합니다.

- 각 참가자는 가입 순서대로 `aliasIndex`를 부여받아 **동물 이모지 + 이름** 별칭으로 표시됩니다 (`src/lib/animals.js`, 예: `🦊여우`).
- 다른 참가자에게는 별칭만, **방장과 본인에게는 `🦊여우(홍길동)`** 형태로 실명이 함께 노출됩니다.
- 별칭 풀이 39개(`ANIMALS.length`)이므로 익명 방의 최대 참가 인원은 39명(`MAX_ANONYMOUS_PARTICIPANTS`)입니다.

---

### 4. 가용시간 그리드 (`AvailabilityGrid`)

30분 단위의 편집 가능한 가용시간 입력 그리드. `mode` 프롭으로 두 가지 용도로 재사용됩니다.

| `mode` | 컬럼 기준 필드 | 사용처 |
|--------|---------------|--------|
| `"event"` | `dateIdx` (이벤트 날짜 인덱스) | 이벤트 페이지 "내 가용시간" |
| `"personal"` | `dayOfWeek` (요일 0=월~6=일) | 홈 "내 일정", 일정 가져오기 미리보기 |

**입력 모드** — 그리드 상단 토글로 선택

| 모드 | 색상 | 의미 |
|------|------|------|
| 🟢 가능 | 초록 `#4CAF50` | 확실히 가능한 시간 |
| 🟡 조정가능 | 주황 `#F5A623` | 조정 시 가능한 시간 |

**드래그 인터랙션**
1. `mousedown`/`touchstart`: 시작 슬롯 상태에 따라 select/deselect 모드 결정
2. `mouseenter`/`touchmove`: 시작~현재 슬롯 인덱스의 min~max 범위 일괄 적용
3. 열(컬럼) 고정: 드래그 시작한 컬럼 외의 슬롯은 무시
4. 탭과 드래그 구분(`touchHasDraggedRef`)으로 모바일 단일 토글/드래그 분리
5. `readOnly`일 때 클릭하면 `onReadOnlyClick` 호출 (참가 전 이름 입력 유도 등)

**저장 흐름 (이벤트 페이지)**
```
슬롯 변경 → onChange → 500ms 디바운스 → POST /api/events/[id]/participants
                                          → participants state 즉시 갱신
언마운트 시 미저장분 → navigator.sendBeacon 으로 전송
```

---

### 5. 그룹 결과 그리드 (`GroupResultGrid`)

전체 참가자의 가용시간을 집계한 읽기 전용 히트맵.

- **색상 강도**: `opacity = 0.2 + (해당 인원 / 전체 인원) × 0.8`
- 가능/조정가능 혼재 슬롯은 좌(초록)·우(주황) 분할 그라데이션
- **연속 시간 필터**: 연속 N슬롯 × 최소 M명 조건을 만족하는 블록에 `inset box-shadow` 테두리 (초록=가능만으로 충족 / 노랑=가능+조정가능 합산 충족)
- **최소 인원 필터**: N명 이상 가능한 슬롯만 강조
- **참가자 하이라이트**: 참가자 태그를 클릭하면 해당 참가자 슬롯을 컬러 아웃라인으로 강조, 나머지는 흐리게. **여러 명을 동시에** 선택 가능하며 각자 다른 색(`PARTICIPANT_COLORS`)이 배정됨
- **툴팁**: 슬롯 hover 시 시간대별 참가자 이름을 가능/조정가능으로 구분 표시

---

### 6. 참가자 인증

- 이름만으로 참가. 같은 이름 재입력 시 기존 데이터를 불러옴.
- 선택적 **비밀번호**로 이름 보호 (bcryptjs `saltRounds: 12`, 평문 미저장)
  - 비밀번호 설정된 이름으로 접속 → 비밀번호 입력 모달
  - 검증 성공 시에만 편집 가능
- `localStorage` 키 `unj-participant-{eventId}`에 `{ name }` 저장 → 재방문 시 자동 복원(비밀번호 없이)

---

### 7. 내 일정 & 일정 가져오기

방마다 매번 시간을 다시 칠하지 않도록, 개인 가용시간을 재사용하는 기능입니다.

- **내 일정** (`MyScheduleSection`, 홈): 요일 기반(`dayOfWeek`) 가용시간을 `localStorage`(`unj-my-schedule`)에 저장
- **일정 가져오기** (`ScheduleImportExport`, 이벤트 페이지 FAB 📋):
  - 소스 선택 — "내 일정" 또는 "최근 참가한 다른 방"
  - 미리보기 후 현재 방의 가용시간으로 변환·적용
  - 변환 로직(`src/lib/mySchedule.js`)이 `dayOfWeek` ↔ `dateIdx`를 상호 매핑

---

### 8. 최근 참가한 방 (`VisitedEventsSection`)

홈 화면에서 최근 참가/생성한 방 목록(`unj-visited-events`, 최대 3개)과 공유·방장 링크를 빠르게 다시 열 수 있습니다.

---

### 9. 테마 & SEO

- **테마**: `Header`의 토글로 다크/라이트 전환, `data-theme` 속성 + `localStorage`, 최초엔 OS 설정(`prefers-color-scheme`) 따름
- **SEO**: `layout.js` 메타데이터(OpenGraph/Twitter), 동적 OG 이미지(`opengraph-image.js`), `sitemap.js`, `robots.js` (`/api/` 차단)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15.1.6 (App Router) |
| UI | React 19.0.0 |
| 스타일링 | styled-components 6.1.14 (SSR 레지스트리) + CSS 변수 |
| 데이터베이스 | MongoDB 6.12.0 (Atlas) |
| 인증/해싱 | bcryptjs 3.0.3 |
| 빌드 | Turbopack (dev) |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.js                       # 루트 레이아웃, 메타데이터, Header, SSR 레지스트리
│   ├── page.js                         # 홈 (CreateEventForm + MyScheduleSection + VisitedEventsSection)
│   ├── globals.css
│   ├── opengraph-image.js              # 동적 OG 이미지
│   ├── sitemap.js / robots.js          # SEO
│   ├── [eventId]/page.js               # 이벤트 상세 (참가/그리드/방장 패널/모달)
│   └── api/events/
│       ├── route.js                    # POST 생성 (adminToken 발급)
│       └── [id]/
│           ├── route.js                # GET 조회 / PATCH 방장 수정
│           ├── join/route.js           # POST 참가 (비번 검증, 익명 별칭 부여)
│           └── participants/
│               ├── route.js            # GET 목록(익명 별칭 처리) / POST 가용시간 upsert
│               └── [participantId]/
│                   ├── route.js        # DELETE 참가자 삭제 (방장)
│                   └── password/route.js # POST 비밀번호 설정
├── components/
│   ├── CreateEventForm.jsx             # 이벤트 생성 폼
│   ├── AvailabilityGrid.jsx           # 가용시간 그리드 (event/personal 모드)
│   ├── GroupResultGrid.jsx           # 그룹 결과 히트맵
│   ├── ScheduleImportExport.jsx       # 일정 가져오기 모달(FAB)
│   ├── MyScheduleSection.jsx          # 홈 - 내 일정
│   ├── VisitedEventsSection.jsx       # 홈 - 최근 참가한 방
│   ├── WeekSelector.jsx               # 주 선택 + getWeekDates 유틸
│   ├── TimeRangePicker.jsx            # 시간 범위 선택
│   ├── DateSelector.jsx               # 날짜 선택기
│   └── Header.jsx                     # 헤더 + 테마 토글
├── lib/
│   ├── mongodb.js                     # MongoDB 연결 싱글턴
│   ├── animals.js                     # 익명 모드 동물 별칭
│   ├── mySchedule.js                  # 내 일정 localStorage + dayOfWeek↔dateIdx 변환
│   ├── visitedEvents.js               # 방문 방/방별 일정 localStorage
│   └── registry.js                    # styled-components SSR 레지스트리
└── styles/
    └── GlobalStyles.js                # CSS 변수 (다크/라이트)
```

---

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/events` | 이벤트 생성 → `{ eventId, adminToken }` |
| `GET` | `/api/events/[id]` | 이벤트 조회 (`anonymous` 포함) |
| `PATCH` | `/api/events/[id]` | 방장: 시간/요일 수정 (`adminToken` 검증) |
| `POST` | `/api/events/[id]/join` | 참가 (비밀번호 검증, 익명 별칭 부여) |
| `GET` | `/api/events/[id]/participants` | 참가자 목록 (`adminToken`/`participantId`로 실명 노출 제어) |
| `POST` | `/api/events/[id]/participants` | 가용시간 upsert |
| `DELETE` | `/api/events/[id]/participants/[participantId]` | 방장: 참가자 삭제 |
| `POST` | `/api/events/[id]/participants/[participantId]/password` | 비밀번호 설정 |

---

## 데이터 모델

### Event
```javascript
{
  _id: ObjectId,
  name: String,
  dates: [Date],          // 선택된 요일의 날짜 배열 (최대 7)
  startTime: Number,      // 0-23
  endTime: Number,        // 1-24
  adminToken: String,     // UUID, 방장 권한
  anonymous: Boolean,     // 익명 모드 여부
  createdAt: Date
}
```

### Participant
```javascript
{
  _id: ObjectId,
  eventId: ObjectId,      // 이벤트 참조
  name: String,           // 실명
  aliasIndex: Number,     // 익명 모드 별칭 인덱스 (익명 방에서만)
  password: String|null,  // bcrypt 해시 (선택)
  availability: [{
    dateIdx: Number,      // 날짜 인덱스 (0-6)
    hour: Number,         // 0-23
    minute: Number,       // 0 | 30
    status: String        // "available" | "maybe"
  }],
  createdAt: Date,
  updatedAt: Date
}
```

> 내 일정(localStorage)의 슬롯은 `dateIdx` 대신 `dayOfWeek`(0=월~6=일)를 사용합니다.

---

## 설치 및 실행

### 사전 요구사항
- Node.js 18 이상
- MongoDB Atlas 계정 또는 로컬 MongoDB

### 설치 & 환경 변수
```bash
npm install
```

프로젝트 루트에 `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

### 실행
```bash
npm run dev      # 개발 서버 (Turbopack, http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 실행
npm run lint     # ESLint
```

---

## 실시간 동작 / 성능

- **폴링**: 5초마다 참가자 목록 갱신 (내 가용시간은 로컬 state 우선, 폴링이 덮어쓰지 않음)
- **디바운스 저장**: 가용시간 변경 시 500ms
- **sendBeacon**: 페이지 이탈 시 미저장 데이터 보장
- **터치 최적화**: 그리드 `touch-action: none`, 탭/드래그 구분
- **클립보드 폴백**: `navigator.clipboard` 미지원 시 `textarea + execCommand`

---

## 반응형

- 브레이크포인트 `768px`
- 모바일에서 "내 일정 / 그룹 결과" 탭으로 그리드 전환 (좌우 2분할 → 단일 컬럼)
- 터치 드래그 지원
