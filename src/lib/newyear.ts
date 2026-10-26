import { Solar } from "lunar-javascript";
import { calculateSaju, koGanZhi, tenGod, GAN_ELEMENT, type Element, type SajuChart, type SajuInput } from "./saju";
import { todayKST } from "./time";

export type MonthFortune = { label: string; ganZhi: string; ko: string; ganTenGod: string; zhiTenGod: string };

export type NewYearChart = {
  base: SajuChart;
  year: { year: number; ganZhi: string; ko: string; element: Element; ganTenGod: string; zhiTenGod: string };
  months: MonthFortune[];
  /** 그 해에 걸쳐 있는 대운 */
  daeun: { startAge: number; ganZhi: string; ko: string } | null;
};

/** 10월부터는 다음 해 신년운세를 판다. */
export function newYearTarget(now = new Date()) {
  const { y, m } = todayKST(now);
  return m >= 10 ? y + 1 : y;
}

export const TEN_GOD_YEAR: Record<string, string> = {
  비견: "나와 같은 기운이 들어오는 해입니다. 독립심과 추진력이 커지고 동료·경쟁자가 함께 늘어납니다.",
  겁재: "나와 닮았지만 결이 다른 기운이 들어옵니다. 경쟁과 지출이 늘 수 있어 돈과 사람 관리가 관건입니다.",
  식신: "재능과 표현이 꽃피는 해입니다. 하고 싶은 일을 펼치기 좋고 먹고사는 일에 여유가 생깁니다.",
  상관: "틀을 깨고 새로 만드는 해입니다. 아이디어와 말솜씨가 빛나지만 윗사람과의 마찰은 조심해야 합니다.",
  편재: "큰 기회와 활동 무대가 넓어지는 해입니다. 사업·투자 감각이 살아나지만 무리한 확장은 경계해야 합니다.",
  정재: "성실함이 보상받는 해입니다. 안정적인 수입과 생활의 질서가 잡히고, 연애운도 차분하게 흐릅니다.",
  편관: "압박과 도전이 함께 오는 해입니다. 책임이 커지는 만큼 버티면 큰 성장이 따릅니다.",
  정관: "명예와 신뢰가 쌓이는 해입니다. 승진·자격·소속이 안정되고 바른 선택이 인정받습니다.",
  편인: "생각이 깊어지고 새로운 공부에 끌리는 해입니다. 직관이 예리해지지만 결정이 늦어지지 않게 해야 합니다.",
  정인: "도움과 배움이 들어오는 해입니다. 문서·계약·시험운이 좋고 주변의 지원을 받기 쉽습니다.",
};

export function calculateNewYear(input: SajuInput, now = new Date()): NewYearChart {
  const base = calculateSaju(input, now);
  const target = newYearTarget(now);
  const dayGan = base.dayMaster.gan;
  const yearGz = Solar.fromYmd(target, 6, 1).getLunar().getYearInGanZhiByLiChun();

  // 절기 월은 대략 매달 4~8일에 바뀌므로 각 달 15일의 월주를 그 달의 대표로 쓴다. 입춘(2월)부터 다음 해 1월까지.
  const months: MonthFortune[] = Array.from({ length: 12 }, (_, i) => {
    const month = ((i + 1) % 12) + 1;
    const y = month === 1 ? target + 1 : target;
    const gz = Solar.fromYmd(y, month, 15).getLunar().getMonthInGanZhiExact();
    return { label: `${month}월`, ganZhi: gz, ko: koGanZhi(gz), ganTenGod: tenGod(dayGan, gz[0]), zhiTenGod: tenGod(dayGan, gz[1]) };
  });

  // 대운은 startYear(출생 연도 + 대운수)부터 시작한다.
  const current = [...base.daeun].reverse().find((d) => d.startYear <= target) ?? null;

  return {
    base,
    year: {
      year: target,
      ganZhi: yearGz,
      ko: koGanZhi(yearGz),
      element: GAN_ELEMENT[yearGz[0]],
      ganTenGod: tenGod(dayGan, yearGz[0]),
      zhiTenGod: tenGod(dayGan, yearGz[1]),
    },
    months,
    daeun: current ? { startAge: current.startAge, ganZhi: current.ganZhi, ko: current.ko } : null,
  };
}
