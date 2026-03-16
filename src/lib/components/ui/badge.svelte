<script lang="ts">
  import { type Snippet } from 'svelte';
  import { clsx } from 'clsx';

  type Variant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'default';

  let {
    variant = 'default' as Variant,
    class: className = '',
    children,
  }: {
    variant?: Variant;
    class?: string;
    children: Snippet;
  } = $props();

  const variants: Record<Variant, string> = {
    critical: 'bg-cyber-red/15 text-cyber-red border-cyber-red/30',
    high:     'bg-cyber-orange/15 text-cyber-orange border-cyber-orange/30',
    medium:   'bg-cyber-yellow/15 text-cyber-yellow border-cyber-yellow/30',
    low:      'bg-cyber-green/15 text-cyber-green border-cyber-green/30',
    info:     'bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/30',
    success:  'bg-cyber-green/15 text-cyber-green border-cyber-green/30',
    default:  'bg-bg-elevated text-text-secondary border-bg-border',
  };
</script>

<span class={clsx(
  'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border',
  variants[variant],
  className
)}>
  {@render children()}
</span>
