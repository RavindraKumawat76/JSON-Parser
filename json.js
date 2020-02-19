const nullParser = input => input.startsWith('null') ? [null, input.slice(4)] : null;
const booleanParser = input => input.startsWith('true') ? [true, input.slice(4)] : input.startsWith('false') ? [false, input.slice(5)] : null;
const valueParser = input => stringParser(input) || numberParser(input) || arrayParser(input) || booleanParser(input) || nullParser(input) || objectParser(input);

const numberParser = input => {
    const number = /^[-]?(\d+(\.\d*)?|\.\d+)([eE][+\-]?\d+)?$/;
    const regex = /^[-]?(([0]\.\d+)|\d+(\.\d+)?)([eE][+\-]?\d+)?/;
    const regex1 = /^[-]?([0]\d+)/; //0123
    if (regex.test(input) && !input.match(regex1)) {
        const input1 = input.match(regex)[0]
        if (number.test(input1)) return [Number(input1), input.slice(input1.length)];
    }
    return null;
}

const stringParser = (input) => {
    if (input.startsWith('"')) {
        const arr = []
        const slashCase = { '/': '/', 'b': '\b', 'f': '\f', 'n': '\n', 'r': '\r', 't': '\t', '\\': '\\', '"': '"' };
        const input1 = input.slice(1);
        let value = 0;
        for (let i = 0; i < input1.length; i++) {
            if (input1[i] == '"') {
                value = i + 1;
                break;
            }
            if (i === input1.length - 1 && input1[input1.length - 1] !== '"') return null
            if (input1[i] == '\\') {
                if (slashCase.hasOwnProperty(input1[i + 1])) {
                    arr.push(slashCase[input1[i + 1]])
                    i++;
                } else if (input1[i + 1] === 'u') {
                    let hex = []
                    for (let j = i + 2; j < i + 6; j++) {
                        hex.push(input1[j])
                    }
                    let hexCode = hex.join('')
                    let hexChar = String.fromCodePoint(parseInt(hexCode, 16));
                    arr.push(hexChar);
                    i = i + 5;
                } else {
                    arr.push(input1[i])
                }
            } else {
                arr.push(input1[i]);
            }
        }
        let strJoin = arr.join('');
        return [strJoin, input1.slice(value)];
    }
    return null;
}

const arrayParser = input => {
    const arr = []
    if (input.startsWith('[')) {
        let input1 = input.slice(1).trim()
        if (input1.startsWith(",")) return null
        while (input1[0] !== "]" && input1.length > 1) {
            input1 = input1.trim()
            if (input1[0]) {
                let value = valueParser(input1)
                if (value === null) return null
                arr.push(value[0])
                input1 = value[1].trim();
                if (input1.startsWith(',')) {
                    input1 = input1.slice(1).trim()
                    if (input1.startsWith(']')) return null
                }
                else {
                    break
                }
            }
        }
        if (input1[0] === "]") return [arr, input1.slice(1)]
        return null
    }
    return null
}

const objectParser = input => {
    let key;
    let flag = false
    let obj = {}
    if (input.startsWith('{')) {
        input = input.slice(1).trim()
        if (input.startsWith(",")) return null
        while (input[0] !== "}" && input.length > 1) {
            input = input.trim()
            if (flag === false) {
                flag = true
                key = stringParser(input)
                if (key === null) return null
                input = key[1].trim()
                key = key[0]
            }
            if (input[0] === ":" && flag === true) {
                input = input.slice(1).trim()
            } else {
                return null
            }
            if (flag === true) {
                input = input.trim()
                let value = valueParser(input)
                if (value === null) return null
                obj[key] = value[0]
                input = value[1].trim()
                flag = false
                if (input.startsWith(',')) {
                    input = input.slice(1).trim()
                    if (input.startsWith('}')) return null
                } else {
                    break
                }
            }
        }
        if (input.startsWith("}")) return [obj, input.slice(1)]
        return null
    }
    return null
}

const jsonParser = (input) => {
    let input1 = objectParser(input) || arrayParser(input)
    if (input1 === null) return null
    if (input1[1] === '' || input1[1] === '\n') return input1[0]
    return null
}

const fs = require('fs')
fs.readFile('Input1.txt', 'utf-8', (err, data) => {
    if (err) throw err;
    console.log(jsonParser(data));
});