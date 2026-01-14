import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

const calculatorTool = tool({
  name: 'Calculator',
  description: 'Use this tool to answer questions about math problems.',
  parameters: z.object({ question: z.string() }),
  execute: async (input) => {
    throw new Error(`TODO: implement this ${input}`);
  },
});

const agent = new Agent({
  name: 'Strict tool user',
  instructions: 'Always answer using the calculator tool.',
  tools: [calculatorTool],
  modelSettings: { toolChoice: 'auto' },
//   toolUseBehavior: 'stop_on_first_tool'
});

async function runAgent(query='') {
    const result = await run(agent, query)
    console.log(result.finalOutput)
}

runAgent('calculate the math problem 12+23+24-5*(9*52)')