import { curriculum, type LearningLesson } from "../../app/content/curriculum";

export type Draft = { readonly status: "draft"; readonly title: string; readonly lesson: LearningLesson };

// Real first drafts for #7 language review. Not imported by runtime curriculum.
// Revisions are proposed next revisions, applied only when these are promoted.
export const drafts = [
  {
    status: "draft",
    title: "一张旧照片",
    lesson: {
      ...curriculum.modules[0].lessons[0],
      contentRevision: 3,
      story: { paragraphs: [
        [
          [{"hanzi": "小", "pinyin": "xiǎo"}, {"hanzi": "林", "pinyin": "lín"}, {"hanzi": "找", "pinyin": "zhǎo"}, {"hanzi": "到", "pinyin": "dào"}, {"hanzi": "了", "pinyin": "le"}, {"hanzi": "一", "pinyin": "yì"}, {"hanzi": "张", "pinyin": "zhāng"}, {"hanzi": "旧", "pinyin": "jiù"}, {"hanzi": "照", "pinyin": "zhào"}, {"hanzi": "片", "pinyin": "piàn"}, "。"],
          [{"hanzi": "照", "pinyin": "zhào"}, {"hanzi": "片", "pinyin": "piàn"}, {"hanzi": "上", "pinyin": "shàng"}, {"hanzi": "的", "pinyin": "de"}, {"hanzi": "人", "pinyin": "rén"}, "，", {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "小", "pinyin": "xiǎo"}, {"hanzi": "时", "pinyin": "shí"}, {"hanzi": "候", "pinyin": "hou"}, {"hanzi": "的", "pinyin": "de"}, {"hanzi": "自", "pinyin": "zì"}, {"hanzi": "己", "pinyin": "jǐ"}, "。"],
          [{"hanzi": "那", "pinyin": "nà"}, {"hanzi": "时", "pinyin": "shí"}, {"hanzi": "的", "pinyin": "de"}, {"hanzi": "他", "pinyin": "tā"}, "，", {"hanzi": "还", "pinyin": "hái"}, {"hanzi": "不", "pinyin": "bú"}, {"hanzi": "认", "pinyin": "rèn"}, {"hanzi": "识", "pinyin": "shi"}, {"hanzi": "一", "pinyin": "yí"}, {"hanzi": "个", "pinyin": "ge"}, {"hanzi": "字", "pinyin": "zì"}, "。"],
        ],
        [
          [{"hanzi": "小", "pinyin": "xiǎo"}, {"hanzi": "林", "pinyin": "lín"}, {"hanzi": "看", "pinyin": "kàn"}, {"hanzi": "了", "pinyin": "le"}, {"hanzi": "又", "pinyin": "yòu"}, {"hanzi": "看", "pinyin": "kàn"}, "，", {"hanzi": "笑", "pinyin": "xiào"}, {"hanzi": "了", "pinyin": "le"}, "。"],
          [{"hanzi": "妈", "pinyin": "mā"}, {"hanzi": "妈", "pinyin": "ma"}, {"hanzi": "问", "pinyin": "wèn"}, "：“", {"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "笑", "pinyin": "xiào"}, {"hanzi": "什", "pinyin": "shén"}, {"hanzi": "么", "pinyin": "me"}, "？”"],
          [{"hanzi": "小", "pinyin": "xiǎo"}, {"hanzi": "林", "pinyin": "lín"}, {"hanzi": "说", "pinyin": "shuō"}, "：“", {"hanzi": "原", "pinyin": "yuán"}, {"hanzi": "来", "pinyin": "lái"}, {"hanzi": "这", "pinyin": "zhè"}, {"hanzi": "不", "pinyin": "bú"}, {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "弟", "pinyin": "dì"}, {"hanzi": "弟", "pinyin": "di"}, "，", {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "我", "pinyin": "wǒ"}, "！”"],
        ],
      ]},
    },
  },
  {
    status: "draft",
    title: "门口的客人",
    lesson: {
      ...curriculum.modules[0].lessons[1],
      contentRevision: 3,
      story: { paragraphs: [
        [
          [{"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "和", "pinyin": "hé"}, {"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "在", "pinyin": "zài"}, {"hanzi": "家", "pinyin": "jiā"}, {"hanzi": "里", "pinyin": "lǐ"}, {"hanzi": "等", "pinyin": "děng"}, {"hanzi": "他", "pinyin": "tā"}, "。"],
          [{"hanzi": "门", "pinyin": "mén"}, {"hanzi": "外", "pinyin": "wài"}, {"hanzi": "来", "pinyin": "lái"}, {"hanzi": "了", "pinyin": "le"}, {"hanzi": "一", "pinyin": "yí"}, {"hanzi": "个", "pinyin": "ge"}, {"hanzi": "人", "pinyin": "rén"}, "。"],
          [{"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "问", "pinyin": "wèn"}, "：“", {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "他", "pinyin": "tā"}, {"hanzi": "吗", "pinyin": "ma"}, "？”"],
          [{"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "说", "pinyin": "shuō"}, "：“", {"hanzi": "不", "pinyin": "bú"}, {"hanzi": "是", "pinyin": "shì"}, "，", {"hanzi": "他", "pinyin": "tā"}, {"hanzi": "还", "pinyin": "hái"}, {"hanzi": "在", "pinyin": "zài"}, {"hanzi": "路", "pinyin": "lù"}, {"hanzi": "上", "pinyin": "shàng"}, "。”"],
        ],
        [
          [{"hanzi": "那", "pinyin": "nà"}, {"hanzi": "个", "pinyin": "ge"}, {"hanzi": "人", "pinyin": "rén"}, {"hanzi": "笑", "pinyin": "xiào"}, {"hanzi": "了", "pinyin": "le"}, "：“", {"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "来", "pinyin": "lái"}, {"hanzi": "送", "pinyin": "sòng"}, {"hanzi": "书", "pinyin": "shū"}, {"hanzi": "的", "pinyin": "de"}, "。”"],
          [{"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "接", "pinyin": "jiē"}, {"hanzi": "过", "pinyin": "guò"}, {"hanzi": "书", "pinyin": "shū"}, "，", {"hanzi": "对", "pinyin": "duì"}, {"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "说", "pinyin": "shuō"}, "：“", {"hanzi": "这", "pinyin": "zhè"}, {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "他", "pinyin": "tā"}, {"hanzi": "的", "pinyin": "de"}, {"hanzi": "书", "pinyin": "shū"}, "。”"],
          [{"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "把", "pinyin": "bǎ"}, {"hanzi": "书", "pinyin": "shū"}, {"hanzi": "放", "pinyin": "fàng"}, {"hanzi": "好", "pinyin": "hǎo"}, "，", {"hanzi": "继", "pinyin": "jì"}, {"hanzi": "续", "pinyin": "xù"}, {"hanzi": "和", "pinyin": "hé"}, {"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "等", "pinyin": "děng"}, {"hanzi": "他", "pinyin": "tā"}, "。"],
        ],
      ]},
    },
  },
  {
    status: "draft",
    title: "桌上的盒子",
    lesson: {
      ...curriculum.modules[1].lessons[0],
      contentRevision: 3,
      story: { paragraphs: [
        [
          [{"hanzi": "上", "pinyin": "shàng"}, {"hanzi": "课", "pinyin": "kè"}, {"hanzi": "前", "pinyin": "qián"}, "，", {"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "在", "pinyin": "zài"}, {"hanzi": "桌", "pinyin": "zhuō"}, {"hanzi": "上", "pinyin": "shàng"}, {"hanzi": "发", "pinyin": "fā"}, {"hanzi": "现", "pinyin": "xiàn"}, {"hanzi": "了", "pinyin": "le"}, {"hanzi": "一", "pinyin": "yì"}, {"hanzi": "张", "pinyin": "zhāng"}, {"hanzi": "纸", "pinyin": "zhǐ"}, {"hanzi": "条", "pinyin": "tiáo"}, "。"],
          [{"hanzi": "纸", "pinyin": "zhǐ"}, {"hanzi": "条", "pinyin": "tiáo"}, {"hanzi": "上", "pinyin": "shàng"}, {"hanzi": "有", "pinyin": "yǒu"}, {"hanzi": "一", "pinyin": "yí"}, {"hanzi": "句", "pinyin": "jù"}, {"hanzi": "话", "pinyin": "huà"}, "：“", {"hanzi": "这", "pinyin": "zhè"}, {"hanzi": "个", "pinyin": "ge"}, {"hanzi": "盒", "pinyin": "hé"}, {"hanzi": "子", "pinyin": "zi"}, {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "给", "pinyin": "gěi"}, {"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "的", "pinyin": "de"}, "。”"],
          [{"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "打", "pinyin": "dǎ"}, {"hanzi": "开", "pinyin": "kāi"}, {"hanzi": "盒", "pinyin": "hé"}, {"hanzi": "子", "pinyin": "zi"}, "，", {"hanzi": "盒", "pinyin": "hé"}, {"hanzi": "子", "pinyin": "zi"}, {"hanzi": "中", "pinyin": "zhōng"}, {"hanzi": "有", "pinyin": "yǒu"}, {"hanzi": "一", "pinyin": "yì"}, {"hanzi": "支", "pinyin": "zhī"}, {"hanzi": "笔", "pinyin": "bǐ"}, "。"],
        ],
        [
          [{"hanzi": "你", "pinyin": "nǐ"}, {"hanzi": "走", "pinyin": "zǒu"}, {"hanzi": "过", "pinyin": "guò"}, {"hanzi": "来", "pinyin": "lái"}, "，", {"hanzi": "问", "pinyin": "wèn"}, {"hanzi": "我", "pinyin": "wǒ"}, "：“", {"hanzi": "这", "pinyin": "zhè"}, {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "谁", "pinyin": "shéi"}, {"hanzi": "的", "pinyin": "de"}, "？”"],
          [{"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "说", "pinyin": "shuō"}, "：“", {"hanzi": "不", "pinyin": "bù"}, {"hanzi": "知", "pinyin": "zhī"}, {"hanzi": "道", "pinyin": "dào"}, "，", {"hanzi": "上", "pinyin": "shàng"}, {"hanzi": "面", "pinyin": "miàn"}, {"hanzi": "没", "pinyin": "méi"}, {"hanzi": "有", "pinyin": "yǒu"}, {"hanzi": "名", "pinyin": "míng"}, {"hanzi": "字", "pinyin": "zi"}, "。”"],
          [{"hanzi": "这", "pinyin": "zhè"}, {"hanzi": "时", "pinyin": "shí"}, "，", {"hanzi": "他", "pinyin": "tā"}, {"hanzi": "在", "pinyin": "zài"}, {"hanzi": "门", "pinyin": "mén"}, {"hanzi": "口", "pinyin": "kǒu"}, {"hanzi": "笑", "pinyin": "xiào"}, {"hanzi": "了", "pinyin": "le"}, "：“", {"hanzi": "这", "pinyin": "zhè"}, {"hanzi": "是", "pinyin": "shì"}, {"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "的", "pinyin": "de"}, "，", {"hanzi": "我", "pinyin": "wǒ"}, {"hanzi": "放", "pinyin": "fàng"}, {"hanzi": "错", "pinyin": "cuò"}, {"hanzi": "地", "pinyin": "dì"}, {"hanzi": "方", "pinyin": "fang"}, {"hanzi": "了", "pinyin": "le"}, "！”"],
        ],
      ]},
    },
  },
] as const satisfies readonly Draft[];
