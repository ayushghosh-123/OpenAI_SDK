import 'dotenv/config'
import { Agent, run } from '@openai/agents'
import { z } from 'zod'

const mathInputAgent = new Agent({
  name: 'math query checker',
  instructions:
    'You are an input guardrail agent. Check whether the user query is a valid mathematics question.',
  outputType: z.object({
    isvalidMathQuestion: z.boolean(),
    reason: z.string().describe('describe reason of reject'),
  }),
})

const mathInputGuardril = {
  name: 'Math Homework Guardrail',
  execute: async ({ input }) => {
    console.log(`TODO: we ned to validate ${input}`)
    const result = await run(mathInputAgent, input)

    return {
      tripwireTriggered: !result.finalOutput.isvalidMathQuestion,
      outputInfo: result.finalOutput, // ✅ FIX
    }
  },
}


const mathsAgent = new Agent({
  name: 'Maths Agent',
  instructions:
    'You are an expert math agent. Solve the given math problem and return the final answer.',
  inputGuardrails: [mathInputGuardril],
  outputType: z.object({
    solution: z.string().describe('final solved math answer'),
  }),
})

async function main(q = '') {
  try {
    const result = await run(mathsAgent, q)
    console.log('Result:', result.finalOutput.solution)
  } catch (error) {
    console.error('Blocked by guardrail:', error.message)
  }
}

main('write a code in js for add even digit from 1-100')

