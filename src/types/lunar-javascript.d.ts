// lunar-javascript는 타입 정의를 제공하지 않으므로 이 프로젝트에서 쓰는 API만 선언한다.
declare module "lunar-javascript" {
  export class Solar {
    static fromYmd(y: number, m: number, d: number): Solar;
    static fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    next(days: number): Solar;
    toYmd(): string;
  }

  export class Lunar {
    static fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getYearInGanZhiByLiChun(): string;
    getMonthInGanZhiExact(): string;
    getPrevJie(): JieQi;
    getNextJie(): JieQi;
  }

  export class JieQi {
    getName(): string;
    getSolar(): Solar;
  }

  export const LunarUtil: {
    /** 지지별 지장간. 첫 번째가 본기. */
    ZHI_HIDE_GAN: Record<string, string[]>;
  };

  export class EightChar {
    setSect(sect: 1 | 2): void;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
    getYun(gender: 0 | 1): Yun;
  }

  export class Yun {
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getGanZhi(): string;
  }
}
