import 'mocha'
import * as assert from 'assert'
import * as Bacon from 'baconjs'
import * as Bluebird from 'bluebird'
import {baconToReadable} from '../dist/index'

describe('Converting Bacon streams to Node streams', function() {
  it('should include events in the node stream from the Bacon stream', () => {
    const testData = [7, 3, 2, 7, 6]
    const nodeStream = baconToReadable(Bacon.fromArray(testData), {objectMode: true})

    return new Bluebird((resolve, reject) => {
      let results: number[] = []

      nodeStream.on('data', (value: any) => {
        results.push(value)
      })

      nodeStream.on('end', () => resolve(results))
      nodeStream.on('close', () => resolve(results))
      nodeStream.on('error', err => reject(err))
    }).tap(results => {
      assert.deepEqual(results, testData)
    })
  })

  it('should buffer while the stream is paused', function() {
    this.timeout(20000)
    const testData = ['hey', 'ho', 'let\'s go', 'ey', 'o', 'letsgo']
    const baconStream = Bacon.sequentially(500, testData)
    const nodeStream = baconToReadable(baconStream, { objectMode: true })

    return new Bluebird((resolve, reject) => {
      let shouldPauseNext = true
      const results: string[] = []

      nodeStream.on('data', (value: any) => {
        results.push(value)
        if (shouldPauseNext) {
          nodeStream.pause()
          shouldPauseNext = false
          setTimeout(() => {
            nodeStream.resume()
          }, 3000)
        } else {
          shouldPauseNext = true
        }
      })

      nodeStream.on('end', () => resolve(results))
      nodeStream.on('close', () => resolve(results))
      nodeStream.on('error', err => reject(err))
    }).tap(results => {
      assert.deepEqual(results, testData)
    })
  })
})