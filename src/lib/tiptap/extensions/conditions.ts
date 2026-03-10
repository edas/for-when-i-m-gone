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
      return () => {
        const dom = document.createElement('div');
        dom.setAttribute('data-type', CONDITIONS_DATA_TYPE);
        dom.className = `conditions-block ${styles.tiptapCustomNode}`;
        dom.contentEditable = 'false';

        dom.innerHTML = renderedInjectedHtml;

        return {
          dom,
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
