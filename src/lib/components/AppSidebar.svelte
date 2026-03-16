<script lang="ts">
  import { page } from '$app/stores';
  import { SCANNERS } from '$lib/scanners';
  import {
    Search, Fingerprint, Radar, FolderOpen, Globe,
    Database, ShieldAlert, Zap, ScanLine,
    LayoutDashboard, ChevronRight,
  } from 'lucide-svelte';

  const iconMap: Record<string, unknown> = {
    Search, Fingerprint, Radar, FolderOpen, Globe,
    Database, ShieldAlert, Zap, ScanLine,
  };

  let currentPath = $derived($page.url.pathname);

  const navItems = SCANNERS.map((s) => ({
    href: `/scan/${s.id}`,
    label: s.label,
    icon: iconMap[s.icon],
    color: s.color,
    description: s.description,
  }));
</script>

<aside class="flex flex-col h-full w-56 bg-bg-surface border-r border-bg-border shrink-0">
  <!-- Logo -->
  <div class="px-4 py-5 border-b border-bg-border">
    <a href="/" class="flex items-center gap-2 group">
      <div class="w-8 h-8 rounded border border-cyber-cyan/40 bg-cyber-cyan/10 flex items-center justify-center glow-cyan">
        <span class="text-cyber-cyan font-mono text-xs font-bold">ME</span>
      </div>
      <div>
        <div class="text-gradient font-mono font-bold text-sm leading-none">MadEyE</div>
        <div class="text-text-muted text-xs font-mono mt-0.5">Web Scanner</div>
      </div>
    </a>
  </div>

  <!-- Nav -->
  <nav class="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
    <!-- Dashboard -->
    <a
      href="/"
      class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-mono transition-all duration-150
        {currentPath === '/'
          ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'}"
    >
      <LayoutDashboard size={15} />
      <span>Dashboard</span>
    </a>

    <div class="pt-2 pb-1 px-2.5">
      <span class="text-xs font-mono text-text-muted uppercase tracking-widest">Scanners</span>
    </div>

    {#each navItems as item}
      {@const active = currentPath === item.href}
      <a
        href={item.href}
        class="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm font-mono transition-all duration-150
          {active
            ? 'bg-bg-elevated text-text-primary border border-bg-border'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'}"
        title={item.description}
      >
        <span class="{active ? item.color : ''}">
          <svelte:component this={item.icon} size={15} />
        </span>
        <span class="{active ? 'text-text-primary' : ''}">{item.label}</span>
        {#if active}
          <ChevronRight size={12} class="ml-auto text-text-muted" />
        {/if}
      </a>
    {/each}
  </nav>

  <!-- Footer -->
  <div class="px-4 py-3 border-t border-bg-border">
    <div class="text-xs font-mono text-text-muted">
      <span class="text-cyber-red/70">RED TEAM</span>
      <span class="text-text-muted"> // AUTHORIZED USE ONLY</span>
    </div>
  </div>
</aside>
