// 상호명. 환경 변수로 덮어쓸 수 있다.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "운명다방";

/**
 * 전자상거래법상 사이트 하단에 표시해야 하는 사업자 정보(사업자등록증 기준). 환경 변수로 덮어쓸 수 있고,
 * 값이 없으면 '등록 예정'으로 표시된다.
 */
export const BUSINESS = {
  companyName: process.env.NEXT_PUBLIC_BIZ_NAME || "시간의결",
  ceo: process.env.NEXT_PUBLIC_BIZ_CEO || "박상현",
  registrationNumber: process.env.NEXT_PUBLIC_BIZ_REG_NO || "266-43-01343",
  mailOrderNumber: process.env.NEXT_PUBLIC_BIZ_MAIL_ORDER_NO,
  address: process.env.NEXT_PUBLIC_BIZ_ADDRESS || "서울특별시 서초구 서초중앙로 96(서초동)",
  phone: process.env.NEXT_PUBLIC_BIZ_PHONE,
  email: process.env.NEXT_PUBLIC_BIZ_EMAIL,
  privacyOfficer: process.env.NEXT_PUBLIC_BIZ_PRIVACY_OFFICER,
};

export const PENDING = "등록 예정";
