export function getRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function round(number: number, count: number): number {
  return Math.round(number * (10 ** count)) / (10 ** count)
}
