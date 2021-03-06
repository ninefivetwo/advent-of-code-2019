import { expect } from 'chai'
import readline from 'readline'
import sinon from 'sinon'

import { opLength } from './constants'
import Computer from './computer'

describe('Computer Class', function() {
    let stubs
    let computer

    before(function() {
        stubs = []
    })

    beforeEach(function() {
        computer = new Computer()
    })

    afterEach(function() {
        while (stubs.length !== 0) {
            const stub = stubs.shift()
            stub.restore()
        }
    })

    describe('Constructor', function() {
        it('Sets name for the computer', function() {
            const name = 'con-name'
            const comp = new Computer(name)
            const compName = comp.name
            expect(compName).to.equal(name)
        })
    })

    describe('opcode', function() {
        it('Returns the opcode in first element of the array', function() {
            computer.program = [2]
            const code = computer.opcode()
            const op = code[0]
            expect(op).to.equal(2)
        })

        it('Sets default value of 0 for param1 in second element of the array', function() {
            computer.program = [2]
            const code = computer.opcode()
            const param1 = code[1]
            expect(param1).to.equal(0)
        })

        it('Sets default value of 0 for param2 in third element of the array', function() {
            computer.program = [2]
            const code = computer.opcode()
            const param2 = code[2]
            expect(param2).to.equal(0)
        })

        it('Sets default value of 0 for param3 in fourth element of the array', function() {
            computer.program = [2]
            const code = computer.opcode()
            const param3 = code[3]
            expect(param3).to.equal(0)
        })
    })

    describe('getAddress', function() {
        it('Get address with position mode', function() {
            const position = computer.getAddress(2, 0)
            expect(position).to.equal(2)
        })

        it('Get address with relative mode', function() {
            computer.relativeBase = 21
            const position = computer.getAddress(2, 2)
            expect(position).to.equal(23)
        })
    })

    describe('getValue', function() {
        it('Gets value with position mode', function() {
            computer.program = [1, 2, 38, 12]
            const value = computer.getValue(2, 0)
            expect(value).to.equal(38)
        })

        it('Sets undefined memory to 0 when position mode', function() {
            computer.program = []
            computer.getValue(2, 0)
            const value = computer.program[2]
            expect(value).to.equal(0)
        })

        it('Handle value outside of memory in position mode', function() {
            computer.program = []
            const value = computer.getValue(2, 0)
            expect(value).to.equal(0)
        })

        it('Gets value with immediate mode', function() {
            computer.program = [1, 2, 38, 12]
            const value = computer.getValue(2, 1)
            expect(value).to.equal(2)
        })

        it('Gets value with relative mode', function() {
            computer.relativeBase = 1
            computer.program = [1, 2, 38, 12]
            const value = computer.getValue(2, 2)
            expect(value).to.equal(12)
        })

        it('Sets undefined memory to 0 when in relative mode', function() {
            computer.program = []
            computer.relativeBase = 100
            computer.getValue(2, 2)
            const value = computer.program[102]
            expect(value).to.equal(0)
        })

        it('Handle value outside of memory in relative mode', function() {
            computer.program = []
            computer.relativeBase = 100
            const value = computer.getValue(2, 2)
            expect(value).to.equal(0)
        })
    })

    describe('next', function() {
        it('Increments the pointer based on the argument provided', function() {
            const initialPointer = computer.pointer
            const length = 2
            computer.next(length)
            const pointer = computer.pointer
            expect(initialPointer).to.equal(0)
            expect(pointer).to.equal(length)
        })
    })

    describe('addOp', function() {
        it('Adds two values together', function() {
            computer.program = [1101, 4, 5, 6, 8, 10, 0]
            computer.addOp(1, 1)
            const destValue = computer.program[6]
            expect(destValue).to.equal(9)
        })

        it('Returns instruction length of 4', function() {
            computer.program = [1, 4, 5, 6, 8, 10, 0]
            const length = computer.addOp(0, 0)
            expect(length).to.equal(opLength.add)
        })

        it('Sample test 1: 1,9,10,3', function() {
            computer.program = [1, 9, 10, 3, 2, 3, 11, 0, 99, 30, 40, 50]
            computer.addOp()
            const endProgram = [1, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]
            expect(computer.program).to.have.members(endProgram)
        })
    })

    describe('multiplyOp', function() {
        it('Multiplies two values together', function() {
            computer.program = [1102, 4, 5, 6, 6, 10, 0]
            computer.multiplyOp(1, 1)
            const destValue = computer.program[6]
            expect(destValue).to.equal(20)
        })

        it('Returns instruction length of 4', function() {
            computer.program = [1, 4, 5, 6, 6, 10, 0]
            const length = computer.multiplyOp(0, 0)
            expect(length).to.equal(opLength.multiply)
        })

        it('Sample test 1: 2,3,11,0', function() {
            computer.program = [1, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]
            computer.pointer = 4
            computer.multiplyOp()
            const endProgram = [3500, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]
            expect(computer.program).to.have.members(endProgram)
        })

        it('Sample test 2: 1002,4,3,4,33', function() {
            computer.program = [1002, 4, 3, 4, 33]
            computer.multiplyOp(0, 1)
            const endProgram = [1002, 4, 3, 4, 99]
            expect(computer.program).to.have.members(endProgram)
        })
    })

    describe('inputOp', function() {
        it('Prints out `input: ` asking for user input', async function() {
            let print
            let input = 99
            const readlineStub = sinon
                .stub(readline, 'createInterface')
                .callsFake(() => ({
                    question: (question, callback) => {
                        print = question
                        callback(input)
                    },
                    close: () => {},
                }))
            stubs.push(readlineStub)

            computer.program = [3, 2, 0]
            await computer.inputOp()
            expect(print).to.equal('input: ')
        })

        it('Places the input into destination', async function() {
            let input = 99
            const readlineStub = sinon
                .stub(readline, 'createInterface')
                .callsFake(() => ({
                    question: (question, callback) => {
                        callback(input)
                    },
                    close: () => {},
                }))
            stubs.push(readlineStub)

            computer.program = [3, 2, 0]
            await computer.inputOp()
            const destValue = computer.program[2]
            expect(destValue).to.equal(input)
        })

        it('Returns undefined when loop is true and input array is empty', async function() {
            computer.program = [3, 2, 0]
            computer.loop = true
            const length = await computer.inputOp()
            expect(length).to.be.undefined
        })

        it('Does not use readline question when input array is not empty', async function() {
            let callCount = 0
            const readlineStub = sinon
                .stub(readline, 'createInterface')
                .callsFake(() => ({
                    question: (question, callback) => {
                        callCount += 1
                        callback()
                    },
                    close: () => {},
                }))
            stubs.push(readlineStub)

            computer.input = [1]
            computer.program = [3, 2, 0]
            await computer.inputOp()
            expect(callCount).to.equal(0)
        })

        it('Sets the first element in input array and in destination when input array is not empty', async function() {
            const input = 1
            computer.input = [input]
            computer.program = [3, 2, 0]
            await computer.inputOp()
            const destValue = computer.program[2]
            expect(destValue).to.equal(input)
        })

        it('Removes first element in input array when input array is not empty', async function() {
            const input = 1
            computer.input = [input]
            computer.program = [3, 2, 0]
            await computer.inputOp()
            expect(computer.input).to.be.empty
        })

        it('Returns instruction length of 2', async function() {
            const readlineStub = sinon
                .stub(readline, 'createInterface')
                .callsFake(() => ({
                    question: (question, callback) => {
                        callback()
                    },
                    close: () => {},
                }))
            stubs.push(readlineStub)

            computer.program = [3, 2, 0]
            const length = await computer.inputOp()
            expect(length).to.equal(opLength.input)
        })
    })

    describe('outputOp', function() {
        it('Prints out the value', function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            const position = 2
            computer.program = [104, position, 0]
            computer.outputOp(1)
            expect(consoleStub.calledOnceWith(position)).to.be.true
        })

        it('Does not output if logging is set to false', function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            const position = 2
            computer.program = [104, position, 0]
            computer.logging = false
            computer.outputOp(1)
            expect(consoleStub.calledOnce).to.be.false
        })

        it('Adds output to next computer`s input', function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            const position = 2
            computer.program = [104, position, 0]
            computer.outputComputer = { input: [] }
            computer.outputOp(1)
            const input = computer.outputComputer.input[0]
            expect(input).to.equal(position)
        })

        it('Adds output to output array', function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            const position = 2
            computer.program = [104, position, 0]
            computer.outputOp(1)
            const output = computer.output[0]
            expect(output).to.equal(position)
        })

        it('Returns instruction length of 2', async function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            computer.program = [4, 2, 0]
            const length = computer.outputOp()
            expect(length).to.equal(opLength.output)
        })
    })

    describe('jumpTrueOp', function() {
        it('Jumps the pointer to the value when not zero', function() {
            computer.program = [1105, 3, 4, 3, 10]
            computer.jumpTrueOp(1, 1)
            const pointer = computer.pointer
            expect(pointer).to.equal(4)
        })

        it('Does not jump the pointer to the value when zero', function() {
            computer.program = [0, 0, 4, 3, 10]
            computer.pointer = -1
            computer.jumpTrueOp(1, 1)
            const pointer = computer.pointer
            expect(pointer).to.equal(-1)
        })

        it('Returns instruction length of 0 when true', function() {
            computer.program = [5, 3, 4, 3, 10]
            const length = computer.jumpTrueOp(0, 0)
            expect(length).to.equal(0)
        })

        it('Returns instruction length of 3 when false', function() {
            computer.program = [0, 0, 4, 3, 10]
            const length = computer.jumpTrueOp(0, 0)
            expect(length).to.equal(opLength.jumpTrue)
        })
    })

    describe('jumpFalseOp', function() {
        it('Jumps the pointer to the value when zero', function() {
            computer.program = [0, 0, 4, 3, 10]
            computer.jumpFalseOp(1, 1)
            const pointer = computer.pointer
            expect(pointer).to.equal(4)
        })

        it('Does not jump the pointer to the value when not zero', function() {
            computer.program = [1106, 3, 4, 3, 10]
            computer.pointer = -1
            computer.jumpFalseOp(1, 1)
            const pointer = computer.pointer
            expect(pointer).to.equal(-1)
        })

        it('Returns instruction length of 0 when true', function() {
            computer.program = [0, 0, 4, 3, 10]
            const length = computer.jumpFalseOp(0, 0)
            expect(length).to.equal(0)
        })

        it('Returns instruction length of 3 when false', function() {
            computer.program = [5, 3, 4, 3, 10]
            const length = computer.jumpFalseOp(0, 0)
            expect(length).to.equal(opLength.jumpFalse)
        })
    })

    describe('lessThanOp', function() {
        it('When the first value is less than the second value', function() {
            computer.program = [117, 4, 5, 6, 3, 10, 0]
            computer.lessThanOp(1, 1)
            const destValue = computer.program[6]
            expect(destValue).to.equal(1)
        })

        it('When the first value is not less than the second value', function() {
            computer.program = [1107, 5, 4, 6, 3, 10, 0]
            computer.lessThanOp(1, 1)
            const destValue = computer.program[6]
            expect(destValue).to.equal(0)
        })

        it('Returns instruction length of 4', function() {
            computer.program = [1107, 4, 5, 6, 3, 10, 0]
            const length = computer.lessThanOp(0, 0)
            expect(length).to.equal(opLength.lessThan)
        })
    })

    describe('equalOp', function() {
        it('When the first value is equal to the second value', function() {
            computer.program = [1108, 4, 4, 6, 4, 4, 0]
            computer.equalOp(1, 1)
            const destValue = computer.program[6]
            expect(destValue).to.equal(1)
        })

        it('When the first value is not equal to the second value', function() {
            computer.program = [1108, 5, 4, 6, 3, 10, 0]
            computer.equalOp(1, 1)
            const destValue = computer.program[6]
            expect(destValue).to.equal(0)
        })

        it('Returns instruction length of 4', function() {
            computer.program = [8, 4, 5, 6, 3, 10, 0]
            const length = computer.equalOp(0, 0)
            expect(length).to.equal(opLength.equal)
        })
    })

    describe('adjustRelativeOp', function() {
        it('Offsets the relative base with value', function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            const position = -2
            computer.relativeBase = 23
            computer.program = [109, position, 0]
            computer.adjustRelativeOp(1)
            expect(computer.relativeBase).to.equal(21)
        })

        it('Returns instruction length of 2', async function() {
            const consoleStub = sinon.stub(console, 'log')
            stubs.push(consoleStub)

            computer.program = [9, 2, 0]
            const length = computer.adjustRelativeOp()
            expect(length).to.equal(opLength.output)
        })
    })

    describe('endOp', function() {
        it('Sets end to true', function() {
            computer.program = [99]
            const initialEnd = computer.end
            computer.endOp()
            const end = computer.end
            expect(initialEnd).to.be.false
            expect(end).to.be.true
        })

        it('Returns instruction length of 1', function() {
            computer.program = [99]
            const length = computer.endOp()
            expect(length).to.equal(opLength.end)
        })
    })

    describe('execute', function() {
        it('Calls addOp when opcode is 1', async function() {
            const addStub = sinon.stub(computer, 'addOp')
            stubs.push(addStub)

            computer.program = [1]
            await computer.execute()
            expect(addStub.calledOnce).to.be.true
        })

        it('Calls multiplyOp when opcode is 2', async function() {
            const multiplyStub = sinon.stub(computer, 'multiplyOp')
            stubs.push(multiplyStub)

            computer.program = [2]
            await computer.execute()
            expect(multiplyStub.calledOnce).to.be.true
        })

        it('Calls inputOp when opcode is 3', async function() {
            const inputStub = sinon.stub(computer, 'inputOp')
            stubs.push(inputStub)

            computer.program = [3]
            await computer.execute()
            expect(inputStub.calledOnce).to.be.true
        })

        it('Calls outputOp when opcode is 4', async function() {
            const outputStub = sinon.stub(computer, 'outputOp')
            stubs.push(outputStub)

            computer.program = [4]
            await computer.execute()
            expect(outputStub.calledOnce).to.be.true
        })

        it('Calls jumpTrueOp when opcode is 5', async function() {
            const jumpTrueStub = sinon.stub(computer, 'jumpTrueOp')
            stubs.push(jumpTrueStub)

            computer.program = [5]
            await computer.execute()
            expect(jumpTrueStub.calledOnce).to.be.true
        })

        it('Calls jumpFalseOp when opcode is 6', async function() {
            const jumpFalseStub = sinon.stub(computer, 'jumpFalseOp')
            stubs.push(jumpFalseStub)

            computer.program = [6]
            await computer.execute()
            expect(jumpFalseStub.calledOnce).to.be.true
        })

        it('Calls lessThanOp when opcode is 7', async function() {
            const lessThanStub = sinon.stub(computer, 'lessThanOp')
            stubs.push(lessThanStub)

            computer.program = [7]
            await computer.execute()
            expect(lessThanStub.calledOnce).to.be.true
        })

        it('Calls equalOp when opcode is 8', async function() {
            const equalStub = sinon.stub(computer, 'equalOp')
            stubs.push(equalStub)

            computer.program = [8]
            await computer.execute()
            expect(equalStub.calledOnce).to.be.true
        })

        it('Calls adjustRelativeOp when opcode is 9', async function() {
            const adjustStub = sinon.stub(computer, 'adjustRelativeOp')
            stubs.push(adjustStub)

            computer.program = [9]
            await computer.execute()
            expect(adjustStub.calledOnce).to.be.true
        })

        it('Calls endOp when opcode is 99', async function() {
            const endStub = sinon.stub(computer, 'endOp')
            stubs.push(endStub)

            computer.program = [99]
            await computer.execute()
            expect(endStub.calledOnce).to.be.true
        })

        it('Calls next', async function() {
            const nextStub = sinon.stub(computer, 'next')
            stubs.push(nextStub)

            computer.program = [0]
            await computer.execute()
            expect(nextStub.calledOnce).to.be.true
        })

        it('Does not call next when length is undefined', async function() {
            const nextStub = sinon.stub(computer, 'next')
            stubs.push(nextStub)

            computer.end = true
            computer.loop = true
            computer.program = [3, 1]
            await computer.execute()
            expect(nextStub.calledOnce).to.be.false
        })
    })

    describe('run', function() {
        it('Save provided argument into program', async function() {
            computer.end = true
            const inputProgram = [1, 2, 3]
            await computer.run(inputProgram)
            const program = computer.program
            expect(program).to.have.ordered.members(inputProgram)
        })

        it('Sets logging to false when provided in the options', async function() {
            computer.end = true
            const inputProgram = [1, 2, 3]
            const logBefore = computer.logging
            await computer.run(inputProgram, [], { logging: false })
            const logAfter = computer.logging
            expect(logBefore).to.be.true
            expect(logAfter).to.be.false
        })

        it('Sets loop to true when provided in the options', async function() {
            computer.end = true
            const inputProgram = [1, 2, 3]
            const loopBefore = computer.loop
            await computer.run(inputProgram, [], { loop: true })
            const loopAfter = computer.loop
            expect(loopBefore).to.be.false
            expect(loopAfter).to.be.true
        })

        it('Flags the outputComputer that the input stream is closed', async function() {
            computer.end = true
            computer.outputComputer = {}
            await computer.run([99])
            const inputClosed = computer.outputComputer.inputClosed
            expect(inputClosed).to.be.true
        })

        it('Returns output array', async function() {
            computer.end = true
            const output = [3, 2, 1]
            computer.output = output
            const runOutput = await computer.run([99])
            expect(runOutput).to.have.ordered.members(output)
        })

        it('Finishes when it end is true', async function() {
            let callCount = 0
            const executeStub = sinon
                .stub(computer, 'execute')
                .callsFake(() => {
                    callCount += 1
                    if (callCount >= 5) {
                        computer.end = true
                    }
                })
            stubs.push(executeStub)

            const program = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            const initialEnd = computer.end
            await computer.run(program)
            const end = computer.end
            expect(callCount).to.equal(5)
            expect(initialEnd).to.be.false
            expect(end).to.be.true
        })

        it('Sample test 1: Outputs the program', async function() {
            const program = [
                109,
                1,
                204,
                -1,
                1001,
                100,
                1,
                100,
                1008,
                100,
                16,
                101,
                1006,
                101,
                0,
                99,
            ]
            const output = await computer.run(program, [], { logging: false })
            expect(output).to.have.ordered.members(program)
        })

        it('Sample test 2: Outputs 16-digit number', async function() {
            const program = [1102, 34915192, 34915192, 7, 4, 7, 99, 0]
            const output = await computer.run(program, [], { logging: false })
            const outString = String(output)
            expect(outString).to.have.length(16)
        })

        it('Sample test 3: Outputs the large number', async function() {
            const largeNum = 1125899906842624
            const program = [104, largeNum, 99]
            const output = await computer.run(program, [], { logging: false })
            expect(output).to.have.ordered.members([largeNum])
        })
    })
})
