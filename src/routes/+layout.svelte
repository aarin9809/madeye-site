<script lang="ts">
  import '../app.css';
  import AppSidebar from '$lib/components/AppSidebar.svelte';
  import { page } from '$app/stores';
  import { Menu, X } from 'lucide-svelte';

  let { children } = $props();
  let sidebarOpen = $state(false);
</script>

<div class="flex h-screen overflow-hidden bg-bg bg-cyber-grid bg-grid">
  <!-- Mobile sidebar overlay -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
      role="button"
      tabindex="0"
      onclick={() => (sidebarOpen = false)}
      onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
    ></div>
  {/if}

  <!-- Sidebar (desktop: static, mobile: drawer) -->
  <div
    class="fixed inset-y-0 left-0 z-50 lg:relative lg:z-auto lg:flex lg:shrink-0
      transition-transform duration-300
      {sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
  >
    <AppSidebar />
  </div>

  <!-- Main content -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
    <!-- Mobile header -->
    <header class="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-bg-border bg-bg-surface">
      <button
        onclick={() => (sidebarOpen = !sidebarOpen)}
        class="text-text-secondary hover:text-cyber-cyan transition-colors"
      >
        {#if sidebarOpen}
          <X size={20} />
        {:else}
          <Menu size={20} />
        {/if}
      </button>
      <span class="text-gradient font-mono font-bold text-sm">MadEyE</span>
    </header>

    <!-- Page content -->
    <main class="flex-1 overflow-y-auto">
      {@render children()}
    </main>
  </div>
</div>
