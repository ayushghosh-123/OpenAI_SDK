import 'dotenv/config'
import { Agent, run } from '@openai/agents'
import { z } from 'zod'

const agent = new Agent({
  name: 'Storyteller',
  instructions:
    'You are a storyteller. You will be given a topic and you will tell a story about it.',
});

async function* streamOutput(q: string){
    const result = await run(agent, q, {stream: true})
    const stream = result.toTextStream()

    for await (const val of stream){
        yield {isCompleted: false, value: val}
    }

    yield{ isCompleted: false, value: result.finalOutput}
}

async function main(q:string) {
    // const result = await run(agent, q, {stream: true})

    // result .toTextStream({compatibleWithNodeStreams: true}).pipe(process.stdout);

    // const stream = result.toTextStream()
    // for await(const val of stream){
    //     console.log(val)
    // }

    for await (const o of streamOutput(q)){
        console.log(o)
    }

}

main('In 300 wordes tell me story about mackbook')

