export type QueryKey = readonly unknown[];

// 배열 queryKey를 결정적 문자열로 변환
// 힌트: JSON.stringify의 replacer로 객체 키를 정렬하면 순서 무관해져요

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (Object.prototype.toString.call(value) !== "[object Object]") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function hashKey(queryKey: QueryKey): string {
  return JSON.stringify(queryKey, (_k, v) => {
    if (isPlainObject(v)) {
      return Object.keys(v)
        .sort()
        .reduce((result: Record<string, unknown>, key) => {
          result[key] = v[key];
          return result;
        }, {});
      // 정렬 후 새로운 객체로 만드는 과정임
    }
    return v;
  });
}

/**
 * replacer가 정렬, stringify는 그 다음 레벨 순회
 * null, 배열(allowlist replace), 함수 (function replacer)이 가능 / null이 기본값
 * 배열: 배열에 담긴 문자열,숫자 배열인덱스에 해당하는 키 만 남기고 나머지 제거 (깊이 상관없이 모든 키)
 * 함수: 반환에 따라 역할이 달라짐, undefined - 제외, 값 - 키에 해당하는 값 변환
 * stringify에 대한 더 딮한 내용이 있으나 여기서는 다루지 않음
 */
