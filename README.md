# AuroraRPC-Client

## Description

This is the client implementation for Aurora RPC.  
The client uses the [ws](https://github.com/websockets/ws) library for Node.js / native [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) for the browser.  
The server implementation is available in [AuroraRPC-Server](https://github.com/AuroraTeam/AuroraRPC-Server).

## Installation

```bash
npm i aurora-rpc-client
```

## Usage

```ts
import { Client } from 'aurora-rpc-client';

// --- Connect ---

const client = new Client("ws://localhost:8080")
client.connect()

// or

const client = new Client()
client.connect("ws://localhost:8080")

// ---

const result = await client.send('hello')
console.log(result) // "Hello Aurora RPC!"
```
