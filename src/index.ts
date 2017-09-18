import * as Bacon from 'baconjs'
import { Readable, PassThrough, ReadableOptions } from 'stream'

export function readableToBacon(stream: Readable, options?: ReadableOptions): Bacon.EventStream<any, any> {
  return Bacon.fromBinder(sink => {
    const sinkValue = (value: any) => sink(value)
    const sinkError = (err: Error) => sink(new Bacon.Error(err))
    const sinkEnd = () => sink(new Bacon.End())

    const passthrough = new PassThrough(options || {})
    passthrough.on('data', sinkValue)
    passthrough.on('error', sinkError)
    passthrough.on('close', sinkEnd)
    passthrough.on('end', sinkEnd)

    stream.pipe(passthrough)

    return () => {
      stream.unpipe(passthrough)
      passthrough.end()
    }
  })
}

export function baconToReadable(stream: Bacon.EventStream<any, any>, options?: ReadableOptions): Readable {
  return new BaconReadable(options || {}, stream)
}

interface BaconReadableEvent {
  type: 'value' | 'error' | 'end'
  value: any
}

class BaconReadable extends Readable {
  private awaitingData: boolean = false
  private buffer: BaconReadableEvent[] = []

  constructor(options: ReadableOptions, stream: Bacon.EventStream<any, any>) {
    super(options)
    stream.subscribe(event => {
      const streamEnded = event.isEnd()
      if (streamEnded) {
        this.buffer.push({ type: 'end', value: null })
      } else if (event.isError()) {
        const errorEvent = event as Bacon.Error<any>
        this.buffer.push({ type: 'error', value: errorEvent.error })
      } else if (event.hasValue()) {
        this.buffer.push({ type: 'value', value: event.value() })
      }

      if (this.awaitingData) {
        this.pushBuffer()
      }

      if (streamEnded) {
        return Bacon.noMore
      } else {
        return undefined
      }
    })
  }

  _read() {
    if (this.buffer.length === 0) {
      this.awaitingData = true
    } else {
      this.pushBuffer()
    }
  }

  pushBuffer() {
    let acceptsMoreValues = true

    while (acceptsMoreValues && this.buffer.length > 0) {
      const {type: eventType, value} = this.buffer.shift()!
      if (eventType === 'error') {
        this.emit('error', value)
      } else if (eventType === 'value' && value === null) {
        this.emit('error', new Error('Encountered null value in Bacon stream, readable stream cannot contain nulls'))
      } else {
        acceptsMoreValues = this.push(value)
      }
    }

    this.awaitingData = acceptsMoreValues
  }

}
