import type { Story } from "./curriculum";

// Original #7 stories, author self-reviewed; see authoring/drafts/REVIEW-7.md.
// Pinyin is explicit per occurrence. No dictionary lookup or runtime inference.
export const fundamentalsStories = {
  "first-characters": {
    // Our mother
    paragraphs: [
      [
        [
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "回", pinyin: "huí" }, { hanzi: "到", pinyin: "dào" },
          { hanzi: "家", pinyin: "jiā" }, "，", { hanzi: "看", pinyin: "kàn" },
          { hanzi: "见", pinyin: "jiàn" }, { hanzi: "你", pinyin: "nǐ" }, { hanzi: "和", pinyin: "hé" },
          { hanzi: "妈", pinyin: "mā" }, { hanzi: "妈", pinyin: "ma" }, { hanzi: "在", pinyin: "zài" },
          { hanzi: "一", pinyin: "yì" }, { hanzi: "起", pinyin: "qǐ" }, "。",
        ],
      ],
      [
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "这", pinyin: "zhè" }, { hanzi: "是", pinyin: "shì" }, { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "的", pinyin: "de" }, { hanzi: "妈", pinyin: "mā" }, { hanzi: "妈", pinyin: "ma" },
          "，", { hanzi: "不", pinyin: "bú" }, { hanzi: "是", pinyin: "shì" },
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "的", pinyin: "de" }, "！”",
        ],
        [
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "也", pinyin: "yě" }, { hanzi: "是", pinyin: "shì" }, { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "的", pinyin: "de" }, { hanzi: "妈", pinyin: "mā" }, { hanzi: "妈", pinyin: "ma" },
          "。”",
        ],
      ],
      [
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "看", pinyin: "kàn" }, { hanzi: "看", pinyin: "kan" },
          { hanzi: "我", pinyin: "wǒ" }, "，", { hanzi: "不", pinyin: "bù" },
          { hanzi: "说", pinyin: "shuō" }, { hanzi: "话", pinyin: "huà" }, { hanzi: "了", pinyin: "le" },
          "。",
        ],
        [
          { hanzi: "妈", pinyin: "mā" }, { hanzi: "妈", pinyin: "ma" }, { hanzi: "说", pinyin: "shuō" },
          "：“", { hanzi: "你", pinyin: "nǐ" }, { hanzi: "们", pinyin: "men" },
          { hanzi: "都", pinyin: "dōu" }, { hanzi: "是", pinyin: "shì" }, { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "的", pinyin: "de" }, { hanzi: "儿", pinyin: "ér" }, { hanzi: "子", pinyin: "zi" },
          { hanzi: "啊", pinyin: "a" }, "！”",
        ],
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "好", pinyin: "hǎo" }, { hanzi: "吧", pinyin: "ba" }, "，",
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "们", pinyin: "men" }, { hanzi: "的", pinyin: "de" },
          { hanzi: "妈", pinyin: "mā" }, { hanzi: "妈", pinyin: "ma" }, "！”",
        ],
      ],
    ],
  },
  "people-and-places": {
    // A quiet storyteller
    paragraphs: [
      [
        [
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "们", pinyin: "men" }, { hanzi: "在", pinyin: "zài" },
          { hanzi: "说", pinyin: "shuō" }, { hanzi: "家", pinyin: "jiā" }, { hanzi: "里", pinyin: "lǐ" },
          { hanzi: "的", pinyin: "de" }, { hanzi: "事", pinyin: "shì" }, "，",
          { hanzi: "只", pinyin: "zhǐ" }, { hanzi: "有", pinyin: "yǒu" }, { hanzi: "他", pinyin: "tā" },
          { hanzi: "不", pinyin: "bù" }, { hanzi: "说", pinyin: "shuō" }, { hanzi: "话", pinyin: "huà" },
          "。",
        ],
      ],
      [
        [
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "不", pinyin: "bù" }, { hanzi: "想", pinyin: "xiǎng" },
          { hanzi: "和", pinyin: "hé" }, { hanzi: "我", pinyin: "wǒ" }, { hanzi: "们", pinyin: "men" },
          { hanzi: "一", pinyin: "yì" }, { hanzi: "起", pinyin: "qǐ" }, { hanzi: "吗", pinyin: "ma" },
          "？”",
        ],
        [
          { hanzi: "他", pinyin: "tā" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "想", pinyin: "xiǎng" }, { hanzi: "说", pinyin: "shuō" },
          "，", { hanzi: "可", pinyin: "kě" }, { hanzi: "是", pinyin: "shì" }, { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "说", pinyin: "shuō" }, { hanzi: "不", pinyin: "bu" }, { hanzi: "好", pinyin: "hǎo" },
          "。”",
        ],
      ],
      [
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "没", pinyin: "méi" }, { hanzi: "事", pinyin: "shì" }, "，",
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "们", pinyin: "men" }, { hanzi: "都", pinyin: "dōu" },
          { hanzi: "想", pinyin: "xiǎng" }, { hanzi: "听", pinyin: "tīng" }, { hanzi: "你", pinyin: "nǐ" },
          { hanzi: "的", pinyin: "de" }, "。”",
        ],
        [
          { hanzi: "他", pinyin: "tā" }, { hanzi: "看", pinyin: "kàn" }, { hanzi: "了", pinyin: "le" },
          { hanzi: "看", pinyin: "kàn" }, { hanzi: "我", pinyin: "wǒ" }, { hanzi: "们", pinyin: "men" },
          "。",
        ],
        [
          { hanzi: "这", pinyin: "zhè" }, { hanzi: "下", pinyin: "xià" }, "，",
          { hanzi: "他", pinyin: "tā" }, { hanzi: "也", pinyin: "yě" }, { hanzi: "说", pinyin: "shuō" },
          { hanzi: "起", pinyin: "qǐ" }, { hanzi: "了", pinyin: "le" }, { hanzi: "家", pinyin: "jiā" },
          { hanzi: "里", pinyin: "lǐ" }, { hanzi: "的", pinyin: "de" }, { hanzi: "事", pinyin: "shì" },
          "。",
        ],
      ],
    ],
  },
  "everyday-connections": {
    // One for each of us
    paragraphs: [
      [
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "走", pinyin: "zǒu" }, { hanzi: "过", pinyin: "guò" },
          { hanzi: "来", pinyin: "lái" }, "：“", { hanzi: "你", pinyin: "nǐ" },
          { hanzi: "在", pinyin: "zài" }, { hanzi: "做", pinyin: "zuò" }, { hanzi: "什", pinyin: "shén" },
          { hanzi: "么", pinyin: "me" }, "？”",
        ],
        [
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "点", pinyin: "diǎn" }, { hanzi: "心", pinyin: "xin" }, "。",
        ],
        [
          { hanzi: "这", pinyin: "zhè" }, { hanzi: "个", pinyin: "ge" }, { hanzi: "是", pinyin: "shì" },
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "的", pinyin: "de" }, "。”",
        ],
      ],
      [
        [
          { hanzi: "他", pinyin: "tā" }, { hanzi: "也", pinyin: "yě" }, { hanzi: "来", pinyin: "lái" },
          { hanzi: "了", pinyin: "le" }, "：“", { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "想", pinyin: "xiǎng" }, { hanzi: "要", pinyin: "yào" }, { hanzi: "一", pinyin: "yí" },
          { hanzi: "个", pinyin: "ge" }, "。”",
        ],
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "不", pinyin: "bù" }, "，", { hanzi: "这", pinyin: "zhè" },
          { hanzi: "个", pinyin: "ge" }, { hanzi: "是", pinyin: "shì" }, { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "的", pinyin: "de" }, "！”",
        ],
      ],
      [
        [
          { hanzi: "我", pinyin: "wǒ" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "们", pinyin: "men" }, { hanzi: "看", pinyin: "kàn" },
          "，", { hanzi: "这", pinyin: "zhè" }, { hanzi: "里", pinyin: "lǐ" },
          { hanzi: "还", pinyin: "hái" }, { hanzi: "有", pinyin: "yǒu" }, { hanzi: "一", pinyin: "yí" },
          { hanzi: "个", pinyin: "ge" }, "。”",
        ],
        [
          { hanzi: "你", pinyin: "nǐ" }, { hanzi: "把", pinyin: "bǎ" }, { hanzi: "那", pinyin: "nà" },
          { hanzi: "一", pinyin: "yí" }, { hanzi: "个", pinyin: "ge" }, { hanzi: "给", pinyin: "gěi" },
          { hanzi: "他", pinyin: "tā" }, "：“", { hanzi: "这", pinyin: "zhè" },
          { hanzi: "个", pinyin: "ge" }, { hanzi: "是", pinyin: "shì" }, { hanzi: "你", pinyin: "nǐ" },
          { hanzi: "的", pinyin: "de" }, "，", { hanzi: "我", pinyin: "wǒ" },
          { hanzi: "们", pinyin: "men" }, { hanzi: "都", pinyin: "dōu" }, { hanzi: "有", pinyin: "yǒu" },
          { hanzi: "了", pinyin: "le" }, "！”",
        ],
        [
          { hanzi: "他", pinyin: "tā" }, { hanzi: "说", pinyin: "shuō" }, "：“",
          { hanzi: "太", pinyin: "tài" }, { hanzi: "好", pinyin: "hǎo" }, { hanzi: "了", pinyin: "le" },
          "！”",
        ],
      ],
    ],
  },
} as const satisfies Record<string, Story>;
