export const ANIMALS = [
  { emoji: '🐶', name: '강아지' },
  { emoji: '🐱', name: '고양이' },
  { emoji: '🐭', name: '쥐' },
  { emoji: '🐹', name: '햄스터' },
  { emoji: '🐰', name: '토끼' },
  { emoji: '🦊', name: '여우' },
  { emoji: '🐻', name: '곰' },
  { emoji: '🐼', name: '판다' },
  { emoji: '🐨', name: '코알라' },
  { emoji: '🐯', name: '호랑이' },
  { emoji: '🦁', name: '사자' },
  { emoji: '🐮', name: '소' },
  { emoji: '🐷', name: '돼지' },
  { emoji: '🐸', name: '개구리' },
  { emoji: '🐵', name: '원숭이' },
  { emoji: '🐧', name: '펭귄' },
  { emoji: '🐦', name: '새' },
  { emoji: '🦆', name: '오리' },
  { emoji: '🦅', name: '독수리' },
  { emoji: '🦉', name: '부엉이' },
  { emoji: '🦋', name: '나비' },
  { emoji: '🐢', name: '거북이' },
  { emoji: '🦎', name: '도마뱀' },
  { emoji: '🐊', name: '악어' },
  { emoji: '🐬', name: '돌고래' },
  { emoji: '🐳', name: '고래' },
  { emoji: '🦈', name: '상어' },
  { emoji: '🐙', name: '문어' },
  { emoji: '🦑', name: '오징어' },
  { emoji: '🦀', name: '게' },
  { emoji: '🐝', name: '꿀벌' },
  { emoji: '🦓', name: '얼룩말' },
  { emoji: '🦒', name: '기린' },
  { emoji: '🐘', name: '코끼리' },
  { emoji: '🦏', name: '코뿔소' },
  { emoji: '🦛', name: '하마' },
  { emoji: '🦘', name: '캥거루' },
  { emoji: '🦔', name: '고슴도치' },
  { emoji: '🦡', name: '오소리' },
  { emoji: '🦦', name: '수달' },
];

export const MAX_ANONYMOUS_PARTICIPANTS = ANIMALS.length;

export function getAlias(aliasIndex) {
  const animal = ANIMALS[aliasIndex];
  if (!animal) return `참가자 ${aliasIndex + 1}`;
  return `${animal.emoji}${animal.name}`;
}

export function getDisplayName(aliasIndex, realName) {
  return `${getAlias(aliasIndex)}(${realName})`;
}
