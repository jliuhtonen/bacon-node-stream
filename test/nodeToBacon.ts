import 'mocha'
import * as assert from 'assert'
import * as Bacon from 'baconjs'
import * as Bluebird from 'bluebird'
import {readableToBacon} from '../dist/index'
import {PassThrough} from 'stream'

describe('Converting node streams to Bacon streams', function() {
  it('should include events in the Bacon stream from the node stream', () => {
    const testStream = new PassThrough({ objectMode: true })
    const testData = [5, 3, 6, 8, 9]

    const baconStream = readableToBacon(testStream, {objectMode: true}) as Bacon.EventStream<any, number>
    const testPromise = baconStreamAsArray(baconStream)
      .tap(result => {
        console.log('tap')
        assert.deepEqual(result, testData)
      })

    testData.forEach(v => {
      testStream.write(v)
    })

    testStream.end()

    return testPromise
  })

  it('should include string events in the Bacon stream from the node stream', () => {
    const testStream = new PassThrough()
    const testData = ['hey', 'ho', 'let\'s go']

    const baconStream = readableToBacon(testStream) as Bacon.EventStream<any, number>
    const testPromise = baconStreamAsArray(baconStream)
      .tap(result => {
        assert.deepEqual(result.map(r => r.toString()), testData)
      })

    testData.forEach(v => {
      testStream.write(v)
    })

    testStream.end()

    return testPromise
  })

  it('should include buffer events in the Bacon stream from the node stream', () => {
    const testStream = new PassThrough()
    const testData = [
      Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72, 0x73]),
      Buffer.from([0x61, 0x72, 0x65]),
      Buffer.from([0x63, 0x6f, 0x6f, 0x6c])
    ]

    const baconStream = readableToBacon(testStream) as Bacon.EventStream<any, Buffer>
    const testPromise = baconStreamAsArray(baconStream)
      .tap(result => {
        assert.deepEqual(result.map(r => r.toString()).join(' '), 'buffers are cool')
      })

    testData.forEach(v => {
      testStream.write(v)
    })

    testStream.end()

    return testPromise
  })
})

function baconStreamAsArray<T>(stream: Bacon.EventStream<any, T>): Bluebird<T[]> {
  const initialResult: T[] = []
  return Bluebird.resolve(stream.fold(initialResult, (arr, v) => arr.concat(v as T)).toPromise())
}