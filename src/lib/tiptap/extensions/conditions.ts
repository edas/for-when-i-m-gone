import { Node, mergeAttributes, type Editor, type JSONContent } from '@tiptap/core';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const CONDITIONS_TYPE = 'conditionsBlock';
const CONDITIONS_DATA_TYPE = 'conditions-block';

const starterKitConfig = StarterKit.configure({
  blockquote: false,
  code: false,
  codeBlock: false,
  hardBreak: false,
  horizontalRule: false,
  strike: false,
  heading: false,
});

function hasNodeTypeInEditor(editor: Editor, nodeType: string): boolean {
  let found = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === nodeType) {
      found = true;
      return false;
    }

    return true;
  });

  return found;
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

    renderHTML({ HTMLAttributes }) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': CONDITIONS_DATA_TYPE,
          class: 'conditions-block',
          contenteditable: 'false',
        })
      ];
    },

    addNodeView() {
      return () => {
        const dom = document.createElement('div');
        dom.setAttribute('data-type', CONDITIONS_DATA_TYPE);
        dom.className = 'conditions-block';
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
      };
    },
  });
}
