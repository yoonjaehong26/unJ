export const CITIES = [
  { emoji: '🗽', name: '뉴욕' },
  { emoji: '🗼', name: '도쿄' },
  { emoji: '🎡', name: '런던' },
  { emoji: '🗼', name: '파리' },
  { emoji: '🏛️', name: '로마' },
  { emoji: '🕌', name: '이스탄불' },
  { emoji: '🏯', name: '오사카' },
  { emoji: '🌉', name: '시드니' },
  { emoji: '🏙️', name: '두바이' },
  { emoji: '🌆', name: '상하이' },
  { emoji: '🏙️', name: '홍콩' },
  { emoji: '🌃', name: '싱가포르' },
  { emoji: '🏰', name: '프라하' },
  { emoji: '🏛️', name: '아테네' },
  { emoji: '🌆', name: '베를린' },
  { emoji: '🏙️', name: '암스테르담' },
  { emoji: '🎭', name: '비엔나' },
  { emoji: '🏛️', name: '마드리드' },
  { emoji: '🌇', name: '바르셀로나' },
  { emoji: '🏙️', name: '밀라노' },
  { emoji: '⛩️', name: '교토' },
  { emoji: '🏯', name: '베이징' },
  { emoji: '🌃', name: '방콕' },
  { emoji: '🏙️', name: '쿠알라룸푸르' },
  { emoji: '🌉', name: '밴쿠버' },
  { emoji: '🍁', name: '토론토' },
  { emoji: '🌆', name: '시카고' },
  { emoji: '🌉', name: '샌프란시스코' },
  { emoji: '🌴', name: 'LA' },
  { emoji: '🎰', name: '라스베가스' },
  { emoji: '🏖️', name: '마이애미' },
  { emoji: '🌋', name: '멕시코시티' },
  { emoji: '🏔️', name: '취리히' },
  { emoji: '🌆', name: '스톡홀름' },
  { emoji: '❄️', name: '헬싱키' },
  { emoji: '🏙️', name: '오슬로' },
  { emoji: '🦘', name: '멜버른' },
  { emoji: '🌺', name: '호놀룰루' },
  { emoji: '🐧', name: '웰링턴' },
  { emoji: '🌆', name: '카이로' },
];

export const MAX_ANONYMOUS_PARTICIPANTS = CITIES.length;

export function getAlias(aliasIndex) {
  const city = CITIES[aliasIndex];
  if (!city) return `참가자 ${aliasIndex + 1}`;
  return `${city.emoji}${city.name}`;
}

export function getDisplayName(aliasIndex, realName) {
  return `${getAlias(aliasIndex)}(${realName})`;
}
