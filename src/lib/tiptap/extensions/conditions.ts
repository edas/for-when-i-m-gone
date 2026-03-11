import { Node, generateHTML, type Editor, type JSONContent } from '@tiptap/core';
import { hasNodeTypeInEditor } from '../extensions';
import { getBaseStarterKit } from '../createEditor';
import styles from '../extensions.module.css';

const CONDITIONS_TYPE = 'conditionsBlock';
const CONDITIONS_DATA_TYPE = 'conditions-block';

const starterKitConfig = getBaseStarterKit({levels: [3]});

export function hasConditionsBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return hasNodeTypeInEditor(editor, CONDITIONS_TYPE);
}

function renderInjectedConditionsAsHtml(injectedConditions: JSONContent | null): string {
  if (!injectedConditions) {
    return '';
  }

  try {
    return generateHTML(injectedConditions, [starterKitConfig]);
  } catch (error) {
    console.error('Failed to render injected conditions', error);
    return '';
  }
}

function createNode(html: string) {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-type', CONDITIONS_DATA_TYPE);
  wrapper.setAttribute('data-conditions', html);
  wrapper.className = `conditions-block ${styles.tiptapCustomNode} ${styles.tiptapBlockWithRemove}`;
  wrapper.contentEditable = 'false';

  const content = document.createElement('div');
  content.innerHTML = html;
  wrapper.appendChild(content);
  return wrapper;
}

export function createConditionsBlock(injectedConditions: JSONContent | undefined) {
  const renderedInjectedHtml = injectedConditions && renderInjectedConditionsAsHtml(injectedConditions);

  return Node.create({
    name: CONDITIONS_TYPE,
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    parseHTML() {
      return [{ tag: `div[data-type="${CONDITIONS_DATA_TYPE}"]` }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
      return createNode(renderedInjectedHtml ?? HTMLAttributes?.['data-conditions']?.toString() ?? '');
    },

    // @todo: merge avec renderHTML
    addNodeView() {
      return ({ node, editor, getPos }) => {
        const wrapper = createNode(renderedInjectedHtml ?? node?.attrs?.['data-conditions']?.toString() ?? '');

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = styles.tiptapBlockRemove;
        removeBtn.setAttribute('aria-label', 'Retirer le bloc');
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
          if (typeof getPos === 'function') {
            const pos = getPos();
            if (typeof pos === 'number') {
              const { from, to } = { from: pos, to: pos + node.nodeSize };
              editor.view.dispatch(editor.state.tr.delete(from, to));
            }
          }
        });
        wrapper.appendChild(removeBtn);

        return {
          dom: wrapper,
          ignoreMutation: () => true,
        };
      };
    },

    addCommands() {
      return {
        insertConditionsBlock:
          () =>
          ({ commands, editor }: { commands: any; editor: Editor }) => {
            if (hasNodeTypeInEditor(editor, CONDITIONS_TYPE)) {
              return false;
            }

            return commands.insertContent([
              { type: CONDITIONS_TYPE, attrs: { 'data-conditions': renderedInjectedHtml  ?? '' } },
              { type: 'paragraph' },
            ]);
          },
      } as any;
    },
  });
}
