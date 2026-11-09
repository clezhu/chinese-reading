// Read-only curriculum/state extraction for design review; no runtime imports this.
import { loadContent } from '../../../authoring/scripts/load-content.mjs';
import { writeFileSync } from 'node:fs';
const { curriculum } = await loadContent('app/content/curriculum.ts');
const { revisionCards, enumerateStory } = await loadContent('app/lib/story.ts');
const lessons = curriculum.modules.flatMap(module => module.lessons);
const lesson = lessons[0];
const revealed = ['0:0:0', '1:0:6'];
const last = lessons.at(-1);
const samples = {
  lesson, occurrences: enumerateStory(lesson), revealed,
  revisionCards: revisionCards(lesson, revealed),
  lastLesson: { id: last.id, title: last.title, kind: last.kind, number: lessons.length },
};
writeFileSync(new URL('./runtime-state-samples.json', import.meta.url), JSON.stringify(samples, null, 2) + '\n');
