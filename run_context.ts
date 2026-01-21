import 'dotenv/config'
import { Agent, run , tool, RunContext} from '@openai/agents'
import { z } from 'zod'

interface MyContext {
  userId: string
  userName: string

  fetchUserInfoFromDb: (userId: string)=> Promise<string>
}

const getUserInfotool = tool({
    name: 'get_user_info',
    description: 'Gets the user info',
    parameters: z.object({}),
    execute: async(_, ctx?: RunContext<MyContext>): Promise<string>=> {
        return `UserId=${ctx?.context.userId}\n UserName=${ctx?.context.userName}`
    }
})

const customerSupportAgent = new Agent<MyContext>({
  name: 'Customer Support Agent',
  tools: [getUserInfotool],
  instructions: ({ context }) => {
    return `You are an expert customer support agent.
User context: ${JSON.stringify(context)}`
  },
})

async function main(query: string, ctx: MyContext) {
  const result = await run(customerSupportAgent, query, {
    context: ctx,
  })

  console.log('Result:', result.finalOutput)
}

main('Hey, what is my name?', {
  userId: '1',
  userName: 'Piyush Garg',
  fetchUserInfoFromDb: async(id)=> `userId=1, UserName`
})
