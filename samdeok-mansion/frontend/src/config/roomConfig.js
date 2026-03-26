import { lazy } from 'react';

// 코드 스플리팅: 각 방 컴포넌트를 lazy load (초기 번들 사이즈 최적화)
const ReplyRoom = lazy(() => import('../pages/ReplyRoom.jsx'));
const WhatWasItRoom = lazy(() => import('../pages/WhatWasItRoom.jsx'));
const DeokflixRoom = lazy(() => import('../pages/DeokflixRoom.jsx'));
const FingerPrinceRoom = lazy(() => import('../pages/FingerPrinceRoom.jsx'));
const GolapingRoom = lazy(() => import('../pages/GolapingRoom.jsx'));
const NyangShopperRoom = lazy(() => import('../pages/NyangShopperRoom.jsx'));

const roomConfig = [
  {
    slug: 'reply',
    room: '101호 대필 사무소',
    title: '답장, 뭐라고 할까?',
    desc: '읽씹하긴 미안하고, 내 말 하긴 힘들 때 대신 써주냥',
    cost: 2,
    emoji: '⌨️',
    isHot: true,
    component: ReplyRoom,
    seo: {
      title: '답장 뭐하지 - 카톡 답장 AI 대필 | 삼덕맨션',
      description: '읽씹하기 미안할 때, AI가 센스있게 카톡 답장을 대신 써줍니다. 삼덕맨션 101호 대필 사무소.',
    },
  },
  {
    slug: 'whatwasit',
    room: '지하 1층 창고',
    title: '뭐였더라?',
    desc: '이름이 기억 안 나는 영화, 노래, 물건 다 찾아주냥',
    cost: 1,
    emoji: '🔍',
    isHot: false,
    component: WhatWasItRoom,
    seo: {
      title: '뭐였더라 - 기억 못 하는 영화 노래 찾기 | 삼덕맨션',
      description: '제목이 기억 안 나는 영화, 노래, 물건을 AI가 찾아줍니다. 삼덕맨션 지하 창고.',
    },
  },
  {
    slug: 'deokflix',
    room: '202호 상영관',
    title: '덕플릭스',
    desc: '오늘 뭐 볼지 취향 저격으로 딱 골라주냥',
    cost: 1,
    emoji: '🍿',
    isHot: false,
    component: DeokflixRoom,
    seo: {
      title: '덕플릭스 - 취향 저격 영화 드라마 추천 | 삼덕맨션',
      description: '스와이프로 취향 분석, AI가 오늘 볼 영화를 딱 골라줍니다. 삼덕맨션 202호 상영관.',
    },
  },
  {
    slug: 'fingerprince',
    room: '1층 관리실',
    title: '핑거프린스',
    desc: '검색하기도 민망한 사소한 질문, 다 대답해준다냥',
    cost: 0,
    emoji: '💡',
    isHot: false,
    component: FingerPrinceRoom,
    seo: {
      title: '핑거프린스 - 사소한 질문 즉답 AI | 삼덕맨션',
      description: '검색하기 민망한 사소한 질문, 삼덕이가 바로 대답해줍니다. 무료!',
    },
  },
  {
    slug: 'golaping',
    room: '옥상 라운지',
    title: '골라핑',
    desc: '오늘 점심 뭐 먹지? 결정장애 대신 룰렛 돌려주냥',
    cost: 0,
    emoji: '🎲',
    isHot: false,
    component: GolapingRoom,
    seo: {
      title: '골라핑 - 점심 메뉴 랜덤 룰렛 | 삼덕맨션',
      description: '결정장애 끝! 후보만 던지면 삼덕이가 꼬리로 골라줍니다. 무료!',
    },
  },
  {
    slug: 'nyangshopper',
    room: '301호 쇼핑 라운지',
    title: '냥스널쇼퍼',
    desc: '링크만 던져주면 상품 분석해서 조건에 딱 맞는 추천해준다냥',
    cost: 1,
    emoji: '🛒',
    isHot: true,
    component: NyangShopperRoom,
    seo: {
      title: '냥스널쇼퍼 - 링크 기반 AI 상품 추천 | 삼덕맨션',
      description: '상품 링크만 주면 AI가 상세 분석해서 내 조건에 맞는 상품을 추천해줍니다.',
    },
  },
];

export default roomConfig;

// 헬퍼: slug로 방 찾기
export const getRoomBySlug = (slug) => roomConfig.find((r) => r.slug === slug);
