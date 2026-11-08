// THROWAWAY: three structural approaches on /prototype/reader?variant=A|B|C.
// No existing app/route to embed into. This is NOT the production stack or curriculum.
const fixtures = [
  { id: 's1', words: [['今天', 'jīn tiān'], ['我', 'wǒ'], ['和', 'hé'], ['妈妈', 'mā ma'], ['去', 'qù'], ['银行', 'yín háng'], ['。', '']] },
  { id: 's2', words: [['银行', 'yín háng'], ['门口', 'mén kǒu'], ['有', 'yǒu'], ['两行字', 'liǎng háng zì'], ['。', '']] },
  { id: 's3', words: [['我们', 'wǒ men'], ['慢慢', 'màn màn'], ['行走', 'xíng zǒu'], ['，', ''], ['妈妈', 'mā ma'], ['在', 'zài'], ['我', 'wǒ'], ['身后', 'shēn hòu'], ['。', '']] },
  { id: 's4', words: [['窗外', 'chuāng wài'], ['的', 'de'], ['风', 'fēng'], ['很', 'hěn'], ['凉爽', 'liáng shuǎng'], ['。', '']] },
];
const permanentCharacters = new Set(['今', '银', '窗', '爽']);
const sentences = fixtures.map(({ id, words }) => {
  let position = 0;
  return { id, text: words.map(([text]) => text).join(''), words: words.map(([text, readings]) =>
    [...text].map((character, i) => ({
      id: `${id}-o${++position}`, sentenceId: id, character,
      pinyin: readings.split(' ')[i] || '',
      permanent: permanentCharacters.has(character),
    }))) };
});
const occurrences = sentences.flatMap(s => s.words.flat());
const revealed = new Set();
const approaches = {
  A: ['Compact ruby', 'Native ruby in a compact continuous paragraph. Hidden annotations reserve space, but character controls are smaller.'],
  B: ['Occurrence lanes', 'Independent two-row cells in flowing paragraphs. A reserved pinyin row and at least 44px-wide controls prevent reveal-driven movement.'],
  C: ['Word-grouped bands', 'Numbered sentence bands wrap only between authored word groups. Compare word cohesion with ragged lines and added authoring work.'],
};
const params = new URL(location.href).searchParams;
let variant = Object.hasOwn(approaches, params.get('variant')) ? params.get('variant') : 'B';

function stateName(o) {
  return !o.pinyin ? 'punctuation' : o.permanent ? 'permanent' : revealed.has(o.id) ? 'revealed' : 'hidden';
}

function accessibleName(o) {
  const prefix = `${o.character}, sentence ${o.sentenceId.slice(1)}, occurrence ${o.id.split('-o')[1]}`;
  return revealed.has(o.id) ? `${prefix}: ${o.pinyin}, already revealed` : `Reveal pinyin for ${prefix}`;
}

function occurrenceNode(o, ruby = false) {
  const el = document.createElement(o.permanent ? 'span' : 'button');
  el.className = 'occurrence';
  el.dataset.id = o.id;
  el.dataset.state = stateName(o);
  if (o.permanent) {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', `${o.character}: ${o.pinyin}, permanent training-wheel pinyin`);
  } else {
    el.type = 'button';
    el.setAttribute('aria-label', accessibleName(o));
    el.setAttribute('aria-disabled', String(revealed.has(o.id)));
    el.addEventListener('click', () => {
      if (revealed.has(o.id)) return;
      revealed.add(o.id);
      // Keep the same DOM node and keyboard focus; only expose the reserved annotation.
      el.dataset.state = 'revealed';
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('aria-label', accessibleName(o));
      document.querySelector('#announcement').textContent = `${o.character}: ${o.pinyin}. Pinyin revealed for ${o.id}.`;
      inspect();
    });
  }
  if (ruby) {
    el.innerHTML = `<ruby aria-hidden="true"><span class="han">${o.character}</span><rt class="pinyin">${o.pinyin}</rt></ruby>`;
  } else {
    el.innerHTML = `<span class="pinyin" aria-hidden="true">${o.pinyin}</span><span class="han" aria-hidden="true">${o.character}</span>`;
  }
  return el;
}

function appendTokens(parent, tokens, ruby) {
  for (const o of tokens) {
    if (o.pinyin) {
      const unit = document.createElement('span');
      unit.className = 'unit';
      unit.append(occurrenceNode(o, ruby));
      parent.append(unit);
    } else {
      const punctuation = document.createElement('span');
      punctuation.className = 'punctuation';
      punctuation.textContent = o.character;
      // Closing punctuation travels with the preceding occurrence, never starts a line.
      (parent.lastElementChild || parent).append(punctuation);
    }
  }
}

function VariantA(story) {
  for (const s of sentences) {
    const p = document.createElement('p');
    appendTokens(p, s.words.flat(), true);
    story.append(p);
  }
}

function VariantB(story) {
  for (const s of sentences) {
    const p = document.createElement('p');
    appendTokens(p, s.words.flat(), false);
    story.append(p);
  }
}

function VariantC(story) {
  for (const s of sentences) {
    const band = document.createElement('section');
    band.className = 'band';
    band.innerHTML = `<small lang="en">Sentence ${s.id.slice(1)}</small>`;
    const p = document.createElement('p');
    for (const word of s.words) {
      if (!word[0].pinyin) {
        appendTokens(p.lastElementChild, word, false);
      } else {
        const group = document.createElement('span');
        group.className = 'word';
        appendTokens(group, word, false);
        p.append(group);
      }
    }
    band.append(p);
    story.append(band);
  }
}

function inspect() {
  document.querySelector('#state').textContent = JSON.stringify({
    variant, storage: 'memory only', revealedOccurrenceIds: [...revealed],
    sentences: sentences.map(s => ({ id: s.id, text: s.text })),
    occurrences: occurrences.map(o => ({ ...o, state: stateName(o) })),
  }, null, 2);
}

function render() {
  const story = document.querySelector('#story');
  story.replaceChildren();
  story.dataset.variant = variant;
  ({ A: VariantA, B: VariantB, C: VariantC })[variant](story);
  document.querySelector('#approach').textContent = `${variant} — ${approaches[variant][0]}`;
  document.querySelector('#description').textContent = approaches[variant][1];
  document.querySelector('#variant-label').textContent = `${variant} · ${approaches[variant][0]}`;
  inspect();
}

// Single shared switcher. The local-only server refuses NODE_ENV=production.
function cycle(delta) {
  variant = ['A', 'B', 'C'][(['A', 'B', 'C'].indexOf(variant) + delta + 3) % 3];
  const url = new URL(location.href);
  url.searchParams.set('variant', variant);
  history.replaceState(null, '', url);
  render();
}
document.querySelector('#previous').addEventListener('click', () => cycle(-1));
document.querySelector('#next').addEventListener('click', () => cycle(1));
document.addEventListener('keydown', event => {
  if (event.target.closest('input, textarea, select, [contenteditable]')) return;
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  cycle(event.key === 'ArrowLeft' ? -1 : 1);
});
document.querySelector('#reset').addEventListener('click', () => {
  revealed.clear();
  render();
  document.querySelector('#announcement').textContent = 'New attempt. All revealable pinyin is hidden.';
});
render();
