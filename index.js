import 'dotenv/config'
import { Agent, run } from '@openai/agents'; // --> class name

const location = 'india'

const helloagent = new Agent({
    name: 'Hello Agent',
    instructions: ()=>{
        if(location === 'india'){
            return  'always say namaste '
        }
        else{
            return 'then just talk to the user '
        }
    },
    model: 'gpt-5-nano'
})

run(helloagent, 'Hey There , My name is ayush ')
.then((result)=>{
    console.log(result.finalOutput)
})