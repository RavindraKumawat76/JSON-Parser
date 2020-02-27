const nullParser = input => input.startsWith('null') ? [null, input.slice(4)] : null

const booleanParser = input => input.startsWith('true') ? [true, input.slice(4)] : input.startsWith('false') ? [false, input.slice(5)] : null

const valueParser = input => stringParser(input) || numberParser(input) || arrayParser(input) || booleanParser(input) || nullParser(input) || objectParser(input)

const numberParser = input => {
  const number = /^[-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/
  const regex = /^[-]?(([0]\.\d+)|\d+(\.\d+)?)([eE][+-]?\d+)?/
  const regex1 = /^[-]?([0]\d+)/ // 0123
  if (regex.test(input) && !input.match(regex1)) {
    const input1 = input.match(regex)[0]
    if (number.test(input1)) return [Number(input1), input.slice(input1.length)]
  }
  return null
}

const stringParser = input => {
  if (!input.startsWith('"')) return null
  const arr = []
  const slashCase = { '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', '\\': '\\', '"': '"' }
  const input1 = input.slice(1)
  let value = 0
  for (let i = 0; i < input1.length; i++) {
    if (input1[i] === '\t' || input1[i] === '\n') return null
    if (input1[i] === '"') {
      value = i + 1
      break
    }
    if (i === input1.length - 1 && input1[input1.length - 1] !== '"') return null
    if (input1[i] === '\\') {
      if (slashCase.hasOwnProperty(input1[i + 1])) {
        arr.push(slashCase[input1[i + 1]])
        i++
      } else if (input1[i + 1] === 'u') {
        const hex = []
        for (let j = i + 2; j < i + 6; j++) {
          hex.push(input1[j])
        }
        const hexCode = hex.join('')
        const hexChar = String.fromCodePoint(parseInt(hexCode, 16))
        arr.push(hexChar)
        i = i + 5
      } else {
        return null
      }
    } else {
      arr.push(input1[i])
    }
  }
  const strJoin = arr.join('')
  return [strJoin, input1.slice(value)]
}

const arrayParser = input => {
  const arr = []
  if (!input.startsWith('[')) return null
  input = input.slice(1).trim()
  if (input.startsWith(',')) return null
  while (input[0] !== ']' && input.length > 1) {
    input = input.trim()
    if (input[0]) {
      const value = valueParser(input)
      if (value === null) return null
      arr.push(value[0])
      input = value[1].trim()
      if (!input.startsWith(',')) break
      input = input.slice(1).trim()
      if (input.startsWith(']')) return null
    }
  }
  if (input[0] === ']') return [arr, input.slice(1)]
  return null
}

const objectParser = input => {
  let key
  let flag = false
  const obj = {}
  if (!input.startsWith('{')) return null
  input = input.slice(1).trim()
  if (input.startsWith(',')) return null
  while (input[0] !== '}' && input.length > 1) {
    input = input.trim()
    if (!flag) {
      flag = true
      key = stringParser(input)
      if (key === null) return null
      input = key[1].trim()
      key = key[0]
    }
    if (input[0] === ':' && flag) {
      input = input.slice(1).trim()
    } else {
      return null
    }
    if (flag) {
      input = input.trim()
      const value = valueParser(input)
      if (!value) return null
      obj[key] = value[0]
      input = value[1].trim()
      flag = false
      if (!input.startsWith(',')) break
      input = input.slice(1).trim()
      if (input.startsWith('}')) return null
    }
  }
  if (input.startsWith('}')) return [obj, input.slice(1)]
  return null
}

const jsonParser = (input) => {
  input = objectParser(input) || arrayParser(input)
  if (input === null) return null
  if (input[1] === '' || input[1] === '\n') return input[0]
  return null
}

const fs = require('fs')
fs.readFile('Input2.txt', 'utf-8', (err, data) => {
  if (err) throw err
  console.log(jsonParser(data))
})

// const fs = require('fs')
// for (let i = 1; i <= 33; i++) { //
//   const data = fs.readFileSync(
//     `C:\\Users\\admin\\Desktop\\Eloquent\\JsonParser\\test\\fail${i}.json`,
//     'utf8'
//   )
//   console.log(jsonParser(data))
// }
