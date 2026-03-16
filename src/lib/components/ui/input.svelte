<script lang="ts">
  let {
    value = $bindable(''),
    type = 'text',
    placeholder = '',
    disabled = false,
    class: className = '',
    id,
    name,
    autocomplete = 'off',
    onchange,
  }: {
    value?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    id?: string;
    name?: string;
    autocomplete?: string;
    onchange?: (e: Event) => void;
  } = $props();
</script>

<input
  {id}
  {name}
  {type}
  {placeholder}
  {disabled}
  {autocomplete}
  bind:value
  {onchange}
  class="w-full h-9 px-3 rounded border border-bg-border bg-bg-surface text-text-primary font-mono text-sm
    placeholder:text-text-muted
    focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/20
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-colors duration-150
    {className}"
/>
