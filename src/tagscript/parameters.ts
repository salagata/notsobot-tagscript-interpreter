
const QuotesAll = {
  '"': '"',
  '\'': '\'',
  '’': '’',
  '‚': '‛',
  '“': '”',
  '„': '‟',
  '「': '」',
  '『': '』',
  '〝': '〞',
  '﹁': '﹂',
  '﹃': '﹄',
  '＂': '＂',
  '｢': '｣',
  '«': '»',
  '《': '》',
  '〈': '〉',
};

const Quotes = {
  END: Object.values(QuotesAll),
  START: Object.keys(QuotesAll),
};

export function stringArguments(value: string): Array<string> {
  const results: Array<string> = [];
  while (value.length) {
    let result = value.slice(0, 1);
    value = value.slice(1);

    // check to see if this word starts with any of the quote starts
    // if yes, then continue onto the next word
    if (Quotes.START.includes(result)) {
      let index = value.indexOf((QuotesAll as any)[result], 1);
      if (index !== -1) {
        result = value.slice(0, index);
        value = value.slice(index + 1).trim();
        results.push(result);
        continue;
      }
    }
    // check for the next space, if not then we consume the whole thing
    let index = value.indexOf(' ');
    if (index === -1) {
      result += value.slice(0, value.length);
      value = '';
    } else {
      result += value.slice(0, index);
      value = value.slice(index).trim();
    }
    results.push(result);
  }
  return results;
}