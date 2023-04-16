<script>
  import { chatMessages } from './store.js';

  export let socket;

  let messages = []; // array to store chat messages
  let newMessage = ''; // input field for new message
  let username = 'User'; // default username

  chatMessages.subscribe(value => {
    messages = value;
  });

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }

  function sendMessage() {
    if (newMessage) {
      let payload = {
			"type": "CHAT",
			"payload": {
				"content": newMessage
			}
		};
      socket.send(JSON.stringify(payload));
      newMessage = '';
    }
  }
</script>

<div class="chat-container">
  <div class="chat-messages">
    {#each messages as message}
      <div class="chat-message">
        <span class="chat-username">{message.date.split('.')[0]} {message.name}: </span>
        <span class="chat-content">{message.content}</span>
      </div>
    {/each}
  </div>
  <div class="chat-input">
    <!-- <input type="text" bind:value={newMessage} on:keydown={handleKeyPress} /> -->
    <input type="text" bind:value={newMessage} />
    <button on:click={sendMessage}>Send</button>
  </div>
</div>

<style>
.chat-container {
  width: 300px;
  max-height: 580px;
  overflow-y: auto!important;
  padding: 10px;
  background-color: #f8f8f8;

  border: 2px solid #000;
  border-radius: 10px;
  overflow: hidden;
}

.chat-messages {
  margin-bottom: 10px;
}

.chat-message {
  margin-bottom: 5px;
}

.chat-username {
  font-weight: bold;
}

.chat-input {
  display: flex;
  margin-top: 10px;
}

.chat-input input {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.chat-input button {
  padding: 5px 10px;
  margin-left: 5px;
  border: none;
  border-radius: 3px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}
</style>
