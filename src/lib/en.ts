// 해외 페이지에서 사주 용어를 영어로 보여 주기 위한 표. 클라이언트에서도 쓸 수 있게 다른 모듈을 import하지 않는다.
// 키는 saju.ts가 내놓는 한국어 값(오행·십성·기둥 이름)과 한자다.

export const ELEMENT_EN: Record<string, string> = { 목: "Wood", 화: "Fire", 토: "Earth", 금: "Metal", 수: "Water" };

export const YINYANG_EN: Record<string, string> = { 양: "Yang", 음: "Yin" };

export const PILLAR_EN: Record<string, string> = { 시주: "Hour", 일주: "Day", 월주: "Month", 연주: "Year" };

/** 십성. 사이트 화면과 AI 풀이에서 같은 이름을 쓴다. */
export const TEN_GOD_EN: Record<string, string> = {
  일간: "Day Master",
  비견: "Peer",
  겁재: "Rival",
  식신: "Creator",
  상관: "Rebel",
  편재: "Windfall",
  정재: "Steady Wealth",
  편관: "Challenger",
  정관: "Authority",
  편인: "Mystic",
  정인: "Mentor",
};

export const ANIMAL_EN: Record<string, string> = {
  子: "Rat", 丑: "Ox", 寅: "Tiger", 卯: "Rabbit", 辰: "Dragon", 巳: "Snake",
  午: "Horse", 未: "Sheep", 申: "Monkey", 酉: "Rooster", 戌: "Dog", 亥: "Pig",
};

/** 한국에서 해의 이름을 부를 때 쓰는 천간의 색(예: 丙午 = 붉은 말) */
const STEM_COLOR_EN: Record<string, string> = {
  甲: "Blue", 乙: "Blue", 丙: "Red", 丁: "Red", 戊: "Yellow", 己: "Yellow", 庚: "White", 辛: "White", 壬: "Black", 癸: "Black",
};

const STEM_ELEMENT_EN: Record<string, string> = {
  甲: "Wood", 乙: "Wood", 丙: "Fire", 丁: "Fire", 戊: "Earth", 己: "Earth", 庚: "Metal", 辛: "Metal", 壬: "Water", 癸: "Water",
};

const STEM_YANG = new Set(["甲", "丙", "戊", "庚", "壬"]);

const GAN_ROMAN: Record<string, string> = {
  甲: "gap", 乙: "eul", 丙: "byeong", 丁: "jeong", 戊: "mu", 己: "gi", 庚: "gyeong", 辛: "sin", 壬: "im", 癸: "gye",
};
const ZHI_ROMAN: Record<string, string> = {
  子: "ja", 丑: "chuk", 寅: "in", 卯: "myo", 辰: "jin", 巳: "sa", 午: "o", 未: "mi", 申: "sin", 酉: "yu", 戌: "sul", 亥: "hae",
};

/** 甲子 → "Gap-ja" (국어의 로마자 표기법 기준) */
export function romanize(ganZhi: string) {
  const [gan, zhi] = [...ganZhi];
  const s = `${GAN_ROMAN[gan]}-${ZHI_ROMAN[zhi]}`;
  return s[0].toUpperCase() + s.slice(1);
}

/** 일주·띠를 "Yin Earth Rabbit"처럼 부른다. */
export function kSign(ganZhi: string, withYinYang = true) {
  const [gan, zhi] = [...ganZhi];
  return `${withYinYang ? (STEM_YANG.has(gan) ? "Yang " : "Yin ") : ""}${STEM_ELEMENT_EN[gan]} ${ANIMAL_EN[zhi]}`;
}

/** 한 해를 한국식으로 부른다. 丁未 → "Year of the Red Sheep" */
export function kYearName(ganZhi: string) {
  const [gan, zhi] = [...ganZhi];
  return `Year of the ${STEM_COLOR_EN[gan]} ${ANIMAL_EN[zhi]}`;
}

export const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 일간(나를 나타내는 글자)별 요약 */
export const DAY_MASTER_EN: Record<string, { title: string; text: string }> = {
  甲: { title: "The Tall Tree", text: "Once you set a goal, you grow straight toward it. You are a natural pioneer with strong leadership and pride, and you would rather stand tall than bend." },
  乙: { title: "The Climbing Vine", text: "Soft on the outside, unstoppable underneath. You adapt to any setting, read people well, and always find a way around obstacles." },
  丙: { title: "The Sun", text: "Bright, honest and warm, you light up a room just by walking in. You are expressive and passionate, and hiding how you feel is hard for you." },
  丁: { title: "The Candle Flame", text: "Warm, focused and attentive. You may look calm, but a steady fire burns inside you, and you care deeply for the people close to you." },
  戊: { title: "The Mountain", text: "Reliable and generous, with a center that does not shake easily. People lean on you because you make them feel safe." },
  己: { title: "The Garden Soil", text: "Practical and nurturing, you know how to grow people and projects. You are quietly tougher than you look." },
  庚: { title: "The Raw Steel", text: "Decisive and loyal, with a clear sense of right and wrong. Like raw ore, the more life refines you, the brighter you shine." },
  辛: { title: "The Jewel", text: "Sharp senses and high standards. You love what is refined and well made, and you hold on to your own quiet dignity." },
  壬: { title: "The Ocean", text: "You think big and see far. You love freedom and movement, and you have room in your heart for many people and ideas." },
  癸: { title: "The Rain", text: "Intuitive and sensitive, you change the world around you quietly, the way rain soaks into soil. Your mind is deep and full of ideas." },
};

/** 일지(일주의 동물)별 한 줄 성향 */
export const ANIMAL_TRAIT_EN: Record<string, string> = {
  子: "The Rat in you is quick, resourceful and always one step ahead.",
  丑: "The Ox in you is patient and steady, and finishes what it starts.",
  寅: "The Tiger in you is brave and independent, and hates being caged.",
  卯: "The Rabbit in you is gentle and tactful, with a fine eye for beauty.",
  辰: "The Dragon in you dreams big and carries hidden reserves of power.",
  巳: "The Snake in you is perceptive, strategic and quietly magnetic.",
  午: "The Horse in you is free-spirited and energetic, and needs room to run.",
  未: "The Sheep in you is kind and artistic, and keeps the peace.",
  申: "The Monkey in you is clever and playful, and solves problems fast.",
  酉: "The Rooster in you is precise and confident, and loves to get things right.",
  戌: "The Dog in you is loyal and fair, and stands up for its people.",
  亥: "The Pig in you is generous and sincere, and enjoys life's good things.",
};

/** 그해 천간의 십성이 주는 의미 (newyear.ts의 TEN_GOD_YEAR 영문판) */
export const TEN_GOD_YEAR_EN: Record<string, string> = {
  비견: "A year of your own energy coming back to you. Independence and drive grow, and so do friends and rivals.",
  겁재: "Energy like yours, but with a different edge, arrives. Competition and spending can rise, so managing money and people is key.",
  식신: "A year for your talents to bloom. A good time to do what you love, with more ease in everyday life.",
  상관: "A year to break the mold and build something new. Ideas and words shine, but watch for friction with people above you.",
  편재: "Big chances and a wider stage. Your instinct for business and opportunity wakes up, but avoid overreaching.",
  정재: "A year when steady effort pays off. Income and daily routines settle, and love moves at a calm pace.",
  편관: "Pressure and challenge arrive together. Responsibilities grow, and if you hold on, so do you.",
  정관: "A year of reputation and trust. Promotions, credentials and belonging settle, and doing the right thing is recognized.",
  편인: "Your thinking deepens and new studies call you. Intuition sharpens, but don't let decisions drag on.",
  정인: "Help and learning flow in. A good year for documents, contracts and exams, and for receiving support from others.",
};
