import 'dotenv/config'
import { Agent, run } from '@openai/agents'
import { z } from 'zod'

/* ---------------- SQL GUARDRAIL AGENT ---------------- */

const sqlGuardrailAgent = new Agent({
  name: 'SQL Guardrail',
  instructions: `
    Check whether the given SQL query is SAFE to execute.
    Rules:
    - Query must be READ-ONLY
    - ALLOWED: SELECT
    - NOT ALLOWED: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE
    Respond clearly whether the query is safe or unsafe.
  `,
  outputType: z.object({
    safe: z.boolean().describe('Whether the query is safe to execute'),
    reason: z.string().optional().describe('Reason if the query is unsafe')
  })
})


const sqlGuardrail = {
  name: 'sql_guardrail',
  async execute({ sql }) {
    const result = await run(sqlGuardrailAgent, sql)

    return {
      tripwireTriggered: !result.finalOutput.safe,
      reason: result.finalOutput.reason ?? null
    }
  }
}

/* ---------------- SQL EXPERT AGENT ---------------- */

const sqlAgent = new Agent({
  name: 'SQL Expert Agent',
  instructions: `
    You are an expert PostgreSQL agent.

    Database Schema:

    users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )

    comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )

    Generate ONLY SQL queries.
  `,
  outputType: z.object({
    sqlQuery: z.string().describe('Generated SQL query')
  })
})

/* ---------------- MAIN FUNCTION ---------------- */

async function main(question) {
  // Step 1: Generate SQL
  const sqlResult = await run(sqlAgent, question)
  const sqlQuery = sqlResult.finalOutput.sqlQuery

  console.log('Generated SQL:\n', sqlQuery)

  // Step 2: Run guardrail
  const guardResult = await sqlGuardrail.execute({ sql: sqlQuery })

  if (guardResult.tripwireTriggered) {
    console.error('Unsafe SQL detected:', guardResult.reason)
    return
  }

  console.log('SQL is safe to execute')
}

main('get all user comment and delete the first one')
