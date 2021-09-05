let N_expression = 0

class Evaluator {
    getRepresentingSign(S_operator) {
        switch (S_operator) {
            case "and": case "&&": return "and"
            case "nand": case "!&": case "~&": return "nand"
            case "or": case "||": return "or"
            case "nor": case "!|": case "~|": return "nor"
            case "xor": case "!==": return "xor"
            case "xnor": case "===": return "xnor"
            case "lt": case "<": return "lt"
            case "le": case "<=": return "le"
            case "gt": case ">": return "gt"
            case "ge": case ">=": return "ge"
            case "eq": case "==": return "eq"
            case "ne": case "!=": return "ne"
            case "not": case "!": case "~": return "not"
            default: return S_operator
        }
    }

    evaluate(BNS_val1, S_operator, BNS_val2) {
        let S_val1, S_val2
        try {
            S_val1 = BNS_val1.toString(), S_val2 = BNS_val2.toString()
            if (S_val1 === "[object Object]" || BNS_val1.constructor.name === "Array") S_val1 = JSON.stringify(BNS_val1)
            if (S_val2 === "[object Object]" || BNS_val2.constructor.name === "Array") S_val2 = JSON.stringify(BNS_val2)
            if (S_val1.length > 25) S_val1 = S_val1.slice(0, 20) + " ..."
            if (S_val2.length > 25) S_val2 = S_val2.slice(0, 20) + " ..."
        } catch { }
        const A_allowedTypes = ["boolean", "number", "string", "bigint"]

        if (BNS_val1 === undefined || BNS_val2 === undefined)
            throw new Error(`Not enough arguments. There should be 3 arguments ('leftElmnt', 'operator', 'rightElmnt').`)
        if (A_allowedTypes.includes(typeof BNS_val1) === false)
            throw new Error(`Value '${S_val1}' is not allowed as an argument, because its type is '${typeof BNS_val1}'`)
        if (A_allowedTypes.includes(typeof BNS_val2) === false)
            throw new Error(`Value '${S_val2}' is not allowed as an argument, because its type is '${typeof BNS_val2}'`)

        switch (this.getRepresentingSign(S_operator)) {
            case "and": return BNS_val1 && BNS_val2
            case "nand": return !(BNS_val1 && BNS_val2)
            case "or": return BNS_val1 || BNS_val2
            case "nor": return !(BNS_val1 || BNS_val2)
            case "xor": return BNS_val1 !== BNS_val2
            case "xnor": return BNS_val1 === BNS_val2
            case "lt": return BNS_val1 < BNS_val2
            case "le": return BNS_val1 <= BNS_val2
            case "gt": return BNS_val1 > BNS_val2
            case "ge": return BNS_val1 >= BNS_val2
            case "eq": return BNS_val1 == BNS_val2
            case "ne": return BNS_val1 != BNS_val2
            case "not": return !BNS_val2
            default: throw new Error(`'${S_operator}' is not on the operator list.`)
        }
    }

    build(N_variableTotal) {
        let A_variables = []
        for (let i = 0; i < N_variableTotal; i++) {
            A_variables.push(new Expression(i, N_variableTotal))
        }
        return A_variables
    }
}

class Expression extends Evaluator {
    constructor(argument1, argument2, argument3) {
        super()
        if (typeof argument1 === "number") {
            this.isVar = true
            this.isExpr = false
            this.varId = argument1
            this.varTotal = argument2
        }
        else {
            this.isExpr = true
            this.isVar = false
            this.operator = argument1
            this.children = argument2
            this.varTotal = argument3
        }

        this.g = this._generate
        this.and = (valOrExpr) => this.g("and", valOrExpr)
        this.nand = (valOrExpr) => this.g("nand", valOrExpr)
        this.or = (valOrExpr) => this.g("or", valOrExpr)
        this.nor = (valOrExpr) => this.g("nor", valOrExpr)
        this.xor = (valOrExpr) => this.g("xor", valOrExpr)
        this.xnor = (valOrExpr) => this.g("xnor", valOrExpr)
        this.lt = (valOrExpr) => this.g("lt", valOrExpr)
        this.le = (valOrExpr) => this.g("le", valOrExpr)
        this.gt = (valOrExpr) => this.g("gt", valOrExpr)
        this.ge = (valOrExpr) => this.g("ge", valOrExpr)
        this.eq = (valOrExpr) => this.g("eq", valOrExpr)
        this.ne = (valOrExpr) => this.g("ne", valOrExpr)
        this.not = (valOrExpr) => this.g("not", valOrExpr)
    }

    _generate(S_operator, rightElmnt) {
        if (rightElmnt === undefined)
            throw new Error("Got undefined as a right hand element. Expecting a value or an expression")

        return new Expression(this.getRepresentingSign(S_operator), [this, rightElmnt], this.varTotal)
    }

    run() {
        if (arguments.length !== this.varTotal) throw new Error(`Wrong number of arguments. There should be ${this.varTotal} arguments.`)

        if (this.isExpr) {
            const elmntL = this.children[0], elmntR = this.children[1]

            let BNS_left
            if (elmntL.isExpr) BNS_left = elmntL.run(...arguments)
            else if (elmntL.isVar) BNS_left = arguments[elmntL.varId]
            else BNS_left = elmntL

            let BNS_right
            if (elmntR.isExpr) BNS_right = elmntR.run(...arguments)
            else if (elmntR.isVar) BNS_right = arguments[elmntR.varId]
            else BNS_right = elmntR

            return this.evaluate(BNS_left, this.operator, BNS_right)
        }
        else return arguments[this.varId]
    }

    getTruth() {
        let truth = { table: [], number: BigInt(0) }
        let N_truthNumber = BigInt(1)
        for (let i = 0; i < Math.pow(2, this.varTotal); i++) {
            let A_arguments = Array(this.varTotal).fill(false)
            let S_trueOrFalse = i.toString(2)
            for (let ii = 0; ii < S_trueOrFalse.length; ii++) {
                if (S_trueOrFalse[S_trueOrFalse.length - 1 - ii] === "1") A_arguments[ii] = true
            }

            truth.table.push({ value: A_arguments, result: this.run(...A_arguments) })
            if (this.run(...A_arguments)) truth.number += N_truthNumber

            N_truthNumber *= BigInt(2)
        }

        return truth
    }
}


// test
// const evaluator = new Evaluator()
// const [VAR1, VAR2, VAR3] = evaluator.build(3)
// console.log(VAR1.or(VAR3).and(VAR1.or(VAR2)).getTruth().table)
