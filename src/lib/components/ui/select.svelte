<script lang="ts">
  let {
    value = $bindable(''),
    options = [] as { value: string; label: string }[],
    disabled = false,
    class: className = '',
    id,
    name,
  }: {
    value?: string;
    options?: { value: string; label: string }[];
    disabled?: boolean;
    class?: string;
    id?: string;
    name?: string;
  } = $props();
</script>

<div class="relative">
  <select
    {id}
    {name}
    {disabled}
    bind:value
    class="w-full h-9 px-3 pr-8 rounded border border-bg-border bg-bg-surface text-text-primary font-mono text-sm
      appearance-none cursor-pointer
      focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/20
      disabled:opacity-40 disabled:cursor-not-allowed
      transition-colors duration-150
      {className}"
  >
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-2 flex items-center">
    <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
