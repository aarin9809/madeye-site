<script lang="ts">
  import { SCANNERS } from '$lib/scanners';
  import Badge from '$lib/components/ui/badge.svelte';
  import {
    Search, Fingerprint, Radar, FolderOpen, Globe,
    Database, ShieldAlert, Zap, ScanLine,
    ArrowRight, Shield, Activity,
  } from 'lucide-svelte';

  const iconMap: Record<string, unknown> = {
    Search, Fingerprint, Radar, FolderOpen, Globe,
    Database, ShieldAlert, Zap, ScanLine,
  };

  const highlights = [
    { label: 'SQLi', color: 'text-cyber-red', desc: 'SQL 인젝션 자동 탐지' },
    { label: 'XSS', color: 'text-cyber-orange', desc: '크로스사이트 스크립팅' },
    { label: 'LFI / RFI', color: 'text-cyber-yellow', desc: '파일 인클루전 공격' },
    { label: 'CVE', color: 'text-cyber-magenta', desc: '최신 CVE 매칭' },
    { label: 'Recon', color: 'text-cyber-cyan', desc: '정보 수집 / 크롤링' },
    { label: 'VScan', color: 'text-cyber-green', desc: '포트 & 서비스 스캔' },
  ];

  // Group scanners by category
  const offensive = SCANNERS.filter((s) => ['lfi','rfi','sqli','cve','auto'].includes(s.id));
  const recon     = SCANNERS.filter((s) => ['recon','finger','probe','vscan'].includes(s.id));
</script>

<svelte:head>
  <title>MadEyE — Web Vulnerability Scanner</title>
</svelte:head>

<div class="p-6 space-y-8 max-w-6xl mx-auto">

  <!-- Hero ----------------------------------------------------------------- -->
  <div class="relative rounded-xl border border-bg-border bg-bg-surface overflow-hidden p-8">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 via-transparent to-cyber-magenta/5 pointer-events-none"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-cyber-magenta/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

    <div class="relative">
      <!-- ASCII-inspired header -->
      <div class="font-mono mb-6 hidden sm:block">
        <div class="text-cyber-cyan/50 text-xs leading-tight select-none">
          ███╗   ███╗ █████╗ ██████╗ ███████╗██╗   ██╗███████╗
        </div>
        <div class="text-cyber-cyan/40 text-xs leading-tight select-none">
          ████╗ ████║██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝██╔════╝
        </div>
        <div class="text-cyber-magenta/50 text-xs leading-tight select-none">
          ██╔████╔██║███████║██║  ██║█████╗   ╚████╔╝ █████╗
        </div>
        <div class="text-cyber-magenta/40 text-xs leading-tight select-none">
          ██║╚██╔╝██║██╔══██║██║  ██║██╔══╝    ╚██╔╝  ██╔══╝
        </div>
        <div class="text-cyber-cyan/40 text-xs leading-tight select-none">
          ██║ ╚═╝ ██║██║  ██║██████╔╝███████╗   ██║   ███████╗
        </div>
        <div class="text-cyber-cyan/30 text-xs leading-tight select-none">
          ╚═╝     ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝   ╚═╝   ╚══════╝
        </div>
      </div>

      <div class="sm:hidden text-gradient font-mono font-bold text-4xl mb-2">MadEyE</div>

      <div class="flex flex-wrap items-start gap-4">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-text-primary mb-1">
            Web Vulnerability Scanner
          </h1>
          <p class="text-text-secondary text-sm max-w-lg">
            웹 취약점 자동 탐지 플랫폼. SQLi · XSS · LFI · RFI · CVE 매칭까지 통합 스캔.
          </p>
          <div class="mt-3 flex items-center gap-2">
            <Badge variant="critical">RED TEAM</Badge>
            <Badge variant="default">AUTHORIZED USE ONLY</Badge>
          </div>
        </div>
        <a
          href="/scan/auto"
          class="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded border border-cyber-magenta/40
            bg-cyber-magenta/10 text-cyber-magenta font-mono text-sm font-medium
            hover:bg-cyber-magenta/20 hover:border-cyber-magenta hover:shadow-magenta
            transition-all duration-200"
        >
          <Zap size={16} />
          Auto Scan
          <ArrowRight size={14} />
        </a>
      </div>
    </div>
  </div>

  <!-- Quick access grid ---------------------------------------------------- -->
  <div>
    <h2 class="text-sm font-mono text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
      <Activity size={14} />
      Offensive Tools
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {#each offensive as scanner}
        {@const Icon = iconMap[scanner.icon]}
        <a
          href="/scan/{scanner.id}"
          class="group relative rounded-lg border border-bg-border bg-bg-surface p-4
            hover:border-cyber-cyan/30 hover:bg-bg-elevated
            transition-all duration-200 card-hover flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <span class="{scanner.color} group-hover:opacity-100 opacity-70 transition-opacity">
              <svelte:component this={Icon} size={18} />
            </span>
            <span class="font-mono font-semibold text-sm text-text-primary">{scanner.label}</span>
          </div>
          <p class="text-xs text-text-muted leading-relaxed line-clamp-2">{scanner.description}</p>
          <ArrowRight size={12} class="mt-auto ml-auto text-text-muted group-hover:text-cyber-cyan transition-colors" />
        </a>
      {/each}
    </div>
  </div>

  <div>
    <h2 class="text-sm font-mono text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
      <Shield size={14} />
      Recon & Fingerprinting
    </h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {#each recon as scanner}
        {@const Icon = iconMap[scanner.icon]}
        <a
          href="/scan/{scanner.id}"
          class="group relative rounded-lg border border-bg-border bg-bg-surface p-4
            hover:border-cyber-cyan/30 hover:bg-bg-elevated
            transition-all duration-200 card-hover flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <span class="{scanner.color} group-hover:opacity-100 opacity-70 transition-opacity">
              <svelte:component this={Icon} size={18} />
            </span>
            <span class="font-mono font-semibold text-sm text-text-primary">{scanner.label}</span>
          </div>
          <p class="text-xs text-text-muted leading-relaxed line-clamp-2">{scanner.description}</p>
          <ArrowRight size={12} class="mt-auto ml-auto text-text-muted group-hover:text-cyber-cyan transition-colors" />
        </a>
      {/each}
    </div>
  </div>

  <!-- Capabilities --------------------------------------------------------- -->
  <div class="rounded-xl border border-bg-border bg-bg-surface p-6">
    <h2 class="text-sm font-mono text-text-muted uppercase tracking-widest mb-4">Capabilities</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {#each highlights as h}
        <div class="flex items-start gap-3 p-3 rounded-lg bg-bg-elevated border border-bg-border">
          <div class="w-1 h-full rounded-full bg-gradient-cyber min-h-[2rem] shrink-0"></div>
          <div>
            <div class="font-mono font-semibold text-sm {h.color}">{h.label}</div>
            <div class="text-xs text-text-muted mt-0.5">{h.desc}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

</div>
