import { EventEmitter } from 'events';
export const events = new EventEmitter();


// Example consumers can register like:
// events.on('post.created', (post) => { /* send webhook, index search, etc. */ });
// events.on('file.uploaded', (file) => { /* virus scan queue, etc. */ });