import 'dotenv/config'
import { Agent, tool, run } from '@openai/agents'; 
import {z} from 'zod';
import fs from 'node:fs/promises'


const fetchAvailablePlance = tool({
    name: 'fetch_availble_plans',
    description: 'fetches the available plans for internet',
    parameters: z.object({}),
    async execute(){
      return [
        {plan_id: '1', price_inr: 399, speed: '30MB/s'},
        {plan_id: '2', price_inr: 999, speed: '100MB/s'},
        {plan_id: '3', price_inr: 1499, speed: '30MB/s'}
      ]  
    }
})


const processRefund = tool({
    name: 'process_refund',
    description: 'This tool process the refund for a customer',
    parameters: z.object({
        cunstomerId: z.string().describe('id of the customer'),
        reason: z.string().describe('reason for refund') 
    }),
    async execute({cunstomerId, reason}){
         await fs.appendFile(`./refunds.txt`, `The fund for customer having ID ${cunstomerId} for ${reason}`, `utf-8`);
         return { refundIssue: true}
    }
})

const refundAgents = new Agent({
    name: 'Refund Agent',
    instructions:'you are expert in issuing refunded to customer', 
    tools:[processRefund]
})

const salesAgent = new Agent({
    name: 'Sales Agent',
    instructions: 'you are an expert sales agent for an internet branded company. Talk to the user and help them with ',
    tools: [fetchAvailablePlance, refundAgents.asTool({
        toolName: 'refund_expert',
        toolDescription: 'Handles refund questions and requests.',
    })]
})

async function runAgent(query='') {
    const result = await run(salesAgent, query)
    console.log(result.finalOutput)
}

runAgent('hey there, I had a plan 399 . I need refund . my customer id 200001148 because i siffing another place')