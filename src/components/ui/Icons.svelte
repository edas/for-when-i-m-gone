<script lang="ts" module>
  export type IconName = 
    | 'warning'
    | 'check'
    | 'chevron-left'
    | 'chevron-right'
    | 'arrow-left'
    | 'info'
    | 'layers'
    | 'plus'
    | 'heading'
    | 'paragraph'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'list-bullet'
    | 'list-numbered';
</script>

<script lang="ts">
  interface Props {
    name: IconName;
    size?: number;
    strokeWidth?: number;
  }

  let { name, size = 20, strokeWidth = 2 }: Props = $props();
</script>

<svg 
  viewBox="0 0 24 24" 
  width={size}
  height={size}
  fill="none" 
  stroke="currentColor" 
  stroke-width={strokeWidth}
>
  {#if name === 'warning'}
    <path fill="currentColor" stroke="none" d="M12 2L1 21h22L12 2zm0 3.83L19.13 19H4.87L12 5.83zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
  {:else if name === 'check'}
    <path d="M20 6L9 17l-5-5"/>
  {:else if name === 'chevron-left'}
    <path d="M15 18l-6-6 6-6"/>
  {:else if name === 'chevron-right'}
    <path d="M9 18l6-6-6-6"/>
  {:else if name === 'arrow-left'}
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  {:else if name === 'info'}
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4M12 16h.01"/>
  {:else if name === 'layers'}
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14"/>
  {:else if name === 'heading'}
    <path d="M4 12h8M4 6v12M12 6v12M14 8h4l-4 8h4"/>
  {:else if name === 'paragraph'}
    <path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 1 0 0 9H13"/>
  {:else if name === 'bold'}
    <path stroke-width="2.5" d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zM6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  {:else if name === 'italic'}
    <line x1="19" y1="4" x2="10" y2="4"/>
    <line x1="14" y1="20" x2="5" y2="20"/>
    <line x1="15" y1="4" x2="9" y2="20"/>
  {:else if name === 'underline'}
    <path d="M6 4v6a6 6 0 0 0 12 0V4"/>
    <line x1="4" y1="20" x2="20" y2="20"/>
  {:else if name === 'list-bullet'}
    <line x1="9" y1="6" x2="20" y2="6"/>
    <line x1="9" y1="12" x2="20" y2="12"/>
    <line x1="9" y1="18" x2="20" y2="18"/>
    <circle cx="5" cy="6" r="1" fill="currentColor"/>
    <circle cx="5" cy="12" r="1" fill="currentColor"/>
    <circle cx="5" cy="18" r="1" fill="currentColor"/>
  {:else if name === 'list-numbered'}
    <line x1="10" y1="6" x2="20" y2="6"/>
    <line x1="10" y1="12" x2="20" y2="12"/>
    <line x1="10" y1="18" x2="20" y2="18"/>
    <text x="4" y="7" font-size="6" fill="currentColor" stroke="none">1</text>
    <text x="4" y="13" font-size="6" fill="currentColor" stroke="none">2</text>
    <text x="4" y="19" font-size="6" fill="currentColor" stroke="none">3</text>
  {/if}
</svg>
