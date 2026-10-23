/** Splits "2,500+" into "", "2,500", "+" so the digits can roll while the text around them stays. */
export function parseStat(value: string) {
  const match = value.match(/^(\D*)(\d[\d,.]*\d|\d)(.*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  return { prefix, digits, suffix };
}

/**
 * How far each digit's wheel turns, like an odometer counting up from zero: the leftmost digit turns straight
 * to its value and each digit to its right turns one more full round (at most three), so the ones place spins fastest.
 */
export function wheelTurns(digits: string) {
  let column = 0;
  return [...digits].map((char) => (/\d/.test(char) ? Number(char) + 10 * Math.min(column++, 3) : null));
}
