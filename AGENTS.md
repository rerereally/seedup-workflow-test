# 요구사항 관리 부재

Instructions for coding agents (Codex and others) working in this repository.

<!-- Seedup brief: project=prd:b078f499-da46-47b7-8cd4-9ea683af4a43 goal=none prd=88f43a434e9e787f -->

On session start or after resuming or compaction, pass the full version line above as the `brief` argument to `resume_project`.


> HYPOTHESIS DRAFT: the evidence is below the qualification bar. Confirm with real users before building beyond a prototype.

## Project key
`prd:b078f499-da46-47b7-8cd4-9ea683af4a43`

## Rules
- Ship one feature at a time and keep each change small.
- For a Seedup project, at session start or after compaction or resuming, call resume_project {"project":"prd:b078f499-da46-47b7-8cd4-9ea683af4a43"} before working, then get_next_task {"slug":"prd:b078f499-da46-47b7-8cd4-9ea683af4a43"} to pick a feature. Before stopping, leave a handoff with save_handoff for the same project.
- For a Seedup project, call update_feature_status when each feature starts (in_progress) and ends (done with checks or blocked).
- Name the PRD feature in the commit message, for example Implements F-03 (R-2 ← E-5, E-9).
- If the user has enabled commit uploads for this project, call link_commit after each commit with the project key, commit SHA, message, and changed files (`git diff --name-only HEAD~1`).
- Every feature must trace to a requirement and every requirement to user evidence below. Do not add work that has no source. Ask first.
- When a readiness slot says "open question", ask instead of guessing.
- Treat these unverified ideas as out of scope until validated: H-01 사용자는 요구사항 항목을 만들고 현재 문구를 확인할 수 있어야 한다, H-02 사용자는 요구사항을 바꿀 때마다 이전 문구를 이력으로 남길 수 있어야 한다.

## Goal
프로젝트 요구사항이 계속 바뀌는 개발자가, 요구사항을 만들고 바뀐 이력을 추적하도록 돕는 관리 도구.

## Problem
요구사항은 프로젝트 도중 계속 바뀐다. 범위는 늘었다 줄고, 문제 영역도 진화하며, 이런 누적은 피할 수 없다[E-3]. 그런데 언제든 지금 요구사항이 무엇인지 답하기가 쉽지 않다는 실패가 반복된다[E-1]. 요구사항을 도출하는 일은 오래전부터 큰 불편으로 남아 있지만 제대로 풀리지 않았다[E-2]. 지금 사람들은 범용 문서 도구나 요구사항 관리 도구로 버티는 것으로 보이나, 이 방식이 변경 이력을 안정적으로 추적하는지는 원문이 말하지 않는다.

## Technical design

### Architecture
로컬 웹 앱이 브라우저 화면에서 입력을 받고, 서버가 항목과 이력을 저장소에 기록한다. 조회 요청은 저장소에서 현재 문구와 이력을 읽어 화면에 보여 준다.

### Data model
- Requirement: id, title, currentBody, status(활성/삭제됨), createdAt
- ChangeLog: id, requirementId, previousBody, newBody, reason, changedAt

### Interfaces
- POST /requirements: 제목과 본문을 받아 항목을 만들고 항목 번호를 돌려준다.
- GET /requirements/{id}: 항목 번호를 받아 현재 문구와 상태를 돌려준다.
- PATCH /requirements/{id}: 새 문구와 변경 이유를 받아 이력을 추가하고 갱신된 항목을 돌려준다. 이유가 비어 있으면 400을 돌려준다.
- GET /requirements/{id}/history: 항목 번호를 받아 최신순 이력을 돌려준다.

### Stack and rationale
- TypeScript와 Node.js: 웹 화면과 서버를 한 언어로 만들어 첫 버전 범위를 작게 유지한다.
- SQLite: 파일 하나로 저장소를 만들 수 있어 설치 없이 항목과 이력을 보관한다.

### Implementation order
1. 수정 시 이전 문구를 이력에 남기고 이력을 조회한다 (F-01, F-02)
2. 삭제 상태 기록과 도출 질문 목록을 추가한다 (F-01, F-03)


## Features
- [ ] F-01 변경 기록 남기기
  - 항목 번호, 새 문구, 변경 이유를 받아 이전 문구를 이력에 추가하고, 항목 삭제와 되살리기 상태를 함께 기록한다.
  - Serves: R-02 사용자는 요구사항 항목을 추가하거나 삭제 표시로 범위 변화를 기록할 수 있어야 한다 (evidence E-3)
  - Acceptance: 항목을 삭제하면 목록에서 "삭제됨" 상태로 바뀌고 이력은 그대로 남는다. / 삭제된 항목을 되살리면 상태가 "활성"으로 바뀌고 이력에 되살린 시각이 추가된다.
- [ ] F-02 이력 조회
  - 항목 번호를 받아 변경 이력을 최신순으로 돌려주고, 선택한 이력의 시점 문구를 돌려준다.
  - Serves: R-01 사용자는 한 항목의 변경 이력을 시간 순서대로 볼 수 있어야 한다 (evidence E-1, E-3)
  - Acceptance: 항목 번호를 입력하면 변경 이력이 최신순으로 나오고, 각 줄에 시각, 이유, 바뀐 문구가 보인다. / 이력 항목을 고르면 그 시점의 문구가 그대로 보인다.
- [ ] F-03 도출 질문 제시
  - 항목 하나를 받아 도출을 돕는 질문 목록을 돌려준다.
  - Serves: R-03 사용자는 요구사항 도출을 돕는 질문 목록을 받을 수 있어야 한다 (evidence E-2)
  - Acceptance: 항목 하나를 고르면 "이 요구사항이 해결하는 문제는 무엇인가?" 같은 질문 3개 이상이 나온다.

## Screens, in order (a draft, confirm with users)
S-01. 요구사항 목록 화면: 프로젝트의 요구사항 항목들을 훑어보고 변경하거나 이력을 확인할 항목을 고른다. (F-02)
S-02. 요구사항 편집 화면: 선택한 항목의 새 문구와 변경 이유를 입력해 저장한다. (F-01)
S-03. 변경 이력 화면: 항목의 변경 이력을 최신순으로 보고 특정 시점의 문구를 열어 확인한다. (F-02)
S-04. 도출 질문 패널: 항목을 다듬을 때 떠오르지 않던 관점을 제공하는 질문 목록을 읽고 참고한다. (F-03)

## Do not build
- 요구사항 도출을 자동으로 대신 생성하지 않는다. 원문은 도출의 어려움을 말하지만, 자동 도출의 방법은 근거가 없다.
- 코드와 요구사항의 연결이나 테스트 추적은 첫 버전에서 다루지 않는다.
- 여러 사람이 동시에 편집하는 협업 기능은 첫 버전에서 다루지 않는다.

## Done when
- 변경 이력 누락 0건. 측정: 테스트 프로젝트에서 수정 100회를 실행하고 이력 수가 수정 수와 같은지 센다.
- 사용자가 특정 항목의 현재 문구를 찾는 데 걸리는 시간 30초 이내. 측정: 개발자 5명에게 임의 항목을 찾게 하고 시간을 잰다.

## Ask the user before deciding
- 요구사항을 텍스트 파일로 가져오거나 내보내는 형식을 정할 것인가?
- 기존 요구사항 도구의 데이터를 옮기는 기능이 필요한가?
- 차별점 근거 부족: 원문은 경쟁 도구가 변경 이력을 안정적으로 추적하는지 말하지 않는다. 경쟁 도구의 이력 기능을 직접 확인한 뒤 차별점 문장을 정할 것인가?

## User evidence
1. [E-1] "I’ve repeatedly hit the same failure mode: at any moment, it’s hard to answer" ([hn source](https://news.ycombinator.com/item?id=46725196))
2. [E-2] "One big pain point that has existed forever and has never really been addresses adequately is the ability to come up with requirements." ([hn source](https://news.ycombinator.com/item?id=47397654))
3. [E-3] "Requirements change, scope fluctuates, problem space evolves - grows and shrinks, accretion is unavoidable." ([hn source](https://news.ycombinator.com/item?id=48128583))
