const dictionaries  = require('../dist/dictionary.json');

const cachedDictionaries = {};
const cachedCombinedDictionaries = {}

function getDictionary(name, options = {}) {
  const { reverse } = options;
  let cacheName     = reverse ? `R_${ name }` : name;
  let dictionary    = cachedDictionaries[cacheName];
  if (!dictionary) {
    dictionary = dictionaries[name].reduce((map, entry) => {
      const first = options.reverse ? 1 : 0;
  
      map[entry[first]] = entry[1 - first];
  
      return map;
    }, {})
    cachedDictionaries[cacheName] = dictionary
  }

  return dictionary;
}

function convertChain(input, chains) {
  return chains.reduce((input, chain) => {
    const cacheName = chain.map(c => {
      return c.reverse ? `R_${ c.name }` : c.name;
    }).join('_')
    let combine = cachedCombinedDictionaries[cacheName]
    if (!combine) {
      combine =  chain.reduce((acc, cur) => {
        const dict = getDictionary(cur.name, { reverse: cur.reverse })
        acc = { ...acc, ...dict }
        return acc
      }, {})
      cachedCombinedDictionaries[cacheName] = combine
    }

    const translated = translate(input, combine)
    return translated
  }, input);
}

exports.hongKongToSimplified = function (text) {
  return convertChain(text, [
    [
      { name:'HKVariantsRevPhrases' },
      { name:'HKVariants', reverse: true },
    ],
    [
      { name:'TSPhrases' },
      { name:'TSCharacters'}
    ],
  ]);
};

exports.simplifiedToHongKong = function (text) {
  return convertChain(text, [
    [
      { name:'STPhrases'},
      { name:'STCharacters'}
    ],
    [
      { name:'HKVariantsPhrases'},
      { name:'HKVariants'}
    ]
  ]);
};

exports.simplifiedToTraditional = function (text) {
  return convertChain(text, [
    [
      { name:'STPhrases'},
      { name:'STCharacters'}
    ]
  ]);
};

exports.simplifiedToTaiwan = function (text) {
  return convertChain(text, [
    [
      { name:'STPhrases'},
      { name:'STCharacters'}
    ],
    [
      { name:'TWVariants'}
    ]
  ]);
};

exports.simplifiedToTaiwanWithPhrases = function (text) {
  return convertChain(text, [
    [
      { name:'STPhrases'},
      { name:'STCharacters'}
    ],
    [
      { name:'TWPhrasesIT'},
      { name:'TWPhrasesName'},
      { name:'TWPhrasesOther'},
      { name:'TWVariants'}
    ]
  ]);
};

exports.traditionalToHongKong = function (text) {
  return convertChain(text, [
    [
      { name:'HKVariants'}
    ]
  ]);
};

exports.traditionalToSimplified = function (text) {
  return convertChain(text, [
    [
      { name:'TSPhrases'},
      { name:'TSCharacters'}
    ]
  ]);
};

exports.traditionalToTaiwan = function (text) {
  return convertChain(text, [
    [
      { name:'TWVariants'}
    ]
  ]);
};

exports.taiwanToSimplified = function (text) {
  return convertChain(text, [
    [
      { name:'TWVariantsRevPhrases'},
      { name:'TWVariants' , reverse: true }
    ],
    [
      { name:'TSPhrases'},
      { name:'TSCharacters'}
    ]
  ]);
};

exports.taiwanToSimplifiedWithPhrases = function (text) {
  return convertChain(text, [
    [
      { name:'TWVariantsRevPhrases'},
      { name:'TWVariants', reverse: true }
    ],
    [
      { name:'TWPhrasesIT', reverse: true },
      { name:'TWPhrasesName', reverse: true },
      { name:'TWPhrasesOther', reverse: true }
    ],
    [
      { name:'TSPhrases'},
      { name:'TSCharacters'}
    ]
  ]);
};

function translate(text, dictionary) {
  const translated = [];

  for (let i = 0, { length } = text; i < length; i++) {
    let found;

    for (let j = text.length; j > 0; j--) {
      const target = text.substr(i, j);

      if (Object.hasOwnProperty.call(dictionary, target)) {
        i += j - 1;
        translated.push(dictionary[target]);
        found = 1;
        break;
      }
    }
    !found && translated.push(text[i]);
  }
  
  return translated.join('');
}
