<script lang="ts">
  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    rows = 5,
    class: className = '',
    id,
    name,
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    class?: string;
    id?: string;
    name?: string;
  } = $props();
</script>

<textarea
  {id}
  {name}
  {placeholder}
  {disabled}
  {rows}
  bind:value
  class="w-full px-3 py-2 rounded border border-bg-border bg-bg-surface text-text-primary font-mono text-sm
    placeholder:text-text-muted resize-y
    focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/20
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-colors duration-150
    {className}"
></textarea>
