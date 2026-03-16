<script lang="ts">
  import { page } from '$app/stores';
  import { SCANNER_MAP } from '$lib/scanners';
  import type { ScanStatus, SseEvent } from '$lib/types';
  import Button from '$lib/components/ui/button.svelte';
  import Input from '$lib/components/ui/input.svelte';
  import Textarea from '$lib/components/ui/textarea.svelte';
  import Select from '$lib/components/ui/select.svelte';
  import Label from '$lib/components/ui/label.svelte';
  import Switch from '$lib/components/ui/switch.svelte';
  import Badge from '$lib/components/ui/badge.svelte';
  import Terminal from '$lib/components/Terminal.svelte';
  import ResultTable from '$lib/components/ResultTable.svelte';
  import {
    Play, Square, Download, RefreshCw, ChevronRight,
    Search, Fingerprint, Radar, FolderOpen, Globe,
    Database, ShieldAlert, Zap, ScanLine, Info,
  } from 'lucide-svelte';

  const iconMap: Record<string, unknown> = {
    Search, Fingerprint, Radar, FolderOpen, Globe,
    Database, ShieldAlert, Zap, ScanLine,
  };

  // ── Route param ──────────────────────────────────────────────────────────
  let toolId  = $derived($page.params.tool);
  let scanner = $derived(SCANNER_MAP[toolId]);

  // ── Form state ───────────────────────────────────────────────────────────
  let target      = $state('');
  let fieldValues = $state<Record<string, string | number | boolean>>({});

  // Reset form when tool changes
  $effect(() => {
    if (scanner) {
      target = '';
      const defaults: Record<string, string | number | boolean> = {};
      for (const f of scanner.fields) {
        if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
        else if (f.type === 'switch')     defaults[f.key] = false;
        else                              defaults[f.key] = '';
      }
      fieldValues   = defaults;
      terminalLines = [];
      findings      = [];
      scanStatus    = 'idle';
      exitCode      = null;
    }
  });

  // ── Scan state ───────────────────────────────────────────────────────────
  let scanStatus    = $state<ScanStatus>('idle');
  let terminalLines = $state<string[]>([]);
  let findings      = $state<unknown[]>([]);
  let exitCode      = $state<number | null>(null);
  let activeTab     = $state<'terminal' | 'results'>('terminal');
  let abortController: AbortController | null = null;

  // ── Can start scan? ──────────────────────────────────────────────────────
  function canStart(): boolean {
    if (!scanner) return false;
    if (toolId === 'sqli') {
      // sqli: either a URL target OR a pasted raw HTTP request is required
      const rawHttp = String(fieldValues['rawHttp'] ?? '').trim();
      return !!(target.trim() || rawHttp);
    }
    return !!target.trim();
  }

  // ── Start scan ───────────────────────────────────────────────────────────
  async function startScan() {
    if (scanStatus === 'running' || !canStart()) return;
    scanStatus    = 'running';
    terminalLines = [];
    findings      = [];
    exitCode      = null;
    activeTab     = 'terminal';

    abortController = new AbortController();

    try {
      const resp = await fetch('/api/scan', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool:   toolId,
          target: target.trim() || undefined,
          params: fieldValues,
        }),
        signal: abortController.signal,
      });

      if (!resp.ok) {
        terminalLines = [...terminalLines, `\x1b[31m[!] HTTP ${resp.status}: ${await resp.text()}\x1b[0m`];
        scanStatus = 'error';
        return;
      }

      const reader  = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            try {
              const evt = JSON.parse(line.slice(6)) as SseEvent;
              if (evt.type === 'log') {
                const newLines = evt.text.split('\n').filter((l) => l.length > 0 || terminalLines.length === 0);
                terminalLines = [...terminalLines, ...newLines];
              } else if (evt.type === 'done') {
                exitCode   = evt.code;
                scanStatus = evt.code === 0 ? 'done' : 'error';
              } else if (evt.type === 'error') {
                terminalLines = [...terminalLines, `\x1b[31m[!] ${evt.message}\x1b[0m`];
                scanStatus    = 'error';
              } else if (evt.type === 'results') {
                findings = (evt as unknown as { type: 'results'; data: unknown[] }).data;
                if (findings.length > 0) activeTab = 'results';
              }
            } catch {}
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        terminalLines = [...terminalLines, `\x1b[31m[!] Connection error: ${(err as Error).message}\x1b[0m`];
        scanStatus = 'error';
      }
    } finally {
      if (scanStatus === 'running') scanStatus = 'done';
    }
  }

  function stopScan() {
    abortController?.abort();
    scanStatus = 'idle';
  }

  function downloadResults() {
    if (!findings.length) return;
    const blob = new Blob([JSON.stringify(findings, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `madeye_${toolId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetScan() {
    terminalLines = [];
    findings      = [];
    scanStatus    = 'idle';
    exitCode      = null;
  }

  // ── Status helpers ───────────────────────────────────────────────────────
  const statusConfig = {
    idle:    { label: 'Idle',    color: 'text-text-muted',  dot: 'bg-text-muted'                 },
    running: { label: 'Running', color: 'text-cyber-cyan',  dot: 'bg-cyber-cyan animate-pulse'   },
    done:    { label: 'Done',    color: 'text-cyber-green', dot: 'bg-cyber-green'                },
    error:   { label: 'Error',   color: 'text-cyber-red',   dot: 'bg-cyber-red'                  },
  };
</script>

<svelte:head>
  <title>MadEyE — {scanner?.label ?? toolId}</title>
</svelte:head>

{#if !scanner}
  <div class="flex items-center justify-center h-full p-8">
    <div class="text-center">
      <div class="text-cyber-red text-4xl font-mono mb-2">404</div>
      <div class="text-text-muted">Scanner not found: <code class="text-cyber-cyan">{toolId}</code></div>
    </div>
  </div>
{:else}
  {@const Icon   = iconMap[scanner.icon]}
  {@const status = statusConfig[scanStatus]}

  <div class="flex flex-col h-full overflow-hidden">

    <!-- ── Page header ── -->
    <div class="border-b border-bg-border bg-bg-surface px-6 py-4 shrink-0">
      <div class="flex items-center gap-2 text-xs font-mono text-text-muted mb-2">
        <a href="/" class="hover:text-cyber-cyan transition-colors">Dashboard</a>
        <ChevronRight size={12} />
        <span class="{scanner.color}">{scanner.label}</span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg border border-bg-border bg-bg-elevated flex items-center justify-center {scanner.color}">
            <svelte:component this={Icon} size={20} />
          </div>
          <div>
            <h1 class="text-lg font-bold font-mono text-text-primary">{scanner.label}</h1>
            <p class="text-xs text-text-muted max-w-md">{scanner.description}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div class="flex items-center gap-1.5 text-xs font-mono {status.color}">
            <span class="w-2 h-2 rounded-full {status.dot}"></span>
            {status.label}
            {#if exitCode !== null}
              <span class="text-text-muted ml-1">(exit {exitCode})</span>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Body ── -->
    <div class="flex-1 overflow-y-auto p-6 space-y-5">

      <!-- Form card -->
      <div class="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
        <div class="px-5 py-3 border-b border-bg-border bg-bg-elevated flex items-center gap-2">
          <span class="text-xs font-mono text-text-muted uppercase tracking-wider">Configuration</span>
        </div>
        <div class="p-5 space-y-4">
          <!-- Target URL -->
          <div>
            <Label for="target">{scanner.targetLabel}</Label>
            {#if scanner.id === 'sqli' || scanner.id === 'lfi' || scanner.id === 'rfi'}
              <div class="flex items-center gap-1 mt-0.5 mb-1">
                <Info size={11} class="text-text-muted" />
                <span class="text-xs text-text-muted">
                  {scanner.id === 'sqli' ? 'Raw HTTP 입력 시 생략 가능' : 'URL에 파라미터를 포함하세요'}
                </span>
              </div>
            {/if}
            <Input
              id="target"
              type="url"
              bind:value={target}
              placeholder={scanner.targetPlaceholder}
              class="mt-1"
            />
          </div>

          <!-- Dynamic fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#each scanner.fields as field}
              <div class="{field.width === 'full' ? 'col-span-full' : ''}">
                <Label for={field.key}>{field.label}</Label>
                {#if field.hint}
                  <p class="text-xs text-text-muted mt-0.5 mb-1">{field.hint}</p>
                {/if}

                {#if field.type === 'select'}
                  <Select
                    id={field.key}
                    bind:value={() => String(fieldValues[field.key] ?? field.defaultValue ?? ''), (v) => { fieldValues = { ...fieldValues, [field.key]: v }; }}
                    options={field.options ?? []}
                    class="mt-1"
                  />
                {:else if field.type === 'textarea'}
                  <Textarea
                    id={field.key}
                    bind:value={() => String(fieldValues[field.key] ?? ''), (v) => { fieldValues = { ...fieldValues, [field.key]: v }; }}
                    placeholder={field.placeholder}
                    rows={6}
                    class="mt-1 font-mono text-xs"
                  />
                {:else if field.type === 'switch'}
                  <div class="mt-2 flex items-center gap-2">
                    <Switch
                      id={field.key}
                      bind:checked={() => Boolean(fieldValues[field.key]), (v) => { fieldValues = { ...fieldValues, [field.key]: v }; }}
                    />
                    <span class="text-xs font-mono text-text-muted">{fieldValues[field.key] ? 'Enabled' : 'Disabled'}</span>
                  </div>
                {:else}
                  <Input
                    id={field.key}
                    type={field.type === 'number' ? 'number' : 'text'}
                    bind:value={() => String(fieldValues[field.key] ?? ''), (v) => { fieldValues = { ...fieldValues, [field.key]: v }; }}
                    placeholder={field.placeholder}
                    class="mt-1"
                  />
                {/if}
              </div>
            {/each}
          </div>

          <!-- Action buttons -->
          <div class="flex items-center gap-3 pt-2 border-t border-bg-border">
            {#if scanStatus !== 'running'}
              <Button variant="cyber" onclick={startScan} disabled={!canStart()}>
                <Play size={14} />
                Run {scanner.label}
              </Button>
            {:else}
              <Button variant="danger" onclick={stopScan}>
                <Square size={14} />
                Stop
              </Button>
              <span class="text-xs font-mono text-cyber-cyan flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
                Scanning…
              </span>
            {/if}

            {#if findings.length > 0}
              <Button variant="ghost" onclick={downloadResults} class="ml-auto">
                <Download size={14} />
                Export JSON
              </Button>
            {/if}

            {#if scanStatus !== 'idle' && scanStatus !== 'running'}
              <Button variant="ghost" onclick={resetScan} class="{findings.length > 0 ? '' : 'ml-auto'}">
                <RefreshCw size={14} />
                Reset
              </Button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Results area -->
      <div class="rounded-xl border border-bg-border bg-bg-surface overflow-hidden">
        <!-- Tab header -->
        <div class="flex items-center border-b border-bg-border bg-bg-elevated">
          <button
            class="px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors
              {activeTab === 'terminal'
                ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-bg-surface'
                : 'text-text-muted hover:text-text-primary'}"
            onclick={() => (activeTab = 'terminal')}
          >
            Terminal
            {#if terminalLines.length > 0}
              <Badge variant="info" class="ml-2">{terminalLines.length}</Badge>
            {/if}
          </button>
          <button
            class="px-5 py-3 text-xs font-mono uppercase tracking-wider transition-colors
              {activeTab === 'results'
                ? 'text-cyber-cyan border-b-2 border-cyber-cyan bg-bg-surface'
                : 'text-text-muted hover:text-text-primary'}"
            onclick={() => (activeTab = 'results')}
          >
            Results
            {#if findings.length > 0}
              <Badge variant="success" class="ml-2">{findings.length}</Badge>
            {/if}
          </button>
        </div>

        <!-- Tab content -->
        <div class="min-h-80">
          {#if activeTab === 'terminal'}
            <Terminal
              bind:lines={terminalLines}
              running={scanStatus === 'running'}
              class="rounded-none border-0 h-[500px]"
            />
          {:else}
            <ResultTable tool={toolId} findings={findings} />
          {/if}
        </div>
      </div>

    </div>
  </div>
{/if}
