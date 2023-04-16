<script>
  import { onMount } from 'svelte';
	import Map from '../lib/Map/Map.svelte';

  let URL = 'wss://tarea-2.2023-1.tallerdeintegracion.cl/connect';
  let socket, isLogged;
	const email = 'javier.bravo@uc.cl';
	const password = '1864158J';

  onMount(() => {
    socket = new WebSocket(URL);
		let payload = {
			"type": "JOIN",
			"payload": {
				"authorization": `Basic ${btoa(`${email}:${password}`)}`
			}
		};
		socket.onopen = () => socket.send(JSON.stringify(payload));
		isLogged = true;
  });
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	{#if isLogged}
		<Map {socket} />
	{/if}
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}
</style>
