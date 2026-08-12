declare module 'badwords-ko' {
  class BadWordsFilter {
    constructor();
    clean(text: string): string;
    isProfane(text: string): boolean;
  }
  export default BadWordsFilter;
}
