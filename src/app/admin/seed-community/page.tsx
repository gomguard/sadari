"use client";

import { useState } from "react";
import { addPost, addComment } from "@/lib/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ============================================================
// 시드 데이터: 30개 게시글 + 댓글
// ============================================================

const nicknames = [
  "주린이", "삼전홀더", "차트마스터", "배당러버", "장투왕",
  "수익인증맨", "바이오덕후", "조선매니아", "초보투자자", "코스피전사",
  "눌림목헌터", "분할매수왕", "익절의신", "손절못하는자", "반도체러버",
  "테마주사냥꾼", "가치투자자", "단타왕", "스윙트레이더", "금리분석가",
  "IPO전문가", "화장품매니아", "로봇투자자", "식료품전문가", "방산덕후",
  "변압기충", "ETF투자자", "해외주식러", "채권투자자", "실전매매러",
];

interface SeedPost {
  nickname: string;
  title: string;
  content: string;
  category: "자유" | "질문" | "종목토론" | "수익인증";
  likes: number;
  comments: { nickname: string; content: string; likes: number }[];
}

const seedPosts: SeedPost[] = [
  // ──────────────────── 자유 (10) ────────────────────
  {
    nickname: "주린이",
    title: "주식 시작한 지 3개월 됐는데 느낀 점",
    content: `주식 시작한 지 벌써 3개월이 됐네요.

처음에 뭣도 모르고 삼전 물렸다가 멘탈 터질 뻔했는데
요즘은 차트도 좀 보고 뉴스도 챙겨보니까 감이 오기 시작해요.

역시 주식은 공부가 답인 것 같습니다.
다들 성투하세요! 🙏`,
    category: "자유",
    likes: 12,
    comments: [
      { nickname: "삼전홀더", content: "저도 처음엔 그랬어요 ㅋㅋ 이제 시작입니다 화이팅!", likes: 3 },
      { nickname: "차트마스터", content: "3개월이면 아직 초반이에요. 1년 지나면 진짜 감이 옵니다", likes: 2 },
      { nickname: "장투왕", content: "좋은 마인드시네요. 공부하면서 투자하면 분명 좋은 결과 있을 겁니다", likes: 4 },
      { nickname: "배당러버", content: "저도 처음에 삼전으로 시작했어요 ㅋㅋ 다들 그런 것 같습니다", likes: 1 },
    ],
  },
  {
    nickname: "코스피전사",
    title: "오늘 장 분위기 어떤가요?",
    content: `코스피 2,650 부근에서 왔다 갔다 하는데
외인이 계속 팔고 있어서 불안하네요.

기관은 사고 있는데... 누가 이기는 건지 ㅋㅋ
다들 오늘 어떻게 대응하고 계세요?`,
    category: "자유",
    likes: 8,
    comments: [
      { nickname: "단타왕", content: "오전에 반등할 때 익절하고 나왔어요. 오후장 조심하세요", likes: 2 },
      { nickname: "눌림목헌터", content: "외인 순매도 규모 보면 아직 큰 거 아님. 눌림목 매수 기회로 봅니다", likes: 5 },
      { nickname: "금리분석가", content: "미국 금리 동향 봐야 합니다. 오늘 밤 FOMC 의사록 나와요", likes: 3 },
      { nickname: "실전매매러", content: "저는 현금 비중 50% 유지하면서 관망 중이에요. 이럴 때는 쉬는 것도 매매", likes: 2 },
    ],
  },
  {
    nickname: "배당러버",
    title: "배당주 투자하는 사람 여기 있나요?",
    content: `요즘 성장주 변동성이 너무 심해서
배당주 위주로 포트폴리오 바꾸고 있어요.

맥쿼리인프라, KT&G, 하나금융 이런 거 모으는 중인데
다들 배당주 뭐 담고 계세요?

연 5% 이상 배당 나오는 종목 추천 좀요 ㅎㅎ`,
    category: "자유",
    likes: 15,
    comments: [
      { nickname: "ETF투자자", content: "TIGER 배당성장 ETF도 괜찮아요. 분산도 되고 배당도 나옵니다", likes: 4 },
      { nickname: "가치투자자", content: "저는 우리금융 담고 있어요. 배당수익률 7% 넘어요 지금", likes: 3 },
      { nickname: "채권투자자", content: "배당주 좋긴 한데 금리 높을 때는 채권도 같이 보세요", likes: 2 },
      { nickname: "장투왕", content: "맥쿼리인프라 좋은 선택이에요. 저도 10년째 모으는 중", likes: 5 },
    ],
  },
  {
    nickname: "단타왕",
    title: "단타 치다가 멘탈 나간 썰",
    content: `오늘 아침에 상한가 따라잡기 하다가
물량 다 받아먹고 -8%에서 손절했습니다...

하루만에 150만원 날림 ㅋㅋㅋㅋ
역시 상따는 아무나 하는 게 아니구나

앞으로는 절대 상따 안 합니다 (n번째)`,
    category: "자유",
    likes: 11,
    comments: [
      { nickname: "손절못하는자", content: "ㅋㅋㅋ 저도 어제 당했어요 동지", likes: 3 },
      { nickname: "스윙트레이더", content: "상따보다는 눌림목 매수가 훨씬 안전해요. 스윙으로 전환 추천", likes: 4 },
      { nickname: "익절의신", content: "손절 빨리 한 게 잘한 거예요. 더 버틸 수도 있었잖아요", likes: 2 },
      { nickname: "주린이", content: "상따가 뭔가요? 상한가 따라잡기인가?", likes: 0 },
    ],
  },
  {
    nickname: "실전매매러",
    title: "직장인 투자자의 하루 루틴",
    content: `6:30 기상 → 프리마켓 체크
7:00 뉴스 훑기 (한경, 매경)
8:50 호가창 켜기
9:00~9:30 단타 or 매수 타점 확인
점심시간 차트 체크
14:50 마감 동시호가 확인

이렇게 사는 직장인 투자자 저뿐인가요? ㅎㅎ
회사에서 몰래 핸드폰 보는 건 비밀...`,
    category: "자유",
    likes: 14,
    comments: [
      { nickname: "초보투자자", content: "저도 똑같아요 ㅋㅋ 화장실에서 호가창 보는 거 국룰", likes: 5 },
      { nickname: "장투왕", content: "장투하면 이런 스트레스 없어요 ㅎㅎ 한 달에 한번 봅니다", likes: 2 },
      { nickname: "코스피전사", content: "동시호가 때 심장 쫄깃한 거 공감합니다 ㅋㅋ", likes: 3 },
      { nickname: "배당러버", content: "저는 배당주 위주라 한 달에 한 번만 봐요 ㅎㅎ 마음이 편합니다", likes: 1 },
    ],
  },
  {
    nickname: "해외주식러",
    title: "미국 주식 vs 한국 주식 솔직한 비교",
    content: `미장 2년, 한국 주식 3년 해본 사람으로서 솔직히 말하면

미국: 우상향 하긴 하는데 환율 리스크 있고 밤에 잠을 못 잠
한국: 박스피가 답답하지만 정보 접근이 쉬움

요즘은 7:3으로 미장:국내 비율로 가져가고 있습니다.
다들 비율 어떻게 하세요?`,
    category: "자유",
    likes: 9,
    comments: [
      { nickname: "ETF투자자", content: "저는 S&P500 ETF로 미장 비중 50% 가져갑니다", likes: 3 },
      { nickname: "금리분석가", content: "환율 1,350원 넘어가면 미장 추가매수는 좀 부담스럽죠", likes: 2 },
      { nickname: "채권투자자", content: "미국 국채 ETF도 포트에 넣어보세요. 분산 효과 좋습니다", likes: 1 },
      { nickname: "삼전홀더", content: "한국 주식은 삼전만 있으면 됩니다 (삼전 물린 사람)", likes: 4 },
    ],
  },
  {
    nickname: "테마주사냥꾼",
    title: "요즘 핫한 테마 정리해봤습니다",
    content: `이번 주 핫한 테마 정리:

1. AI / 반도체 - 여전히 강세. HBM 관련주 주목
2. 방산 - 지정학적 리스크로 꾸준한 상승
3. 로봇 - 테슬라 옵티머스 이슈로 재부각
4. 조선 - LNG선 수주 모멘텀 지속
5. 변압기 - 전력 인프라 투자 확대

개인적으로는 방산 + 변압기 조합이 제일 안정적으로 보입니다`,
    category: "자유",
    likes: 13,
    comments: [
      { nickname: "방산덕후", content: "방산은 한화에어로 원픽이죠. 수주잔고가 역대급", likes: 4 },
      { nickname: "변압기충", content: "변압기 ㅎㅎ 제가 좋아하는 테마네요. HD현대일렉트릭 꾸준히 모으는 중", likes: 3 },
      { nickname: "로봇투자자", content: "로봇은 아직 실적이 없어서 조심해야 해요. 기대감만으로 가는 중", likes: 2 },
      { nickname: "스윙트레이더", content: "변압기는 실적 성장이 확실해서 테마 중에서 가장 안전한 것 같아요", likes: 3 },
    ],
  },
  {
    nickname: "분할매수왕",
    title: "물타기 vs 분할매수 차이를 모르는 사람이 많더라",
    content: `물타기: 떨어지는 종목에 추가 매수 (위험)
분할매수: 미리 계획한 가격대에서 나눠 매수 (전략)

이 차이를 모르고 물타기를 분할매수라고 우기는 사람이 많은데
물타기는 감정적 대응이고 분할매수는 계획적 투자입니다.

애초에 매수 전에 1차, 2차, 3차 매수가를 정해놓으세요!`,
    category: "자유",
    likes: 10,
    comments: [
      { nickname: "초보투자자", content: "오... 이거 진짜 구분 못 하고 있었는데 감사합니다", likes: 3 },
      { nickname: "손절못하는자", content: "저 완전 물타기 하는 유형인데... 반성합니다", likes: 5 },
      { nickname: "가치투자자", content: "맞습니다. 분할매수는 계획이 있어야 해요. 감정으로 하면 물타기", likes: 2 },
      { nickname: "익절의신", content: "물타기의 끝은 반토막입니다 ㅋㅋ 경험자가 말함", likes: 4 },
    ],
  },
  {
    nickname: "IPO전문가",
    title: "이번 달 IPO 일정 공유",
    content: `이번 달 주요 IPO 일정입니다:

4/20 - AI반도체테크 (코스닥) 공모가 35,000원
4/23 - 바이오신약 (코스닥) 공모가 미정
4/28 - 그린에너지솔루션 (코스피) 공모가 25,000원

AI반도체테크는 경쟁률 괜찮을 것 같고
바이오신약은 실적이 없어서 패스 예정입니다.

청약 예정이신 분?`,
    category: "자유",
    likes: 7,
    comments: [
      { nickname: "주린이", content: "IPO 청약은 어떻게 하나요? 증권사 앱에서 되나요?", likes: 1 },
      { nickname: "실전매매러", content: "AI반도체테크 저도 넣을 예정이에요. 섹터가 좋으니까", likes: 2 },
      { nickname: "초보투자자", content: "IPO 전문가님 매번 좋은 정보 감사합니다!", likes: 1 },
      { nickname: "테마주사냥꾼", content: "그린에너지솔루션은 요즘 에너지 정책이랑 맞물려서 기대되네요", likes: 2 },
    ],
  },
  {
    nickname: "식료품전문가",
    title: "편의점에서 주식 아이디어 얻는 법",
    content: `진짜 꿀팁인데요
편의점 갈 때마다 어떤 제품이 잘 팔리는지 보세요.

요즘 제로 음료가 미친듯이 팔리고 있어서
음료 관련주 찾아봤더니 진짜 실적 좋더라고요.

피터 린치 형님이 말했잖아요
일상에서 투자 아이디어를 찾으라고!`,
    category: "자유",
    likes: 6,
    comments: [
      { nickname: "가치투자자", content: "피터 린치 방법론이죠 ㅎㅎ 좋은 접근입니다", likes: 3 },
      { nickname: "화장품매니아", content: "저는 올리브영 가면서 화장품 관련주 찾아요 ㅋㅋ", likes: 2 },
      { nickname: "초보투자자", content: "와 이런 방법이 있군요! 오늘부터 편의점 잘 봐야겠다", likes: 1 },
      { nickname: "해외주식러", content: "미국에서는 코스트코 주차장 차 대수 세서 실적 예측하는 펀드도 있어요 ㅋㅋ", likes: 3 },
    ],
  },

  // ──────────────────── 질문 (8) ────────────────────
  {
    nickname: "초보투자자",
    title: "PER이 낮으면 무조건 좋은 건가요?",
    content: `주식 공부하는 초보입니다.

PER이 낮으면 저평가라고 하는데
그러면 PER 낮은 종목 사면 무조건 돈 버는 건가요?

은행주들이 PER 3~5배인데
왜 안 오르는지 이해가 안 돼요 ㅠㅠ`,
    category: "질문",
    likes: 8,
    comments: [
      { nickname: "가치투자자", content: "PER만 보면 안 돼요. 성장성이 없으면 PER 낮아도 안 올라요. PBR, ROE도 같이 보세요", likes: 5 },
      { nickname: "금리분석가", content: "은행주는 경기 사이클과 금리에 영향 많이 받아요. PER 낮은 이유가 있는 겁니다", likes: 3 },
      { nickname: "차트마스터", content: "저PER + 실적 성장 + 차트 우상향 이 세 가지가 맞아야 매수 타이밍", likes: 4 },
      { nickname: "배당러버", content: "은행주는 PER 낮지만 배당이 좋아서 배당 목적으로는 좋아요", likes: 2 },
    ],
  },
  {
    nickname: "주린이",
    title: "공매도가 뭔가요? 왜 개미한테 안 좋다는 건지",
    content: `뉴스에서 공매도 재개한다고 난리인데
공매도가 정확히 뭔지 모르겠어요.

주식을 빌려서 판다는 건 알겠는데
왜 그게 개미한테 불리하다는 건가요?

쉽게 설명해주실 분 ㅠㅠ`,
    category: "질문",
    likes: 11,
    comments: [
      { nickname: "코스피전사", content: "쉽게 말해서 주가 하락에 베팅하는 거예요. 기관/외인은 대량으로 할 수 있어서 개미가 불리한 겁니다", likes: 5 },
      { nickname: "스윙트레이더", content: "공매도 자체가 나쁜 건 아닌데 불법 공매도(무차입 공매도)가 문제죠. 개인은 못 하는 거니까 형평성 문제", likes: 4 },
      { nickname: "장투왕", content: "장기투자자 입장에서는 공매도 때 오히려 싸게 살 수 있어서 기회가 되기도 합니다", likes: 2 },
      { nickname: "분할매수왕", content: "공매도 재개되면 대형주 위주로 갈 게 안전할 것 같아요", likes: 1 },
    ],
  },
  {
    nickname: "초보투자자",
    title: "이동평균선 볼 때 몇 일선을 봐야 하나요?",
    content: `차트 공부 시작했는데 이동평균선이 너무 많아요.

5일선, 20일선, 60일선, 120일선, 200일선...
다 봐야 하나요? 초보는 어떤 거부터 보면 좋을까요?

그리고 골든크로스, 데드크로스는 진짜 의미 있나요?`,
    category: "질문",
    likes: 9,
    comments: [
      { nickname: "차트마스터", content: "초보는 20일선(단기추세)과 60일선(중기추세)만 보세요. 20일선 위에 있으면 단기 상승추세입니다", likes: 5 },
      { nickname: "스윙트레이더", content: "스윙은 5일선, 20일선 조합이 핵심이에요. 5일선이 20일선 위에 있으면 매수 구간", likes: 3 },
      { nickname: "눌림목헌터", content: "60일선 눌림목이 가장 안전한 매수 포인트입니다. 60일선 지지하면 반등 확률 높아요", likes: 4 },
      { nickname: "단타왕", content: "단타는 3분봉, 5분봉의 5이평 20이평 봐야 합니다. 일봉은 스윙용", likes: 2 },
    ],
  },
  {
    nickname: "주린이",
    title: "증권사 수수료 어디가 제일 싸요?",
    content: `주식 계좌 만들려고 하는데
증권사가 너무 많아서 뭘 골라야 할지 모르겠어요.

수수료가 제일 중요한 거 맞나요?
아니면 MTS 편의성도 중요한가요?

현재 토스증권 쓰고 있는데 다른 데로 옮겨야 하나 고민 중...`,
    category: "질문",
    likes: 5,
    comments: [
      { nickname: "실전매매러", content: "키움증권이 수수료 싸고 HTS 기능이 압도적이에요. 단타면 키움 추천", likes: 4 },
      { nickname: "장투왕", content: "장투면 수수료 별 차이 안 나요. MTS 편한 거 쓰세요. 토스도 괜찮습니다", likes: 2 },
      { nickname: "ETF투자자", content: "해외주식도 할 거면 미래에셋이 환전 수수료 저렴해요", likes: 3 },
      { nickname: "단타왕", content: "키움 영웅문 안 쓰면 단타 못 합니다 ㅋㅋ 속도가 달라요", likes: 2 },
    ],
  },
  {
    nickname: "초보투자자",
    title: "손절 기준을 어떻게 잡나요?",
    content: `매번 손절을 못 해서 물리는데
다들 손절 기준이 있으신가요?

-5%? -10%? 아니면 지지선 이탈?
감으로 하시는 건지 기준이 있는 건지 궁금합니다.

손절 잘하는 법 좀 알려주세요 ㅠ`,
    category: "질문",
    likes: 13,
    comments: [
      { nickname: "익절의신", content: "저는 -3% 기계적 손절입니다. 감정 개입하면 끝이에요. 매수 전에 손절가 정해놓고 들어가세요", likes: 5 },
      { nickname: "차트마스터", content: "지지선 이탈이 가장 합리적이에요. 전저점 깨지면 바로 나오세요", likes: 4 },
      { nickname: "손절못하는자", content: "저처럼 되지 마세요... -30% 물려있는 종목 3개 있습니다 ㅠ", likes: 3 },
      { nickname: "분할매수왕", content: "애초에 분할매수하면 손절 부담이 줄어요. 한 번에 몰빵하니까 손절이 어려운 거", likes: 2 },
    ],
  },
  {
    nickname: "주린이",
    title: "ETF가 정확히 뭐예요? 주식이랑 뭐가 다른 건가요?",
    content: `ETF ETF 많이 들어봤는데
정확히 주식이랑 뭐가 다른 건지 모르겠어요.

KODEX 200 이런 거 사면 코스피 전체에 투자하는 건가요?
초보한테 ETF 추천한다고 하는데 이유가 뭘까요?`,
    category: "질문",
    likes: 7,
    comments: [
      { nickname: "ETF투자자", content: "ETF는 여러 종목을 묶은 바구니예요. 개별 종목 고를 필요 없이 분산투자 가능합니다. 초보한테 딱이에요", likes: 5 },
      { nickname: "배당러버", content: "배당 ETF도 있어요. TIGER 배당성장 같은 거. 배당도 받고 분산도 되고 일석이조", likes: 3 },
      { nickname: "해외주식러", content: "미국 S&P500 추종 ETF 적립식으로 사면 장기적으로 거의 손해 안 봐요", likes: 4 },
    ],
  },
  {
    nickname: "초보투자자",
    title: "시간외 거래는 어떻게 하나요?",
    content: `정규장 끝나고도 주식 거래가 된다고 들었는데
시간외 거래는 어떻게 하는 건가요?

시간외 단일가? 시간외 종가? 차이가 뭔지
그리고 언제 어떻게 이용하면 좋은지 알려주세요!`,
    category: "질문",
    likes: 4,
    comments: [
      { nickname: "실전매매러", content: "시간외 종가는 장 마감 후 종가로 매매하는 거고, 시간외 단일가는 16:00~18:00에 10분 단위로 체결돼요", likes: 4 },
      { nickname: "단타왕", content: "시간외는 호재/악재 뉴스 나올 때 활용해요. 근데 유동성 적어서 조심하세요", likes: 2 },
    ],
  },
  {
    nickname: "주린이",
    title: "신용거래 하면 안 되는 건가요?",
    content: `신용거래로 레버리지 효과를 볼 수 있다고 하는데
다들 절대 하지 말라고 하더라고요.

진짜 그렇게 위험한 건가요?
소액으로만 하면 괜찮지 않나요?

경험자분들 의견 듣고 싶어요`,
    category: "질문",
    likes: 6,
    comments: [
      { nickname: "익절의신", content: "신용거래 하면 반대매매 당할 수 있어요. 주가 하락 시 강제로 팔려나가는데 그때 최저가에 팔립니다", likes: 5 },
      { nickname: "손절못하는자", content: "신용으로 물타기하다가 반대매매 맞은 적 있어요... 절대 하지 마세요 진짜", likes: 4 },
      { nickname: "가치투자자", content: "워런 버핏도 레버리지 쓰지 말라고 했습니다. 본인 자금 내에서만 투자하세요", likes: 3 },
      { nickname: "코스피전사", content: "반대매매는 진짜 지옥입니다. 주변에서 당한 사람 봤는데 멘탈 완전 나가더라고요", likes: 2 },
    ],
  },

  // ──────────────────── 종목토론 (8) ────────────────────
  {
    nickname: "삼전홀더",
    title: "[삼성전자] 7만전자 다시 올 수 있을까요?",
    content: `삼성전자 55,000원에 물려있는 사람입니다.

HBM 실적 기대감은 있는데
TSMC 대비 파운드리 경쟁력이 걱정되네요.

올해 안에 7만원 회복 가능할까요?
아니면 물타기 해야 하나...

현재 평단 62,000원입니다.`,
    category: "종목토론",
    likes: 14,
    comments: [
      { nickname: "반도체러버", content: "HBM3E 양산 본격화되면 실적 개선될 거예요. 저는 꾸준히 모으는 중입니다", likes: 5 },
      { nickname: "차트마스터", content: "차트상 52,000원이 강한 지지라인이에요. 깨지지 않는 한 홀딩 추천", likes: 3 },
      { nickname: "눌림목헌터", content: "60일선 돌파하면 빠르게 갈 수 있어요. 지금은 매집 구간으로 봅니다", likes: 4 },
      { nickname: "코스피전사", content: "삼전 물려있으면 그냥 배당 받으면서 기다리세요. 언젠간 갑니다", likes: 2 },
    ],
  },
  {
    nickname: "반도체러버",
    title: "[SK하이닉스] HBM 수혜 어디까지?",
    content: `SK하이닉스 HBM 독주 체제인데
주가가 이미 많이 올라서 지금 들어가도 되는지 고민입니다.

현재가 185,000원
목표가 250,000원 잡는 증권사도 있던데

AI 반도체 사이클이 아직 초기라는 의견도 있고...
다들 어떻게 보시나요?`,
    category: "종목토론",
    likes: 12,
    comments: [
      { nickname: "삼전홀더", content: "하이닉스 진짜 부럽네요... 삼전은 언제 따라가나 ㅠ", likes: 2 },
      { nickname: "분할매수왕", content: "지금 한번에 들어가지 말고 3번에 나눠서 매수하세요. 조정 올 수도 있어요", likes: 4 },
      { nickname: "차트마스터", content: "200,000원 돌파하면 신고가 행진 갈 수 있어요. 눌릴 때 매수 추천", likes: 3 },
      { nickname: "장투왕", content: "AI 사이클은 최소 5년은 간다고 봅니다. 하이닉스 장투 가능", likes: 2 },
    ],
  },
  {
    nickname: "조선매니아",
    title: "[한화오션] 조선주 슈퍼사이클 진짜일까?",
    content: `한화오션 69,000원에 매수해서 들고 있는데
조선주 슈퍼사이클이라는 말이 진짜인지 궁금합니다.

LNG선 수주잔고가 역대급이라고 하고
선가도 계속 오르고 있다는데

근데 이미 주가가 많이 올라서 차익실현 해야 하나 고민...
목표가 어떻게 잡으세요?`,
    category: "종목토론",
    likes: 10,
    comments: [
      { nickname: "장투왕", content: "수주잔고 보면 2~3년치 밀려있어요. 실적은 계속 좋을 수밖에 없습니다", likes: 5 },
      { nickname: "차트마스터", content: "조선주는 사이클이 긴 편이에요. 아직 초중반이라고 봅니다. 홀딩하세요", likes: 4 },
      { nickname: "테마주사냥꾼", content: "한화오션보다 HD한국조선해양이 밸류 매력 더 있다고 봐요", likes: 2 },
      { nickname: "금리분석가", content: "글로벌 물동량 증가 + 환경규제로 신조선 수요 계속됩니다. 장기 OK", likes: 3 },
    ],
  },
  {
    nickname: "바이오덕후",
    title: "[유한양행] 렉라자 FDA 승인 기대감",
    content: `유한양행 렉라자 미국 FDA 승인 일정이 다가오고 있습니다.

현재가 119,000원인데
FDA 승인되면 150,000원 이상 갈 수 있다는 분석이 많아요.

근데 바이오는 승인 불확실성이 있어서...
다들 바이오 투자할 때 리스크 관리 어떻게 하세요?

저는 전체 포트의 20%까지만 바이오에 넣고 있어요.`,
    category: "종목토론",
    likes: 8,
    comments: [
      { nickname: "가치투자자", content: "바이오는 올인하면 안 됩니다. 20% 룰 좋은 전략이에요", likes: 4 },
      { nickname: "분할매수왕", content: "FDA 발표 전에 일부 익절하고 결과 보고 추가매수 추천이요", likes: 3 },
      { nickname: "테마주사냥꾼", content: "렉라자 3상 데이터 좋았으니까 승인 가능성은 높다고 봅니다", likes: 2 },
    ],
  },
  {
    nickname: "방산덕후",
    title: "[한화에어로스페이스] 방산주의 미래",
    content: `한화에어로 현재가 320,000원인데
방산 수출 호조로 목표가를 400,000원 이상 보는 리포트가 나왔네요.

폴란드 K9 자주포 수출, 호주 레드백 장갑차 등
해외 수주가 계속 이어지고 있어서 성장성은 확실해 보입니다.

근데 주가가 1년 만에 2배 올라서 밸류 부담도 있고...
추가매수 vs 홀딩 vs 일부 익절 고민입니다.`,
    category: "종목토론",
    likes: 11,
    comments: [
      { nickname: "장투왕", content: "방산은 수주가 실적으로 이어지는 데 시간이 걸려요. 2~3년 장투 관점으로 가세요", likes: 4 },
      { nickname: "눌림목헌터", content: "300,000원 지지 확인 후 눌림목 매수가 안전합니다", likes: 3 },
      { nickname: "코스피전사", content: "방산은 정책 수혜주라 정권 바뀌어도 꾸준할 거예요", likes: 2 },
      { nickname: "익절의신", content: "2배 올랐으면 원금은 빼놓으세요. 수익금으로만 가져가면 맘 편합니다", likes: 5 },
    ],
  },
  {
    nickname: "변압기충",
    title: "[HD현대일렉트릭] 변압기 수요 폭발",
    content: `HD현대일렉트릭 실적이 미쳤습니다.

변압기 수주잔고가 3년치 이상 밀려있고
북미 전력 인프라 투자 확대로 ASP도 계속 오르고 있어요.

현재가 115,000원 → 목표가 150,000원 (증권사 컨센서스)

AI 데이터센터 전력 수요까지 더해지면
변압기 슈퍼사이클 올 수 있다고 봅니다.`,
    category: "종목토론",
    likes: 9,
    comments: [
      { nickname: "반도체러버", content: "AI랑 변압기가 연결되는 거 처음 알았네요. 데이터센터 전력이 엄청나긴 하죠", likes: 3 },
      { nickname: "테마주사냥꾼", content: "변압기 관련 소부장도 같이 봐야 해요. 특수 변압기유 관련주도 좋습니다", likes: 2 },
      { nickname: "차트마스터", content: "차트 우상향 깔끔하네요. 조정 시 100,000원 부근이 매수 포인트", likes: 4 },
    ],
  },
  {
    nickname: "화장품매니아",
    title: "[아모레퍼시픽] 중국 리오프닝 수혜?",
    content: `아모레퍼시픽이 바닥 찍고 반등하는 것 같은데
중국 소비 회복이 아직 더딘 게 걱정이에요.

현재가 135,000원
52주 최저가 105,000원에서 많이 올라왔는데

일본/동남아 매출 성장은 좋고
중국 의존도를 줄여가고 있다는 점은 긍정적이에요.

화장품주 투자하시는 분 계세요?`,
    category: "종목토론",
    likes: 5,
    comments: [
      { nickname: "식료품전문가", content: "소비재는 브랜드력이 핵심인데 아모레는 확실히 있죠. 장기투자 괜찮다고 봅니다", likes: 3 },
      { nickname: "스윙트레이더", content: "차트상 130,000원 지지하면 160,000원까지 열려있어요. 스윙 적합 종목", likes: 2 },
      { nickname: "해외주식러", content: "에스티로더도 같이 보세요. K-뷰티 수혜로 한국 화장품 수출 늘고 있어요", likes: 1 },
      { nickname: "초보투자자", content: "화장품주는 어떤 지표를 중심으로 봐야 하나요?", likes: 0 },
    ],
  },
  {
    nickname: "로봇투자자",
    title: "[두산로보틱스] 협동로봇 시장 전망",
    content: `두산로보틱스가 협동로봇 시장에서
글로벌 점유율 3위인데 성장 여력이 어떤지 궁금합니다.

현재가 78,000원
적자 기업이라 PER 적용 안 되고 PSR로 봐야 하는데

테슬라 옵티머스, 현대 보스턴다이나믹스 등
로봇 테마가 뜨면 같이 갈 수 있을까요?`,
    category: "종목토론",
    likes: 7,
    comments: [
      { nickname: "바이오덕후", content: "적자 기업은 조심해야 해요. 실적 턴어라운드 시점이 중요합니다", likes: 3 },
      { nickname: "가치투자자", content: "적자 성장주는 기대감으로 가는 거라 변동성 크니까 소액만 넣으세요", likes: 4 },
      { nickname: "단타왕", content: "로봇 테마 뜨면 단타로 먹기 좋은 종목이에요 ㅋㅋ", likes: 1 },
      { nickname: "코스피전사", content: "두산 그룹 지배구조 이슈도 있으니 그것도 같이 체크하세요", likes: 2 },
    ],
  },

  // ──────────────────── 수익인증 (4) ────────────────────
  {
    nickname: "익절의신",
    title: "SK하이닉스 3개월 수익 +42% 인증합니다",
    content: `3개월 전 130,000원에 매수한 SK하이닉스
오늘 185,000원에 전량 매도했습니다!

수익률: +42.3%
수익금: 약 550만원

HBM 사이클 초기에 진입해서
목표가 도달 후 기계적으로 익절했습니다.

역시 계획대로 매매하는 게 답이에요.
다들 익절하는 그날까지 화이팅!`,
    category: "수익인증",
    likes: 15,
    comments: [
      { nickname: "삼전홀더", content: "축하드립니다... 저는 삼전 물려있는데 ㅠㅠ 부럽네요", likes: 2 },
      { nickname: "초보투자자", content: "와 42%... 저도 이렇게 되고 싶네요. 비결이 뭐에요?", likes: 3 },
      { nickname: "분할매수왕", content: "기계적 익절 대단합니다. 저는 매번 더 오를까봐 못 팔아요", likes: 4 },
      { nickname: "단타왕", content: "550만원이면 진짜 크네요 ㅋㅋ 축하합니다!", likes: 1 },
    ],
  },
  {
    nickname: "수익인증맨",
    title: "한화에어로 6개월 수익 +85% 인생 수익",
    content: `한화에어로스페이스 173,000원에 매수해서
320,000원 현재까지 홀딩 중입니다.

수익률: +85%
평가수익: 약 1,470만원 (100주 기준)

방산 테마 초기에 들어간 게 신의 한 수였어요.
아직 매도 안 하고 목표가 400,000원까지 보고 있습니다.

인생에 이런 종목 한 번은 만나는 것 같아요 ㅎㅎ`,
    category: "수익인증",
    likes: 14,
    comments: [
      { nickname: "방산덕후", content: "대박... 방산 초기 진입이면 진짜 안목 있으시네요. 저도 좀 더 일찍 살걸", likes: 5 },
      { nickname: "익절의신", content: "85%면 원금은 빼놓으세요! 혹시 모르니까. 수익금으로만 가져가세요", likes: 4 },
      { nickname: "눌림목헌터", content: "400,000원 목표면 아직 갈 길이 남았네요. 화이팅입니다!", likes: 2 },
    ],
  },
  {
    nickname: "손절못하는자",
    title: "솔직한 손실 고백... -35% 물려있습니다",
    content: `올해 초 테마주 올인했다가
현재 평가손실 -35%입니다...

A종목: -42% (매수가 대비 반토막 직전)
B종목: -28%
C종목: -18%

총 손실금액: 약 800만원

물타기만 하다가 이 지경이 됐네요.
이제 와서 손절해야 하나 그냥 들고 있어야 하나...

같은 실수 반복하지 않으려면 어떻게 해야 할까요?
진심으로 조언 부탁드립니다.`,
    category: "수익인증",
    likes: 12,
    comments: [
      { nickname: "가치투자자", content: "테마주 올인은 정말 위험해요. 일단 가장 안 좋은 종목부터 정리하고 우량주로 갈아타세요", likes: 5 },
      { nickname: "차트마스터", content: "차트 깨진 종목은 미련 버리세요. 그 돈으로 다른 종목에서 복구하는 게 빠릅니다", likes: 4 },
      { nickname: "분할매수왕", content: "힘내세요. 수업료라 생각하고 앞으로는 분산투자 + 분할매수 원칙 지키세요", likes: 3 },
      { nickname: "익절의신", content: "800만원이면 아직 복구 가능해요. 멘탈 잡고 원칙부터 세우세요. 응원합니다", likes: 5 },
    ],
  },
  {
    nickname: "스윙트레이더",
    title: "이번 주 스윙매매 수익 공개 (+12%)",
    content: `이번 주 스윙매매 결과 공유합니다.

월요일: HD현대일렉트릭 매수 (105,000원)
수요일: 목표가 도달로 매도 (115,000원)
수익률: +9.5%

화요일: 한화오션 매수 (67,500원)
목요일: 매도 (72,000원)
수익률: +6.7%

주간 총 수익: 약 180만원
평균 보유기간: 2일

눌림목에서 사서 반등 시 파는 전략인데
승률이 꽤 괜찮아요. 10번 중 7번은 성공합니다.`,
    category: "수익인증",
    likes: 10,
    comments: [
      { nickname: "단타왕", content: "스윙 안정적이네요. 저도 단타보다 스윙으로 전환할까 고민 중", likes: 3 },
      { nickname: "눌림목헌터", content: "눌림목 + 스윙 조합 최고죠. 저도 비슷한 전략 쓰고 있어요", likes: 4 },
      { nickname: "초보투자자", content: "스윙매매 공부하고 싶은데 추천 책이나 유튜브 있을까요?", likes: 2 },
      { nickname: "장투왕", content: "2일 만에 6~9%면 엄청난 수익률이네요. 대단합니다", likes: 1 },
    ],
  },
];

// ============================================================
// 페이지 컴포넌트
// ============================================================

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function SeedCommunityPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [progress, setProgress] = useState("");
  const [details, setDetails] = useState<string[]>([]);

  const handleSeed = async () => {
    if (status === "loading") return;
    setStatus("loading");
    setProgress("시작 중...");
    setDetails([]);

    try {
      let totalComments = 0;

      for (let i = 0; i < seedPosts.length; i++) {
        const post = seedPosts[i];
        setProgress(`${i + 1}/${seedPosts.length} 게시글 등록 중...`);

        // 1) 게시글 생성
        const postId = await addPost({
          nickname: post.nickname,
          title: post.title,
          content: post.content,
          category: post.category,
        });

        // 2) likes 업데이트 (addPost는 likes=0으로 고정하므로 직접 업데이트)
        if (post.likes > 0) {
          const postRef = doc(db, "communityPosts", postId);
          await updateDoc(postRef, { likes: post.likes });
        }

        // 3) 댓글 생성
        for (const comment of post.comments) {
          const commentId = await addComment({
            postId,
            nickname: comment.nickname,
            content: comment.content,
          });

          // likes 업데이트 (addComment는 likes=0으로 고정)
          if (comment.likes > 0) {
            const commentRef = doc(db, "communityComments", commentId);
            await updateDoc(commentRef, { likes: comment.likes });
          }

          totalComments++;
        }

        // commentCount는 addComment가 자동 증가시키므로 별도 처리 불필요

        setDetails((prev) => [
          ...prev,
          `✓ [${post.category}] ${post.title} (댓글 ${post.comments.length}개)`,
        ]);

        // 속도 제한 방지
        await delay(100);
      }

      setProgress(
        `완료! 게시글 ${seedPosts.length}개, 댓글 ${totalComments}개 등록됨`
      );
      setStatus("success");
    } catch (err) {
      console.error(err);
      setProgress(`오류 발생: ${err instanceof Error ? err.message : String(err)}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">커뮤니티 시드 데이터</h1>
        <p className="text-gray-400 mb-6">
          30개 게시글 + 80~100개 댓글을 Firestore에 등록합니다.
        </p>

        <button
          onClick={handleSeed}
          disabled={status === "loading"}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            status === "loading"
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : status === "success"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : status === "error"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {status === "loading"
            ? "등록 중..."
            : status === "success"
            ? "완료! 다시 실행"
            : status === "error"
            ? "오류 발생 — 다시 시도"
            : "시드 데이터 등록"}
        </button>

        {progress && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm font-mono ${
              status === "success"
                ? "bg-green-900/30 text-green-400"
                : status === "error"
                ? "bg-red-900/30 text-red-400"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {progress}
          </div>
        )}

        {details.length > 0 && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              등록 내역
            </h3>
            <ul className="space-y-1 text-xs text-gray-300 font-mono">
              {details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-900 rounded-lg text-sm text-gray-400">
          <h3 className="font-semibold mb-2">카테고리별 게시글 수</h3>
          <ul className="space-y-1">
            <li>자유: 10개</li>
            <li>질문: 8개</li>
            <li>종목토론: 8개</li>
            <li>수익인증: 4개</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
