// store.js
import { writable } from 'svelte/store';

// Create a writable store to store the chat messages
export const chatMessages = writable([]);
