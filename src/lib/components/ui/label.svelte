<script lang="ts">
  import { type Snippet } from 'svelte';
  let { for: htmlFor = '', class: className = '', children }: { for?: string; class?: string; children: Snippet } = $props();
</script>

<label for={htmlFor} class="text-xs font-mono text-text-secondary uppercase tracking-wider {className}">
  {@render children()}
</label>
