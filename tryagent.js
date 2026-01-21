import 'dotenv/config'
import { Agent, run} from '@openai/agents'

const imagegenerater = new Agent({
    name: 'image generater',
    instructions: ' you can generate an image that text given by the user.',
    model: 'gpt-5-nano'
})

run(imagegenerater, 'please generage a betch image ')
.then((result)=>{
    console.log(result.finalOutput)
})
