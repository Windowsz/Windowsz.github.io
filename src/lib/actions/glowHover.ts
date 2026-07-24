// Pointer-tracked glass "glare" — a soft highlight that follows the cursor over
// an element and fades in/out on hover. Used on the news cards, dialog panel,
// and nav to sell the liquid-glass look. Apply with `use:glowHover` on an
// element that already has `relative overflow-hidden` (or similar) so the
// glare clips to its rounded corners instead of spilling outside them.
export function glowHover(node: HTMLElement, params?: { color?: string; size?: number }) {
	let color = params?.color ?? 'rgba(255, 255, 255, 0.25)';
	let size = params?.size ?? 220;

	const glare = document.createElement('div');
	glare.setAttribute('aria-hidden', 'true');
	Object.assign(glare.style, {
		position: 'absolute',
		inset: '0',
		pointerEvents: 'none',
		opacity: '0',
		transition: 'opacity 300ms ease'
	} satisfies Partial<CSSStyleDeclaration>);
	node.prepend(glare);

	function paintAt(x: number, y: number) {
		glare.style.background = `radial-gradient(${size}px circle at ${x}px ${y}px, ${color}, transparent 70%)`;
	}

	function onMove(e: PointerEvent) {
		const rect = node.getBoundingClientRect();
		paintAt(e.clientX - rect.left, e.clientY - rect.top);
	}
	function onEnter() {
		glare.style.opacity = '1';
	}
	function onLeave() {
		glare.style.opacity = '0';
	}

	node.addEventListener('pointermove', onMove);
	node.addEventListener('pointerenter', onEnter);
	node.addEventListener('pointerleave', onLeave);

	return {
		update(newParams?: { color?: string; size?: number }) {
			color = newParams?.color ?? color;
			size = newParams?.size ?? size;
		},
		destroy() {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerenter', onEnter);
			node.removeEventListener('pointerleave', onLeave);
			glare.remove();
		}
	};
}
