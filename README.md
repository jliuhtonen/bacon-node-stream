# bacon-node-stream

Utility for creating [Node.js readable streams](https://nodejs.org/api/stream.html#stream_readable_streams) from [Bacon streams](http://baconjs.github.io/) and vice versa.

## Usage

Install this package and `baconjs`, that is this package's peer dependency.

### API

```typescript
readableToBacon(stream: Readable, options?: ReadableOptions): Bacon.EventStream<any, any>
```

Creates a new Node.js stream that is exposed as a Bacon event stream and pipes `stream` into it. Use this function for creating a Bacon EventStream from a Readable stream. You must provide the options accordingly, so if `stream` uses object mode, you must also specify it here, and so on. 

Note to TypeScript users: `Readable`'s values are not typed, so you must cast or determine the correct type yourself (use `.map()`).

```typescript
baconToReadable(stream: Bacon.EventStream<any, any>, options?: ReadableOptions): Readable {
```

Wraps a Bacon event stream as a Node.js Readable stream. If the Readable is paused, _all values and the possible end event of the stream are buffered until the Readable is resumed_. The exception to this are error events, that are emitted immediately when they occur in the Bacon stream. Remember to provide options if your stream uses the object mode.
