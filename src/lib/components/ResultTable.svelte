<script lang="ts">
  import Badge from '$lib/components/ui/badge.svelte';
  import type { FingerFinding, ProbeFinding, InjectFinding, CveFinding, ReconAsset } from '$lib/types';
  import { ExternalLink } from 'lucide-svelte';

  type Finding = FingerFinding | ProbeFinding | InjectFinding | CveFinding | ReconAsset;

  let {
    tool,
    findings = [],
  }: {
    tool: string;
    findings: Finding[];
  } = $props();

  function sevVariant(sev: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const m: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      critical: 'critical', high: 'high', medium: 'medium', low: 'low',
    };
    return m[sev?.toLowerCase()] ?? 'info';
  }
</script>

{#if findings.length === 0}
  <div class="py-10 text-center text-text-muted font-mono text-sm">
    결과 없음 — 스캔을 실행하세요.
  </div>
{:else}
  <div class="overflow-x-auto">

    <!-- ── Finger ── -->
    {#if tool === 'finger'}
      <table class="w-full text-sm font-mono border-collapse">
        <thead>
          <tr class="border-b border-bg-border text-xs text-text-muted uppercase tracking-wider">
            <th class="px-3 py-2 text-left">Category</th>
            <th class="px-3 py-2 text-left">Technology</th>
            <th class="px-3 py-2 text-left">Version</th>
            <th class="px-3 py-2 text-left">Confidence</th>
            <th class="px-3 py-2 text-left">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {#each findings as f}
            {@const fp = f as FingerFinding}
            <tr class="border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors">
              <td class="px-3 py-2 text-cyber-cyan">{fp.category}</td>
              <td class="px-3 py-2 text-text-primary font-semibold">{fp.name}</td>
              <td class="px-3 py-2 text-cyber-green">{fp.version || '—'}</td>
              <td class="px-3 py-2">
                <Badge variant={fp.confidence === 'high' ? 'success' : fp.confidence === 'medium' ? 'medium' : 'low'}>
                  {fp.confidence}
                </Badge>
              </td>
              <td class="px-3 py-2 text-text-muted text-xs max-w-xs truncate" title={fp.evidence}>{fp.evidence}</td>
            </tr>
          {/each}
        </tbody>
      </table>

    <!-- ── Probe ── -->
    {:else if tool === 'probe'}
      <table class="w-full text-sm font-mono border-collapse">
        <thead>
          <tr class="border-b border-bg-border text-xs text-text-muted uppercase tracking-wider">
            <th class="px-3 py-2 text-left">Severity</th>
            <th class="px-3 py-2 text-left">Name</th>
            <th class="px-3 py-2 text-left">Category</th>
            <th class="px-3 py-2 text-left">URL</th>
            <th class="px-3 py-2 text-left">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {#each findings as f}
            {@const pf = f as ProbeFinding}
            <tr class="border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors">
              <td class="px-3 py-2"><Badge variant={sevVariant(pf.severity)}>{pf.severity.toUpperCase()}</Badge></td>
              <td class="px-3 py-2 text-text-primary font-semibold">{pf.name}</td>
              <td class="px-3 py-2 text-cyber-cyan">{pf.category}</td>
              <td class="px-3 py-2 text-text-muted text-xs max-w-xs truncate" title={pf.url}>
                <a href={pf.url} target="_blank" rel="noopener noreferrer"
                   class="hover:text-cyber-cyan transition-colors flex items-center gap-1">
                  {pf.url.slice(0, 60)}{pf.url.length > 60 ? '…' : ''}
                  <ExternalLink size={10} />
                </a>
              </td>
              <td class="px-3 py-2 text-text-muted text-xs max-w-xs truncate" title={pf.evidence}>{pf.evidence}</td>
            </tr>
          {/each}
        </tbody>
      </table>

    <!-- ── SQLi / LFI / RFI / XSS ── -->
    {:else if ['sqli','lfi','rfi','xss'].includes(tool)}
      <table class="w-full text-sm font-mono border-collapse">
        <thead>
          <tr class="border-b border-bg-border text-xs text-text-muted uppercase tracking-wider">
            <th class="px-3 py-2 text-left">Method</th>
            <th class="px-3 py-2 text-left">URL</th>
            <th class="px-3 py-2 text-left">Parameter</th>
            <th class="px-3 py-2 text-left">Technique</th>
            <th class="px-3 py-2 text-left">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {#each findings as f}
            {@const inj = f as InjectFinding}
            <tr class="border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors">
              <td class="px-3 py-2">
                <Badge variant={inj.method === 'POST' ? 'medium' : 'info'}>{inj.method}</Badge>
              </td>
              <td class="px-3 py-2 text-text-muted text-xs max-w-xs truncate" title={inj.url}>
                <a href={inj.url} target="_blank" rel="noopener noreferrer"
                   class="hover:text-cyber-cyan transition-colors">{inj.url.slice(0, 50)}…</a>
              </td>
              <td class="px-3 py-2 text-cyber-yellow font-semibold">{inj.parameter}</td>
              <td class="px-3 py-2 text-cyber-orange">{inj.technique}</td>
              <td class="px-3 py-2 text-text-muted text-xs max-w-xs truncate" title={inj.evidence}>{inj.evidence?.slice(0, 60)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

    <!-- ── CVE ── -->
    {:else if tool === 'cve'}
      <table class="w-full text-sm font-mono border-collapse">
        <thead>
          <tr class="border-b border-bg-border text-xs text-text-muted uppercase tracking-wider">
            <th class="px-3 py-2 text-left">Severity</th>
            <th class="px-3 py-2 text-left">CVE ID</th>
            <th class="px-3 py-2 text-left">Name</th>
            <th class="px-3 py-2 text-left">Type</th>
            <th class="px-3 py-2 text-left">Evidence</th>
          </tr>
        </thead>
        <tbody>
          {#each findings as f}
            {@const cf = f as CveFinding}
            <tr class="border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors">
              <td class="px-3 py-2"><Badge variant={sevVariant(cf.severity)}>{cf.severity.toUpperCase()}</Badge></td>
              <td class="px-3 py-2 text-cyber-cyan font-semibold">{cf.cve_id || '—'}</td>
              <td class="px-3 py-2 text-text-primary max-w-xs truncate" title={cf.vul_name}>{cf.vul_name.slice(0, 50)}</td>
              <td class="px-3 py-2 text-cyber-yellow">{cf.vul_type}</td>
              <td class="px-3 py-2 text-text-muted text-xs max-w-xs truncate" title={cf.evidence ?? ''}>{(cf.evidence ?? '').slice(0, 60)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

    <!-- ── Recon ── -->
    {:else if tool === 'recon'}
      <table class="w-full text-sm font-mono border-collapse">
        <thead>
          <tr class="border-b border-bg-border text-xs text-text-muted uppercase tracking-wider">
            <th class="px-3 py-2 text-left">Method</th>
            <th class="px-3 py-2 text-left">URL</th>
            <th class="px-3 py-2 text-left">Data</th>
          </tr>
        </thead>
        <tbody>
          {#each findings as f}
            {@const ra = f as ReconAsset}
            <tr class="border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors">
              <td class="px-3 py-2"><Badge variant="info">{ra.method}</Badge></td>
              <td class="px-3 py-2">
                <a href={ra.url} target="_blank" rel="noopener noreferrer"
                   class="text-cyber-cyan hover:underline flex items-center gap-1 text-xs">
                  {ra.url}
                  <ExternalLink size={10} />
                </a>
              </td>
              <td class="px-3 py-2 text-text-muted text-xs">{ra.data || '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>

    <!-- ── Fallback: raw JSON ── -->
    {:else}
      <pre class="text-xs font-mono text-text-secondary p-4 overflow-auto">{JSON.stringify(findings, null, 2)}</pre>
    {/if}

  </div>

  <div class="px-3 py-2 border-t border-bg-border bg-bg-surface">
    <span class="text-xs font-mono text-text-muted">{findings.length} findings</span>
  </div>
{/if}
