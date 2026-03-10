import { Node, mergeAttributes } from '@tiptap/core';

const DATE_TIME_TYPE = 'docDatetime';

function padToTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export function toStorageDateTimeValue(date: Date): string {
  const year = date.getFullYear();
  const month = padToTwoDigits(date.getMonth() + 1);
  const day = padToTwoDigits(date.getDate());
  const hour = padToTwoDigits(date.getHours());
  const minute = padToTwoDigits(date.getMinutes());

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function parseStorageDateTimeValue(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0
  );
}

function createNowStorageDateTimeValue(): string {
  return toStorageDateTimeValue(new Date());
}

function formatDisplayDateTime(value: string): string {
  const parsedDate = parseStorageDateTimeValue(value);
  const date = parsedDate ?? new Date();
  const displayDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const hour = padToTwoDigits(date.getHours());
  const minute = padToTwoDigits(date.getMinutes());

  return `${displayDate} ${hour}h${minute}`;
}

function getDateTimeFromElement(element: Element): string | null {
  const attributeValue = element.getAttribute('datetime');

  return attributeValue?.trim() || null;
}

export const DateTimeInline = Node.create({
  name: DATE_TIME_TYPE,
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      datetime: {
        default: null,
        parseHTML: (element: Element) => getDateTimeFromElement(element),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `time[data-type="${DATE_TIME_TYPE}"]`,
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const storedDateTime = HTMLAttributes?.datetime?.trim();
    if (!storedDateTime) throw new Error('Stored datetime is required');
    
    return [
      'time',
      mergeAttributes(HTMLAttributes, {
        'data-type': DATE_TIME_TYPE,
        contenteditable: 'false',
        datetime: storedDateTime,
      }),
      formatDisplayDateTime(storedDateTime),
    ];
  },

  addCommands() {
    return {
      insertDateTimeInline:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              datetime: createNowStorageDateTimeValue(),
            },
          });
        },
    } as any;
  },
});
