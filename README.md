# Bacon.Pipe

_It belongs in a monad!_

Convert Node.js streams to Bacon streams and vice versa

## Example

Let's say that you want to print user's input from in a colorful fashion without vowels, stop with '.' and cause an error with 'q':

```javascript
const Bacon = require('baconjs')
const BaconPipe = require('./dist/index')
const stdin = process.stdin
stdin.setRawMode(true)
stdin.resume()
stdin.setEncoding('utf8')

const vowels = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö']

const inputS = BaconPipe.readableToBacon(stdin).map(buf => buf.toString())
const noVowelsS = inputS.filter(l => !vowels.includes(l))
const colorfulS = noVowelsS.flatMap(c => {
  if (c === 'q') {
    return new Bacon.Error(new Error('do not press q'))
  }
  const color = Math.round((Math.random() * 100)) % 7
  return Bacon.once('\x1b[3' + color + 'm' + c)
}).takeUntil(inputS.filter(c => c === '.'))

BaconPipe.baconToReadable(colorfulS)
  .on('error', e => console.log('error', e))
  .pipe(process.stdout)
```

And why wouldn't you?