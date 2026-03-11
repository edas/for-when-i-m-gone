import { Node, mergeAttributes, generateHTML, type Editor, type JSONContent } from '@tiptap/core';
import { hasNodeTypeInEditor } from '../extensions';
import { getBaseStarterKit } from '../createEditor';
import styles from '../extensions.module.css';

const CONDITIONS_TYPE = 'conditionsBlock';
const CONDITIONS_DATA_TYPE = 'conditions-block';

const starterKitConfig = getBaseStarterKit();

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

export function createConditionsBlock(injectedConditions: JSONContent | null) {
  const renderedInjectedHtml = renderInjectedConditionsAsHtml(injectedConditions);

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
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': CONDITIONS_DATA_TYPE,
          class: `conditions-block ${styles.tiptapCustomNode}`,
          contenteditable: 'false',
        })
      ];
    },

    // @todo: merge avec renderHTML
    addNodeView() {
      return ({ node, editor, getPos }) => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-type', CONDITIONS_DATA_TYPE);
        wrapper.className = `conditions-block ${styles.tiptapCustomNode} ${styles.tiptapBlockWithRemove}`;
        wrapper.contentEditable = 'false';

        const content = document.createElement('div');
        content.innerHTML = renderedInjectedHtml;
        wrapper.appendChild(content);

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
              { type: CONDITIONS_TYPE },
              { type: 'paragraph' },
            ]);
          },
      } as any;
    },
  });
}
