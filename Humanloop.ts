import 'dotenv/config'
import { Agent, tool, run } from '@openai/agents'
import { z } from 'zod'
import axios from 'axios'
import { Resend } from 'resend'

/* ---------------- WEATHER TOOL ---------------- */

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'Return the weather for a given city.',
  parameters: z.object({
    city: z.string().describe('name of the city'),
  }),
  async execute({ city }) {
    console.log('calling get weather', city)
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`
    const response = await axios.get(url, { responseType: 'text' })
    return `The weather in ${city} is ${response.data}.`
  },
})

/* ---------------- EMAIL TOOL ---------------- */

const resend = new Resend(process.env.RESEND_API_KEY)

const sendEmailTool = tool({
  name: 'send_email',
  description: 'Send the email to the user',
  parameters: z.object({
    to: z.string().describe('to email address'),
    subject: z.string().describe('subject of the email'),
    html: z.string().describe('html body for the email'),
  }),
  needsApproval: true,
  async execute({ to, subject, html }) {
    const { data, error } = await resend.emails.send({
      from: 'update.example.com',
      to,
      subject,
      html,
    })

    if (error) {
      throw new Error(error.message)
    }

    return `Email sent successfully to ${to}`
  },
})

/* ---------------- AGENT ---------------- */

const agent = new Agent({
  name: 'Weather Email Agent',
  instructions: `
You are an expert agent.
1. Get weather information using get_weather.
2. Send that information via email using send_email.
`,
  tools: [getWeatherTool, sendEmailTool],
})

/* ---------------- MAIN ---------------- */

async function main(q: string) {
  const result = await run(agent, q)
  console.log('Result output:', result.finalOutput)
}

main('What is the weather of Goa and send it to ghoshayush910@gmail.com')