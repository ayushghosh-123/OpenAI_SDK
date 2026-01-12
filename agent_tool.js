import 'dotenv/config'
import { Agent, run, tool } from '@openai/agents'
import {z} from 'zod';
import axios from 'axios';

const GetweatherSchema = z.object({
    city: z.string().describe('name of the city'),
    degree_c: z.number().describe('the degree calcius of thr temp'),
    condition: z.string().optional().describe('condition of the weather')
})


const getWeatherTool = tool({
    name: 'get_weather',
    description: 'Return the weather for a given city.',
    parameters: z.object({ city: z.string().describe('name of the city') }),
    async execute({ city }) {
        console.log('calling get weather', city)
        const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
        const response = axios.get(url, {responseType: 'text'})
        return `The weather in ${city} is 12 ${(await response).data}.`;
    },
})

const sendemailTool=tool({
    name:'send_email',
    description: 'this tool send an email',
    parameters: z.object({
        toEmail: z.string().describe('email address to'),
        subject: z.string().describe('body of the email'),
        body: z.string().describe('body of the email')
    }),
    async execute({ body, subject, toEmail}){
    
  },
})

const agent = new Agent({
    name: 'weather Agent',
    instructions: 'you are an expert weather agent  that helps to tell weather report ',
    tools: [getWeatherTool],
    outputType: GetweatherSchema
})

async function main(query='') {
    const result = await run(agent, query)
    console.log('Result: ', result.finalOutput)
}

main('find the temperature in delhi')