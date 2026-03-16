<script lang="ts">
  import { type Snippet } from 'svelte';
  import { clsx } from 'clsx';

  type Variant = 'default' | 'cyber' | 'ghost' | 'danger' | 'success' | 'outline';
  type Size = 'sm' | 'md' | 'lg';

  let {
    variant = 'default' as Variant,
    size = 'md' as Size,
    disabled = false,
    type = 'button' as 'button' | 'submit' | 'reset',
    class: className = '',
    onclick,
    children,
  }: {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
    onclick?: () => void;
    children: Snippet;
  } = $props();

  const base =
    'inline-flex items-center justify-center gap-2 rounded font-mono text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants: Record<Variant, string> = {
    default:
      'bg-bg-elevated border border-bg-border text-text-primary hover:border-cyber-cyan/40 hover:text-cyber-cyan focus:ring-cyber-cyan/30',
    cyber:
      'bg-cyber-cyan/10 border border-cyber-cyan/40 text-cyber-cyan hover:bg-cyber-cyan/20 hover:border-cyber-cyan hover:shadow-glow-cyan focus:ring-cyber-cyan/30',
    ghost:
      'border border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated focus:ring-bg-border',
    danger:
      'bg-cyber-red/10 border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/20 hover:border-cyber-red hover:shadow-glow-red focus:ring-cyber-red/30',
    success:
      'bg-cyber-green/10 border border-cyber-green/40 text-cyber-green hover:bg-cyber-green/20 hover:border-cyber-green hover:shadow-glow-green focus:ring-cyber-green/30',
    outline:
      'border border-bg-border text-text-secondary hover:border-cyber-cyan/40 hover:text-cyber-cyan focus:ring-cyber-cyan/30',
  };

  const sizes: Record<Size, string> = {
    sm: 'h-7 px-3 text-xs',
    md: 'h-9 px-4',
    lg: 'h-11 px-6 text-base',
  };
</script>

<button
  {type}
  {disabled}
  {onclick}
  class={clsx(base, variants[variant], sizes[size], className)}
>
  {@render children()}
</button>
