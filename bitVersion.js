
const bitNumb = {
    1: [1431655765],
    2: [1431655765, 858993459],
    3: [1431655765, 858993459, 252645135],
    4: [1431655765, 858993459, 252645135, 16711935],
    5: [1431655765, 858993459, 252645135, 16711935, 65535],


    false: 0,
    true: 4294967295
}

let test = {
    truthsToDeciId(A_truths) {
        let N_accumulated = BigInt(1), N_deciId = BigInt(0)
        for (let i = 0, l = A_truths.length; i < l; i++) {
            if (A_truths.pop()) N_deciId += N_accumulated
            N_accumulated *= BigInt(2)
        }
        return N_deciId
    },

    deciIdToTruths(N_deciId, N_truthsLength) {
        if (N_truthsLength === undefined) throw new Error("The length of truth array being returned should be given as a second argument.")

        let S_binary
        if (N_deciId >= 0) S_binary = N_deciId.toString(2)
        else {
            S_binary = ((-N_deciId ^ parseInt("1".repeat(N_deciId.toString(2).length), 2)) + 1).toString(2)
            S_binary = "1".repeat(32 - S_binary.length) + S_binary
        }

        let A_truths = []
        for (let i = 0; i < S_binary.length; i++) {
            A_truths.push((S_binary[i] === "1"))
        }
        for (let i = 0; i < N_truthsLength - S_binary.length; i++) {
            A_truths.unshift(false)
        }
        return A_truths
    },

    toPositiveDeciId(N_decimal) {
        return (N_decimal >= 0) ? N_decimal : (-N_decimal ^ parseInt("1".repeat(N_decimal.toString(2).length), 2)) + 1
    },

    and: (d1, d2) => d1 & d2,
    nand: (d1, d2) => !(d1 & d2),
    or: (d1, d2) => d1 | d2,
    nor: (d1, d2) => !(d1 | d2),
    xnor: (d1, d2) => d1 === d2,
    nor: (d1, d2) => d1 !== d2
}

function getTruths1(operation, N_values) {
    let A_truths = []
    if (N_values <= 5) A_truths.push(operation(...bitNumb[N_values]))
    else {
        for (let N_resultsIdx = 0; N_resultsIdx < 2 ** (N_values - 5); N_resultsIdx++) {
            let A_calculationSet = []
            const S_setIdxBinary = N_resultsIdx.toString(2)
            for (let ii = 0; ii < N_values - 5; ii++) {
                if (S_setIdxBinary[ii] === "1") A_calculationSet.push(bitNumb.true)
                else if (S_setIdxBinary[ii] === "0") A_calculationSet.push(bitNumb.false)
                else A_calculationSet.unshift(bitNumb.false)
            }
            A_truths.push(operation(...A_calculationSet, ...bitNumb[5]))
        }
    }

    return A_truths
}

const A_re = getTruths1((a, b) => (a & b), 2)
console.log(A_re.length)

// const operatorInfoPreset = {
//     and: { operation: (a, b) => a && b, reversed: "nand", priority: 4, string: "&&", list: ["and", "&&"] },
//     nand: { operation: (a, b) => !(a && b), reversed: "and", priority: 5, string: "!&", list: ["nand", "!&", "~&"] },
//     or: { operation: (a, b) => a || b, reversed: "nor", priority: 3, string: "||", list: ["or", "||"] },
//     nor: { operation: (a, b) => !(a || b), reversed: "or", priority: 5, string: "!|", list: ["nor", "!|", "~|"] },
//     xnor: { operation: (a, b) => a === b, reversed: "xor", priority: 5, string: "===", list: ["xnor", "==="] },
//     xor: { operation: (a, b) => a !== b, reversed: "xnor", priority: 5, string: "!==", list: ["xor", "!=="] },
//     lt: { operation: (a, b) => a < b, reversed: "ge", priority: 6, string: "<", list: ["lt", "<"] },
//     le: { operation: (a, b) => a <= b, reversed: "gt", priority: 6, string: "<=", list: ["le", "<="] },
//     gt: { operation: (a, b) => a > b, reversed: "le", priority: 6, string: ">", list: ["gt", ">"] },
//     ge: { operation: (a, b) => a >= b, reversed: "lt", priority: 6, string: ">=", list: ["ge", ">="] },
//     eq: { operation: (a, b) => a == b, reversed: "ne", priority: 6, string: "==", list: ["eq", "=="] },
//     ne: { operation: (a, b) => a != b, reversed: "eq", priority: 6, string: "!=", list: ["ne", "!="] },
//     buffer: { operation: (a, b) => b, reversed: "not", priority: 7, string: "buffer", list: ["buffer", "buff"] },
//     not: { operation: (a, b) => !b, reversed: "buffer", priority: 7, string: "!", list: ["not", "!", "~"] }
// }

// class Evaluator {
//     constructor(option) {
//         this.info = option?.info || operatorInfoPreset
//         if (option?.override)
//             for (let S_operator in option.override) {
//                 this.info[S_operator] = {
//                     operation: option.override[S_operator].operation || this.info[S_operator].operation,
//                     reversed: option.override[S_operator].reversed || this.info[S_operator].reversed,
//                     priority: option.override[S_operator].priority || this.info[S_operator].priority,
//                     string: option.override[S_operator].string || this.info[S_operator].string,
//                     list: option.override[S_operator].list || this.info[S_operator].list
//                 }
//             }
//         if (option?.disable)
//             for (let i = 0; i < option.disable.length; i++) {
//                 delete this.info[option.disable[i]]
//             }

//         this.isDisabled = (S_operator) => this.info[S_operator] !== undefined
//     }

//     getInfo(S_operator) {
//         let S_integrated
//         for (let S_operatorFromList in this.info) {
//             if (this.info[S_operatorFromList].list.includes(S_operator)) {
//                 S_integrated = S_operatorFromList
//                 break
//             }
//         }
//         if (S_integrated) return { integrated: S_integrated, ...this.info[S_integrated] }
//         else throw new Error(`'${S_operator}' is not on the operator info list.`)
//     }

//     evaluate(BNS_val1, S_operator, BNS_val2) {
//         let S_val1, S_val2
//         try {
//             S_val1 = BNS_val1.toString(), S_val2 = BNS_val2.toString()
//             if (S_val1 === "[object Object]" || BNS_val1.constructor.name === "Array") S_val1 = JSON.stringify(BNS_val1)
//             if (S_val2 === "[object Object]" || BNS_val2.constructor.name === "Array") S_val2 = JSON.stringify(BNS_val2)
//             if (S_val1.length > 25) S_val1 = S_val1.slice(0, 20) + " ..."
//             if (S_val2.length > 25) S_val2 = S_val2.slice(0, 20) + " ..."
//         } catch { }
//         const A_allowedTypes = ["boolean", "decimal", "string", "bigint"]

//         if (BNS_val1 === undefined || BNS_val2 === undefined)
//             throw new Error(`Not enough arguments. There should be 3 arguments ('leftElmnt', 'operator', 'rightElmnt').`)
//         if (A_allowedTypes.includes(typeof BNS_val1) === false)
//             throw new Error(`Value '${S_val1}' is not allowed as an argument, because its type is '${typeof BNS_val1}'`)
//         if (A_allowedTypes.includes(typeof BNS_val2) === false)
//             throw new Error(`Value '${S_val2}' is not allowed as an argument, because its type is '${typeof BNS_val2}'`)

//         return this.getInfo(S_operator).operation(BNS_val1, BNS_val2)
//     }

//     getMaxTruthNumb(N_variables) {
//         let N_accumulated = BigInt(1)
//         for (let i = 0; i < N_variables + 1; i++) {
//             N_accumulated *= BigInt(2)
//         }
//         return N_accumulated - BigInt(1)
//     }

//     build(N_variables, option) {
//         let A_variables = []
//         for (let i = 0; i < N_variables; i++) {
//             const S_varName = (option && (option.names || option.nameBase)) ?
//                 option.names[i] || option.nameBase + (i + 1) : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i]
//             A_variables.push(new Expression({
//                 varIdx: i, varTotal: N_variables, name: S_varName,
//                 info: option?.info || this.info, override: option?.override, disable: option?.disable
//             }))
//         }
//         A_variables.push(A_variables[0].not)
//         A_variables.push(A_variables[0].buffer)
//         return A_variables
//     }
// }

// class Expression extends Evaluator {
//     constructor(option) {
//         super(option)
//         if (option.operator) {
//             this.operator = option.operator
//             this.children = option.children
//         }
//         else {
//             this.varIdx = option.varIdx
//             this.name = option.name || "VAR" + (this.varIdx + 1)
//         }

//         this.varTotal = option.varTotal
//         this.isVar = this.varIdx !== undefined
//         this.isExpr = this.operator !== undefined

//         this.g = this._generate
//         for (let S_operatorFromList in this.info) {
//             this[S_operatorFromList] = (valOrExpr) => this.g(S_operatorFromList, valOrExpr)
//         }
//     }

//     _generate(S_operator, rightElmnt) {
//         if (rightElmnt === undefined)
//             throw new Error("Received 'undefined' as a right hand element. Expecting a value or an expression")
//         if (typeof rightElmnt === "function")
//             throw new Error("Received function as a right hand element. Expecting a value or an expression." + "\n" +
//                 "       This error is often seen when more variable-Objects are used than those created by the 'Evaluator.build' method.")
//         else return new Expression({ operator: this.getInfo(S_operator).integrated, children: [this, rightElmnt], varTotal: this.varTotal, info: this.info })
//     }

//     run(...A_values) {
//         if (A_values.length !== this.varTotal) throw new Error(`Wrong decimal of arguments. There should be ${this.varTotal} arguments.`)

//         if (this.isExpr) {
//             const elmntL = this.children[0], elmntR = this.children[1]

//             let BNS_left
//             if (elmntL.isExpr) BNS_left = elmntL.run(...A_values)
//             else if (elmntL.isVar) BNS_left = A_values[elmntL.varIdx]
//             else BNS_left = elmntL

//             let BNS_right
//             if (elmntR?.isExpr) BNS_right = elmntR.run(...A_values)
//             else if (elmntR?.isVar) BNS_right = A_values[elmntR.varIdx]
//             else BNS_right = elmntR

//             return this.evaluate(BNS_left, this.operator, BNS_right)
//         }
//         else return A_values[this.varIdx]
//     }

//     _isTruthable() {
//         if (this.isExpr) {
//             if (["lt", "le", "gt", "ge"].includes(this.operator)) return true
//             const leftElmnt = this.children[0], rightElmnt = this.children[1]
//             return ((leftElmnt.isExpr) ? leftElmnt._isTruthable() : false) || ((rightElmnt.isExpr) ? rightElmnt._isTruthable() : false)
//         }
//         else {
//             return false
//         }
//     }

//     getTruths() {
//         if (this._isTruthable())
//             throw new Error("This method is not usable for expressions that includes comparison operators.")
//         if (this.truth)
//             return this.truth
//         else {
//             let truth = { table: [], decimal: BigInt(0) }
//             let N_currentDecimal = BigInt(1)
//             for (let i = 0; i < Math.pow(2, this.varTotal); i++) {
//                 let A_arguments = Array(this.varTotal).fill(false)
//                 const S_trueOrFalse = i.toString(2)
//                 for (let ii = 0; ii < S_trueOrFalse.length; ii++) {
//                     if (S_trueOrFalse[S_trueOrFalse.length - 1 - ii] === "1") A_arguments[ii] = true
//                 }
//                 truth.table.push({ value: A_arguments, result: this.run(...A_arguments) })
//                 if (this.run(...A_arguments)) truth.decimal += N_currentDecimal
//                 N_currentDecimal *= BigInt(2)
//             }
//             this.truth = truth
//             return truth
//         }
//     }

//     isSameWith(rightElmnt) {
//         const leftElmnt = this
//         if (rightElmnt === true) return leftElmnt.getTruths().decimal === this.getMaxTruthNumb(this.varTotal)
//         else if (rightElmnt === false) return leftElmnt.getTruths().decimal === BigInt(0)
//         else if (leftElmnt.isVar && rightElmnt.isVar) return leftElmnt.varIdx === rightElmnt.varIdx
//         else if (rightElmnt.isExpr || rightElmnt.isVar) return leftElmnt.getTruths().decimal === rightElmnt.getTruths().decimal
//         else throw new Error("Only an expression-Object, variable-Object, true, or false is allowed as an argument.")
//     }

//     summarize() {
//         if (this.isExpr === false) return this
//         else if (this.operator === "buffer") {
//             const containedElmnt = this.children[1]
//             if (containedElmnt.isExpr === false) return containedElmnt
//             else return containedElmnt.summarize()
//         }
//         else if (this.operator === "not") {
//             const containedElmnt = this.children[1]
//             if (containedElmnt.isExpr === false) return this
//             else if (this.isDisabled(this.getInfo(containedElmnt.operator).reversed))
//                 return containedElmnt.children[0][this.getInfo(containedElmnt.operator).reversed](containedElmnt.children[1]).summarize()
//             else return this.not(containedElmnt.summarize())
//         }
//         else {
//             const leftElmnt = this.children[0], rightElmnt = this.children[1]
//             if (this.isSameWith(true)) return true
//             else if (this.isSameWith(false)) return false
//             else if (this.isSameWith(leftElmnt)) return leftElmnt.summarize()
//             else if (this.isSameWith(rightElmnt)) return rightElmnt.summarize()
//             else if (this.isDisabled("not") === false && this.isSameWith(this.not(leftElmnt))) return this.not(leftElmnt).summarize()
//             else if (this.isDisabled("not") === false && this.isSameWith(this.not(rightElmnt))) return this.not(rightElmnt).summarize()
//             else return leftElmnt.summarize()[this.operator](rightElmnt.summarize())
//         }
//     }

//     toString(option) {
//         if (this.isExpr) {
//             const S_operator = (option && option[this.operator]) ? option[this.operator] : this.getInfo(this.operator).string
//             const leftElmnt = this.children[0], rightElmnt = this.children[1]
//             if (this.operator === "buffer" || this.operator === "not")
//                 return `${S_operator}(${rightElmnt.toString(option)})`
//             else if (leftElmnt.isExpr && this.getInfo(leftElmnt.operator).priority < this.getInfo(this.operator).priority)
//                 return `(${leftElmnt.toString(option)}) ${S_operator} ${rightElmnt.toString(option)}`
//             else if (rightElmnt.isExpr && this.getInfo(this.operator).priority > this.getInfo(rightElmnt.operator).priority)
//                 return `${leftElmnt.toString(option)} ${S_operator} (${rightElmnt.toString(option)})`
//             else
//                 return `${leftElmnt.toString(option)} ${S_operator} ${rightElmnt.toString(option)}`
//         }
//         else {
//             const S_name = (option && option[this.varIdx + 1]) ? option[this.varIdx + 1] : this.name
//             if (typeof S_name === "string") return S_name
//             else throw new Error("All variable-Objects should be name in string type.")
//         }
//     }
// }

// // test
// const evaluator = new Evaluator()
// const [A, B, C, D, not, buff] = evaluator.build(4)
// const target = A.or(B).or(C.and(B.or(D).or(B.or(D))))
// console.log("!  " + target.toString())


// const A_op = ["and", "or"]
// const A_var = [A, B, C, D, not(A), not(B), not(C), not(D)]
// let N_var1 = 0, N_var2 = 0, N_var3 = 0, N_var4 = 0, N_op1 = 0, N_op2 = 0, N_op3 = 0
// while (true) {
//     const compare = A_var[N_var1][A_op[N_op1]](A_var[N_var2])[A_op[N_op2]](A_var[N_var3][A_op[N_op3]](A_var[N_var4]))
//     // (VAR? OP? VAR?) OP? (VAR? OP? VAR?)
//     if (target.isSameWith(compare)) {
//         console.log(compare.toString())
//         break
//     }

//     N_op3++
//     if (N_op3 === 2) N_op3 = 0, N_op2++
//     if (N_op2 === 2) N_op2 = 0, N_op1++
//     if (N_op1 === 2) N_op1 = 0, N_var4++
//     if (N_var4 === 8) N_var4 = 0, N_var3++
//     if (N_var3 === 8) N_var3 = 0, N_var2++
//     if (N_var2 === 8) N_var2 = 0, N_var1++
//     if (N_var1 === 8) break

// }