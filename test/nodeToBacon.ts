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

    const baconStream = readableToBacon(testStream) as Bacon.EventStream<any, number>

    testData.forEach(v => {
      testStream.write(v)
    })

    const initialResult: number[] = []
    Bluebird.resolve(baconStream.fold(initialResult, (arr, v) => arr.concat(v as number)).toPromise())
      .tap(result => {
        assert.deepEqual(result, testData)
      })
  })
})
