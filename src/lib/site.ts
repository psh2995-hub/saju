// 상호명. 환경 변수로 덮어쓸 수 있다.
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "운명다방";

/** 전자상거래법상 사이트 하단에 표시해야 하는 사업자 정보. 값이 없으면 '등록 예정'으로 표시된다. */
export const BUSINESS = {
  companyName: process.env.NEXT_PUBLIC_BIZ_NAME,
  ceo: process.env.NEXT_PUBLIC_BIZ_CEO,
  registrationNumber: process.env.NEXT_PUBLIC_BIZ_REG_NO,
  mailOrderNumber: process.env.NEXT_PUBLIC_BIZ_MAIL_ORDER_NO,
  address: process.env.NEXT_PUBLIC_BIZ_ADDRESS,
  phone: process.env.NEXT_PUBLIC_BIZ_PHONE,
  email: process.env.NEXT_PUBLIC_BIZ_EMAIL,
  privacyOfficer: process.env.NEXT_PUBLIC_BIZ_PRIVACY_OFFICER,
};

export const PENDING = "등록 예정";
