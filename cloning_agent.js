import 'dotenv/config'
import { Agent, run } from '@openai/agents'

const pirateAgent = new Agent({
  name: 'Pirate',
  instructions: 'Respond like a pirate - lots of “Arrr!”',
  model: 'gpt-5-mini',
})

const robotAgent = pirateAgent.clone({
  name: 'Robot',
  instructions: 'Respond like a robot - be precise and factual.',
})

async function main(query = '') {
  const result = await run(robotAgent, query)

  console.log('Result:', result.finalOutput)
}

main('Give me the code to find the sum of even numbers in JavaScript')
