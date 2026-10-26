/** 받침 유무에 맞춰 조사를 붙인다. josa("목", "이", "가") → "목이", josa("화", "을", "를") → "화를" */
export function josa(word: string, withFinal: string, withoutFinal: string) {
  const last = word.charCodeAt(word.length - 1);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  const hasFinal = isHangul ? (last - 0xac00) % 28 !== 0 : false;
  return word + (hasFinal ? withFinal : withoutFinal);
}
