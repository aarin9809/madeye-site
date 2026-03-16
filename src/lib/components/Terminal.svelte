<script lang="ts">
  import { tick } from 'svelte';
  import { Copy, Trash2, ChevronDown } from 'lucide-svelte';

  let {
    lines = $bindable([] as string[]),
    running = false,
    class: className = '',
  }: {
    lines?: string[];
    running?: boolean;
    class?: string;
  } = $props();

  let container: HTMLDivElement;
  let autoScroll = $state(true);

  // Auto-scroll to bottom whenever new lines arrive
  $effect(() => {
    if (lines.length && autoScroll && container) {
      tick().then(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  });

  function handleScroll() {
    if (!container) return;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 32;
    autoScroll = atBottom;
  }

  function scrollToBottom() {
    if (container) container.scrollTop = container.scrollHeight;
    autoScroll = true;
  }

  function copyAll() {
    const text = lines.join('\n').replace(/\x1b\[[0-9;]*m/g, '');
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function clearLines() {
    lines = [];
    autoScroll = true;
  }

  // ── ANSI → HTML ────────────────────────────────────────────────────────
  function ansiToHtml(text: string): string {
    // Escape HTML entities first
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // SGR code → CSS class mapping (covers standard + bright palette)
    const ansiMap: Record<string, string> = {
      '1':  'ansi-bold',
      '2':  'ansi-dim',
      '3':  'ansi-italic',
      '30': 'ansi-black',
      '31': 'ansi-red',
      '32': 'ansi-green',
      '33': 'ansi-yellow',
      '34': 'ansi-blue',
      '35': 'ansi-magenta',
      '36': 'ansi-cyan',
      '37': 'ansi-white',
      '90': 'ansi-bright-black',
      '91': 'ansi-bright-red',
      '92': 'ansi-bright-green',
      '93': 'ansi-bright-yellow',
      '94': 'ansi-bright-blue',
      '95': 'ansi-bright-magenta',
      '96': 'ansi-bright-cyan',
      '97': 'ansi-bright-white',
    };

    let result = '';
    let depth = 0;
    let i = 0;

    while (i < escaped.length) {
      if (escaped[i] === '\x1b' && escaped[i + 1] === '[') {
        let j = i + 2;
        while (j < escaped.length && escaped[j] !== 'm') j++;
        const codes = escaped.slice(i + 2, j).split(';');
        i = j + 1;

        for (const code of codes) {
          if (code === '0' || code === '') {
            // Reset: close all open spans
            while (depth > 0) { result += '</span>'; depth--; }
          } else {
            const cls = ansiMap[code];
            if (cls) {
              result += `<span class="${cls}">`;
              depth++;
            }
            // Skip unrecognised codes (e.g. 38;5;N truecolor) silently
          }
        }
      } else {
        result += escaped[i];
        i++;
      }
    }
    // Close any unclosed spans
    while (depth > 0) { result += '</span>'; depth--; }
    return result;
  }

  let htmlLines = $derived(lines.map(ansiToHtml));
</script>

<div class="flex flex-col rounded-lg border border-bg-border bg-[#0a0a0f] overflow-hidden {className}">
  <!-- Toolbar -->
  <div class="flex items-center justify-between px-3 py-2 border-b border-bg-border bg-bg-surface">
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full bg-cyber-red/60"></div>
      <div class="w-3 h-3 rounded-full bg-cyber-yellow/60"></div>
      <div class="w-3 h-3 rounded-full bg-cyber-green/60"></div>
      <span class="ml-2 text-xs font-mono text-text-muted">terminal</span>
      {#if running}
        <span class="flex items-center gap-1 text-xs font-mono text-cyber-cyan">
          <span class="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse"></span>
          running
        </span>
      {/if}
    </div>
    <div class="flex items-center gap-1">
      {#if !autoScroll}
        <button
          onclick={scrollToBottom}
          class="text-text-muted hover:text-cyber-cyan transition-colors p-1 rounded"
          title="Scroll to bottom"
        >
          <ChevronDown size={14} />
        </button>
      {/if}
      <button
        onclick={copyAll}
        class="text-text-muted hover:text-cyber-cyan transition-colors p-1 rounded"
        title="Copy all"
      >
        <Copy size={14} />
      </button>
    </div>
  </div>

  <!-- Output area -->
  <div
    bind:this={container}
    onscroll={handleScroll}
    class="flex-1 overflow-y-auto p-4 ansi-output min-h-0"
    style="max-height: inherit;"
  >
    {#if htmlLines.length === 0}
      <div class="text-text-muted text-xs font-mono flex items-center gap-2 h-full justify-center py-8">
        <span class="opacity-40">$</span>
        <span class="opacity-40">스캔 실행 대기 중...</span>
        <span class="animate-blink opacity-60">_</span>
      </div>
    {:else}
      {#each htmlLines as line, i (i)}
        <div class="whitespace-pre-wrap break-all leading-relaxed"><!-- eslint-disable-next-line svelte/no-at-html-tags -->{@html line || '&nbsp;'}</div>
      {/each}
      {#if running}
        <div class="text-cyber-cyan/60 font-mono text-xs mt-1">
          <span class="animate-blink">▋</span>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Status bar -->
  {#if htmlLines.length > 0}
    <div class="px-3 py-1.5 border-t border-bg-border bg-bg-surface flex items-center justify-between">
      <span class="text-xs font-mono text-text-muted">{htmlLines.length} lines</span>
      <button
        class="text-xs font-mono text-text-muted hover:text-cyber-red transition-colors flex items-center gap-1"
        title="Clear"
        onclick={clearLines}
      >
        <Trash2 size={11} />
        clear
      </button>
    </div>
  {/if}
</div>
