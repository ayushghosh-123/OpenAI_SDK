import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents';
import {z} from 'zod';
import { OpenAI } from 'openai';

const client = new OpenAI()

// client.conversations.create({}).then((e)=>{
//     console.log('Conv thread created id=', e.id)
// })

  // ❌ const → ✅ let (because it is reassigned)

const executeSQL = tool({
  name: 'execute_sql',
  description: 'This executes the SQL Query',
  parameters: z.object({
    sql: z.string().describe('the sql query'),
  }),
  async execute({ sql }) {
    console.log(`[SQL]: Execute ${sql}`);
    return 'done';
  },
});

const sqlAgent = new Agent({
  name: 'SQL Expert Agent',
  tools: [executeSQL],
  instructions: `
          You are an expert SQL Agent that is specialized in generating SQL queries as per user request.
  
          Postgres Schema:
        -- users table
            CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        );
  
      -- comments table
      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      `,
});

async function main(q = '') {

    
    const result = await run(sqlAgent, q, {
        conversationId: 'conv_696a7e0fbfd88190ad2cd682ac002d830f14975cdb88d911'
    })
     
    console.log('final Output: ', result.finalOutput)
}

// Turn 1
main('write a query get all user my name')