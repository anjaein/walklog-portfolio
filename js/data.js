/* 가짜 데이터. 오늘은 2026년 11월 19일 목요일, 석두는 퇴근 후 망원 한강공원을 걷는 중이다. */
window.WL = window.WL || {};

(function () {
  const P = (name) => `assets/photos/${name}.jpg`;

  /* 코스 모양: 0~100 칸 안의 점. 실제 골목처럼 꺾이게 그렸다. */
  const shapes = {
    yeonnam: [[6, 82], [16, 80], [20, 70], [32, 68], [36, 58], [48, 60], [54, 48], [64, 47], [70, 38], [82, 36], [94, 26]],
    hangang: [[4, 34], [14, 38], [26, 35], [38, 40], [50, 38], [60, 44], [72, 42], [82, 49], [96, 47]],
    loop: [[34, 84], [22, 74], [18, 58], [24, 44], [22, 30], [36, 20], [52, 22], [64, 16], [78, 26], [80, 42], [74, 56], [80, 68], [66, 80], [50, 78], [34, 84]],
    gyeongui: [[8, 90], [18, 82], [26, 78], [32, 68], [42, 64], [48, 54], [58, 50], [62, 40], [72, 34], [78, 24], [90, 14]],
    market: [[6, 84], [16, 70], [28, 72], [36, 54], [50, 56], [56, 40], [66, 30], [78, 28], [86, 16], [96, 10]],
    seosulla: [[8, 54], [22, 54], [24, 34], [40, 32], [42, 62], [58, 64], [60, 42], [78, 40], [80, 24], [92, 20]],
    ginkgo: [[10, 30], [28, 34], [34, 50], [52, 52], [58, 68], [76, 70], [90, 80]],
    namsan: [[8, 92], [14, 76], [28, 72], [34, 56], [48, 50], [52, 36], [64, 30], [70, 18], [86, 10]],
    ikseon: [[12, 18], [12, 42], [28, 44], [30, 68], [52, 70], [54, 52], [74, 50], [76, 66], [90, 82]],
    river: [[4, 62], [20, 58], [36, 60], [52, 54], [66, 56], [80, 50], [96, 48]],
    forest: [[10, 20], [20, 30], [24, 46], [38, 52], [50, 48], [58, 62], [70, 66], [80, 80], [92, 84]],
    cat: [[20, 80], [20, 58], [38, 56], [40, 40], [60, 38], [62, 22], [80, 20]],
    seongsu: [[6, 40], [20, 44], [30, 60], [46, 62], [52, 78], [72, 80], [88, 70]],
    bukchon: [[10, 74], [24, 70], [26, 52], [44, 48], [46, 30], [64, 28], [70, 44], [88, 40]],
    today: [[6, 70], [18, 66], [26, 72], [38, 62], [50, 64], [58, 52], [70, 54], [80, 44]],
    dayline: [[2, 88], [8, 80], [6, 70], [18, 66], [26, 72], [38, 62], [50, 64], [58, 52], [70, 54], [80, 44], [88, 46], [98, 38]],
  };

  const me = {
    id: 'seokdu',
    name: '석두',
    handle: '@seokdu.walks',
    avatar: P('calico-cat'),
    bio: '퇴근하고 걷는 사람. 망원동 골목 위주로 다녀요.',
    area: '망원동',
    headerColor: 'tomato',
    defaultVisibility: '공개',
    language: '한국어',
    joined: '2026년 9월',
    savedCount: 24,
  };

  /* 내 로그 12개 */
  const myLogs = [
    {
      id: 'l-1118', title: '연남동 골목 한 바퀴', date: '2026-11-18', dow: '수', start: '18:12', end: '18:59', minutes: 47, km: 2.8, place: '연남동', shape: 'yeonnam',
      text: '퇴근하고 연남동 골목을 한 바퀴.\n붉은 벽돌집 사이로 해가 지는 게 좋았다.',
      visibility: 'public', likes: 12, saves: 3,
      photos: [
        { src: P('residential-street'), at: 0.08, time: '18:14' },
        { src: P('calico-cat'), at: 0.3, time: '18:23', note: '골목 고양이' },
        { src: P('ginkgo-yellow'), at: 0.46, time: '18:31' },
        { src: P('alley-street'), at: 0.6, time: '18:38' },
        { src: P('old-alley'), at: 0.68, time: '18:41' },
        { src: P('coffee-bench'), at: 0.74, time: '18:44' },
        { src: P('night-alley'), at: 0.82, time: '18:49' },
        { src: P('ginkgo-street'), at: 0.9, time: '18:54' },
        { src: P('hanok-alley'), at: 0.97, time: '18:58' },
      ],
    },
    {
      id: 'l-1116', title: '망원 한강공원 노을', date: '2026-11-16', dow: '일', start: '16:41', end: '17:44', minutes: 63, km: 4.1, place: '망원동', shape: 'hangang',
      text: '해 지는 시간 맞춰서 나갔다. 성산대교 쪽 하늘이 주황색으로 타는 데 딱 10분.',
      visibility: 'public', likes: 27, saves: 9,
      photos: [
        { src: P('hangang-bench'), at: 0.12, time: '16:49' },
        { src: P('river-golden'), at: 0.4, time: '17:05' },
        { src: P('hangang-sunset'), at: 0.63, time: '17:21' },
        { src: P('hangang-dusk'), at: 0.88, time: '17:38' },
      ],
    },
    {
      id: 'l-1114', title: '경의선숲길 출근 대신', date: '2026-11-14', dow: '금', start: '08:07', end: '08:45', minutes: 38, km: 2.3, place: '연남동', shape: 'gyeongui',
      text: '버스 대신 숲길로 두 정거장. 바닥에 낙엽이 많아서 걷는 소리가 좋다.',
      visibility: 'public', likes: 8, saves: 1,
      photos: [
        { src: P('forest-path'), at: 0.2, time: '08:13' },
        { src: P('green-path'), at: 0.55, time: '08:26' },
        { src: P('park-path'), at: 0.86, time: '08:39' },
      ],
    },
    {
      id: 'l-1109', title: '서순라길 돌담 따라', date: '2026-11-09', dow: '일', start: '14:20', end: '15:12', minutes: 52, km: 3.4, place: '종로', shape: 'seosulla',
      text: '종묘 돌담 옆으로 쭉. 표지판 뒤 단풍이 제일 진했다.',
      visibility: 'public', likes: 19, saves: 6,
      photos: [
        { src: P('seosulla-sign'), at: 0.16, time: '14:27' },
        { src: P('hanok-alley'), at: 0.44, time: '14:41' },
        { src: P('old-alley'), at: 0.7, time: '14:56' },
        { src: P('coffee-bench'), at: 0.94, time: '15:09' },
      ],
    },
    {
      id: 'l-1107', title: '은행잎 쌓인 성산로', date: '2026-11-07', dow: '금', start: '19:02', end: '19:31', minutes: 29, km: 1.9, place: '성산동', shape: 'ginkgo',
      text: '노란 길. 밟으면 냄새가 나서 가장자리로만 걸었다.',
      visibility: 'public', likes: 6, saves: 0,
      photos: [
        { src: P('ginkgo-street'), at: 0.3, time: '19:10' },
        { src: P('ginkgo-yellow'), at: 0.74, time: '19:23' },
      ],
    },
    {
      id: 'l-1102', title: '남산 아래 단풍', date: '2026-11-02', dow: '일', start: '13:35', end: '14:56', minutes: 81, km: 5.3, place: '용산', shape: 'namsan',
      text: '해방촌에서 출발해 남산 둘레길 입구까지. 타워가 나뭇가지 사이로 보였다.',
      visibility: 'public', likes: 33, saves: 14,
      photos: [
        { src: P('autumn-park'), at: 0.18, time: '13:49' },
        { src: P('namsan-branches'), at: 0.52, time: '14:17' },
        { src: P('forest-path'), at: 0.81, time: '14:41' },
      ],
    },
    {
      id: 'l-1030', title: '밤 골목 산책', date: '2026-10-30', dow: '목', start: '22:11', end: '22:35', minutes: 24, km: 1.6, place: '망원동', shape: 'cat',
      text: '잠이 안 와서 집 앞만 조금.',
      visibility: 'private', likes: 0, saves: 0,
      photos: [
        { src: P('night-alley'), at: 0.4, time: '22:20' },
        { src: P('alley-street'), at: 0.8, time: '22:31' },
      ],
    },
    {
      id: 'l-1026', title: '망원시장 지나 강까지', date: '2026-10-26', dow: '일', start: '11:18', end: '12:02', minutes: 44, km: 2.9, place: '망원동', shape: 'market',
      text: '시장에서 호떡 하나 사 들고 강까지. 주말 오전이라 사람이 많았다.',
      visibility: 'public', likes: 15, saves: 4,
      photos: [
        { src: P('residential-street'), at: 0.14, time: '11:23' },
        { src: P('coffee-bench'), at: 0.48, time: '11:39' },
        { src: P('hangang-bench'), at: 0.9, time: '11:58' },
      ],
    },
    {
      id: 'l-1019', title: '익선동 한옥 골목', date: '2026-10-19', dow: '일', start: '15:04', end: '16:01', minutes: 57, km: 3.1, place: '종로', shape: 'ikseon',
      text: '골목이 좁아서 지도 보면서 걸으면 헤맨다. 그냥 발 가는 대로.',
      visibility: 'public', likes: 11, saves: 2,
      photos: [
        { src: P('hanok-alley'), at: 0.22, time: '15:16' },
        { src: P('old-alley'), at: 0.5, time: '15:31' },
        { src: P('coffee-bench'), at: 0.83, time: '15:51' },
      ],
    },
    {
      id: 'l-1012', title: '서울숲 가을', date: '2026-10-12', dow: '일', start: '10:26', end: '11:32', minutes: 66, km: 4.4, place: '성수동', shape: 'forest',
      text: '은행나무 길이 아직 반쯤 초록이었다. 2주 뒤에 다시 와야지.',
      visibility: 'public', likes: 21, saves: 7,
      photos: [
        { src: P('forest-path'), at: 0.16, time: '10:37' },
        { src: P('autumn-park'), at: 0.46, time: '10:56' },
        { src: P('park-path'), at: 0.78, time: '11:17' },
      ],
    },
    {
      id: 'l-1005', title: '한강 자전거길 걸어서', date: '2026-10-05', dow: '일', start: '16:52', end: '18:04', minutes: 72, km: 5.7, place: '합정', shape: 'river',
      text: '자전거 사이로 걷느라 조금 피곤. 해 질 녘은 늘 좋다.',
      visibility: 'public', likes: 9, saves: 2,
      photos: [
        { src: P('river-sunset'), at: 0.4, time: '17:21' },
        { src: P('hangang-dusk'), at: 0.86, time: '17:58' },
      ],
    },
    {
      id: 'l-0928', title: '동네 고양이 찾기', date: '2026-09-28', dow: '일', start: '15:40', end: '16:13', minutes: 33, km: 2.1, place: '망원동', shape: 'cat',
      text: '삼색이를 3번째 골목에서 만났다.',
      visibility: 'private', likes: 0, saves: 0,
      photos: [
        { src: P('alley-street'), at: 0.3, time: '15:49' },
        { src: P('calico-cat'), at: 0.7, time: '16:02' },
      ],
    },
  ];

  /* 오늘 걷는 중 */
  const today = {
    date: '2026-11-19', dow: '목', place: '망원 한강공원', start: '18:04', minutes: 38, km: 2.4, photos: 3,
    walkedMinutes: 72, totalPhotos: 6, shape: 'today', dayShape: 'dayline',
    /* 하루 동안 걸은 시간대(시) — 시간 고르기 휠의 점 */
    walkedHours: [8, 12, 13, 18, 19],
    photoList: [P('hangang-bench'), P('river-golden'), P('hangang-sunset'), P('coffee-bench'), P('residential-street'), P('green-path')],
  };

  /* 다른 사람 */
  const users = {
    mangwon_cat: { id: 'mangwon_cat', name: '망원 고양이', handle: '@mangwon_cat', avatar: P('ginkgo-yellow'), headerColor: 'cobalt', bio: '망원동 골목 고양이 지도 만드는 중. 걷다가 만나면 사진 찍어요.', area: '망원동', joined: '2026년 3월' },
    hyejin: { id: 'hyejin', name: '혜진', handle: '@hyejin.walks', avatar: P('autumn-park'), headerColor: 'lemon', bio: '주말마다 서울 동네 하나씩.', area: '성북동', joined: '2026년 5월' },
    seongsu_slow: { id: 'seongsu_slow', name: '성수 느리게', handle: '@seongsu_slow', avatar: P('coffee-bench'), headerColor: 'mint', bio: '카페 하나, 골목 하나.', area: '성수동', joined: '2026년 7월' },
    nightwalker: { id: 'nightwalker', name: '밤길 김씨', handle: '@night.kim', avatar: P('night-alley'), headerColor: 'ink', bio: '야근 끝나고 한강까지.', area: '합정동', joined: '2026년 2월' },
    jongno_dan: { id: 'jongno_dan', name: '종로 단풍', handle: '@jongno.dan', avatar: P('seosulla-sign'), headerColor: 'tomato', bio: '돌담길 좋아해요.', area: '종로', joined: '2026년 8월' },
    saebyeok: { id: 'saebyeok', name: '새벽', handle: '@saebyeok_', avatar: null, headerColor: 'cobalt', bio: '', area: '', joined: '2026년 11월' },
  };

  /* 탐색에 나오는 남의 로그 */
  const feed = [
    { id: 'f-01', author: 'mangwon_cat', title: '망원시장 지나 강까지', date: '2026-11-12', dow: '목', minutes: 18, km: 0.4, place: '망원동', shape: 'market', tags: ['nearby', 'hangang', 'alley'], distance: 0.6, likes: 41, saves: 17, text: '시장 끝 골목에서 고양이 셋. 강까지 가는 가장 짧은 길이에요.', photos: [P('residential-street'), P('calico-cat'), P('hangang-bench')] },
    { id: 'f-02', author: 'mangwon_cat', title: '삼색이 출근길', date: '2026-11-08', dow: '일', minutes: 26, km: 1.3, place: '망원동', shape: 'cat', tags: ['nearby', 'alley'], distance: 0.9, likes: 58, saves: 22, text: '아침 8시쯤 이 골목에 꼭 나타나요.', photos: [P('calico-cat'), P('alley-street')] },
    { id: 'f-03', author: 'hyejin', title: '성북동 돌담 한 바퀴', date: '2026-11-15', dow: '토', minutes: 74, km: 4.6, place: '성북동', shape: 'bukchon', tags: ['popular', 'autumn', 'alley'], distance: 9.7, likes: 132, saves: 48, text: '길상사에서 시작해서 돌담 따라 내려오는 길. 단풍 지금이 제일 예뻐요.', photos: [P('autumn-park'), P('hanok-alley'), P('namsan-branches'), P('forest-path')] },
    { id: 'f-04', author: 'seongsu_slow', title: '서울숲에서 성수 카페 골목', date: '2026-11-16', dow: '일', minutes: 49, km: 3.2, place: '성수동', shape: 'seongsu', tags: ['popular', 'cafe'], distance: 11.4, likes: 87, saves: 39, text: '숲 → 수제화 골목 → 카페 두 곳. 오후 3시 출발 추천.', photos: [P('forest-path'), P('coffee-bench'), P('old-alley')] },
    { id: 'f-05', author: 'nightwalker', title: '합정에서 당산철교 야경', date: '2026-11-13', dow: '금', minutes: 55, km: 3.9, place: '합정동', shape: 'river', tags: ['night', 'hangang', 'nearby'], distance: 1.8, likes: 64, saves: 25, text: '밤 10시 이후 강변이 조용해요. 철교 불빛 지나갈 때 꼭 한 번 멈추세요.', photos: [P('hangang-dusk'), P('night-alley'), P('river-sunset')] },
    { id: 'f-06', author: 'jongno_dan', title: '서순라길 단풍 끝물', date: '2026-11-17', dow: '월', minutes: 37, km: 2.2, place: '종로', shape: 'seosulla', tags: ['autumn', 'popular', 'alley'], distance: 8.3, likes: 96, saves: 31, text: '이번 주가 마지막일 듯. 표지판 앞이 사진 자리.', photos: [P('seosulla-sign'), P('hanok-alley'), P('ginkgo-yellow')] },
    { id: 'f-07', author: 'hyejin', title: '은행나무 터널, 성산로', date: '2026-11-10', dow: '월', minutes: 22, km: 1.4, place: '성산동', shape: 'ginkgo', tags: ['nearby', 'autumn'], distance: 1.2, likes: 45, saves: 12, text: '바닥까지 노래요. 마스크 챙기세요(냄새).', photos: [P('ginkgo-street'), P('ginkgo-yellow')] },
    { id: 'f-08', author: 'nightwalker', title: '망원 한강공원 노을 산책', date: '2026-11-18', dow: '수', minutes: 41, km: 2.7, place: '망원동', shape: 'hangang', tags: ['nearby', 'hangang', 'popular'], distance: 0.4, likes: 103, saves: 44, text: '5시 10분쯤 도착하면 해가 다리 위에 걸려요.', photos: [P('hangang-sunset'), P('river-golden'), P('hangang-bench')] },
    { id: 'f-09', author: 'seongsu_slow', title: '경의선숲길 커피 한 잔', date: '2026-11-11', dow: '화', minutes: 33, km: 2.0, place: '연남동', shape: 'gyeongui', tags: ['cafe', 'nearby'], distance: 1.5, likes: 52, saves: 19, text: '테이크아웃해서 숲길 벤치에서.', photos: [P('green-path'), P('coffee-bench'), P('park-path')] },
    { id: 'f-10', author: 'jongno_dan', title: '익선동 저녁 골목', date: '2026-11-06', dow: '목', minutes: 29, km: 1.7, place: '종로', shape: 'ikseon', tags: ['night', 'alley'], distance: 8.9, likes: 38, saves: 10, text: '해 지면 간판 불이 켜져서 더 좋아요.', photos: [P('old-alley'), P('night-alley')] },
    { id: 'f-11', author: 'hyejin', title: '남산 둘레길 북측', date: '2026-11-03', dow: '월', minutes: 92, km: 6.1, place: '중구', shape: 'namsan', tags: ['autumn', 'popular'], distance: 7.6, likes: 117, saves: 52, text: '경사 거의 없는 길. 타워가 계속 따라와요.', photos: [P('namsan-branches'), P('autumn-park'), P('forest-path')] },
    { id: 'f-12', author: 'mangwon_cat', title: '망원 고양이 골목 지도', date: '2026-10-29', dow: '목', minutes: 44, km: 2.5, place: '망원동', shape: 'loop', tags: ['nearby', 'alley'], distance: 0.3, likes: 77, saves: 35, text: '고양이를 자주 만나는 골목만 이었어요. 한 바퀴 돌면 제자리.', photos: [P('alley-street'), P('calico-cat'), P('residential-street')] },
  ];

  const filters = [
    { id: 'nearby', label: '내 주변 2km' },
    { id: 'popular', label: '이번 주 인기' },
    { id: 'autumn', label: '단풍' },
    { id: 'night', label: '야경' },
    { id: 'hangang', label: '한강' },
    { id: 'alley', label: '골목' },
    { id: 'cafe', label: '카페' },
  ];

  /* 보관함(저장한 남의 로그) */
  const archive = ['f-08', 'f-03', 'f-01', 'f-06', 'f-11', 'f-05', 'f-12', 'f-04', 'f-09', 'f-02', 'f-07'];

  /* 지도 탭 카드: 따라 걷기로 담은 코스, 내 주변, 다시 걷기 */
  const mapCards = [
    { kind: '저장한 코스', ref: 'f-01' },
    { kind: '내 주변', ref: 'f-08' },
    { kind: '내 주변', ref: 'f-12' },
    { kind: '다시 걷기', ref: 'l-1116', note: '3번 걸음' },
  ];

  const recentSearches = ['망원', '한강 노을', '단풍 골목', '성수 카페'];

  const toasts = {
    linkCopied: '링크를 복사했어요',
    madePublic: '공개로 바꿨어요',
    removedFromArchive: '보관함에서 뺐어요',
    saved: '보관함에 담았어요',
    deleted: '로그를 지웠어요',
    done: '다 걸었어요',
  };

  WL.data = { P, shapes, me, myLogs, today, users, feed, filters, archive, mapCards, recentSearches, toasts };
  WL.find = {
    myLog: (id) => myLogs.find((l) => l.id === id),
    post: (id) => feed.find((f) => f.id === id),
    user: (id) => users[id],
    postsBy: (uid) => feed.filter((f) => f.author === uid),
  };
})();
