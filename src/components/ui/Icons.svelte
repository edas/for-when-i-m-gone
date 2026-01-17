<script lang="ts" module>
  export type IconName = 
    | 'warning'
    | 'check'
    | 'check-circle'
    | 'x-circle'
    | 'chevron-left'
    | 'chevron-right'
    | 'arrow-left'
    | 'info'
    | 'layers'
    | 'plus'
    | 'minus'
    | 'alert-triangle'
    | 'heading'
    | 'paragraph'
    | 'bold'
    | 'italic'
    | 'underline'
    | 'list-bullet'
    | 'list-numbered'
    | 'heart'
    | 'star'
    | 'grip-vertical'
    | 'users'
    | 'lock'
    | 'calendar'
    | 'quorum'
    | 'eye'
    | 'eye-off';
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
  {:else if name === 'check-circle'}
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 12l2 2 4-4"/>
  {:else if name === 'x-circle'}
    <circle cx="12" cy="12" r="10"/>
    <path d="M15 9l-6 6M9 9l6 6"/>
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
  {:else if name === 'minus'}
    <path d="M5 12h14"/>
  {:else if name === 'alert-triangle'}
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
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
  {:else if name === 'heart'}
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/>
  {:else if name === 'star'}
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none"/>
  {:else if name === 'grip-vertical'}
    <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  {:else if name === 'users'}
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  {:else if name === 'lock'}
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  {:else if name === 'calendar'}
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  {:else if name === 'quorum'}
    <circle cx="9" cy="7" r="3"/>
    <circle cx="17" cy="7" r="3"/>
    <path d="M5 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    <text x="17" y="19" font-size="8" fill="currentColor" stroke="none" font-weight="bold">?</text>
  {:else if name === 'eye'}
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  {:else if name === 'eye-off'}
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  {/if}
</svg>
