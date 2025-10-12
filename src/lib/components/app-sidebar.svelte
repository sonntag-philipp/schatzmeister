<script lang="ts">
	import flypsiAvatar from '$lib/assets/avatars/flypsi.webp';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import BadgeEuroIcon from '@lucide/svelte/icons/badge-euro';
	import ChartBarIcon from '@tabler/icons-svelte/icons/chart-bar';
	import ChartDonutIcon from '@tabler/icons-svelte/icons/chart-donut';
	import DashboardIcon from '@tabler/icons-svelte/icons/dashboard';
	import HelpIcon from '@tabler/icons-svelte/icons/help';
	import ReceiptIcon from '@tabler/icons-svelte/icons/receipt';
	import SettingsIcon from '@tabler/icons-svelte/icons/settings';
	import type { ComponentProps } from 'svelte';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';

	const data = {
		user: {
			name: 'flypsi',
			email: 'flypsi@proton.me',
			avatar: flypsiAvatar
		},
		navMain: [
			{
				title: 'Dashboard',
				url: '#',
				icon: DashboardIcon
			},
			{
				title: 'Receipts',
				url: '#',
				icon: ReceiptIcon
			},
			{
				title: 'Analytics',
				url: '#',
				icon: ChartBarIcon
			},
			{
				title: 'Budgeting',
				url: '#',
				icon: ChartDonutIcon
			}
		],
		navSecondary: [
			{
				title: 'Settings',
				url: '#',
				icon: SettingsIcon
			},
			{
				title: 'Get Help',
				url: '#',
				icon: HelpIcon
			}
		]
	};

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<BadgeEuroIcon class="!size-5" />
							<span class="text-base font-semibold">Schatzmeister</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
