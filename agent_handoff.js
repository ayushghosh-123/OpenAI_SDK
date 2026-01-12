// hand-off ai agent

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import fs from "node:fs/promises";

/* -------------------- Refund Tool -------------------- */

const processRefund = tool({
  name: "process_refund",
  description: "Process a refund for a customer",
  parameters: z.object({
    customerId: z.string().describe("ID of the customer"),
    reason: z.string().describe("Reason for refund"),
  }),
  async execute({ customerId, reason }) {
    await fs.appendFile(
      "./refunds.txt",
      `Refund issued for customer ${customerId}. Reason: ${reason}\n`,
      "utf-8"
    );
    return { refundIssued: true };
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions: "You are an expert in handling customer refunds.",
  tools: [processRefund],
});

/* -------------------- Sales Tool -------------------- */

const fetchAvailablePlans = tool({
  name: "fetch_available_plans",
  description: "Fetch available internet plans",
  parameters: z.object({}),
  async execute() {
    return [
      { plan_id: "1", price_inr: 399, speed: "30 Mbps" },
      { plan_id: "2", price_inr: 999, speed: "100 Mbps" },
      { plan_id: "3", price_inr: 1499, speed: "300 Mbps" },
    ];
  },
});

const salesAgent = new Agent({
  name: "Sales Agent",
  instructions:
    "You are a sales expert helping users choose the best internet plan.",
  tools: [
    fetchAvailablePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund-related requests",
    }),
  ],
});

/* -------------------- Reception Agent -------------------- */

const receptionAgent = new Agent({
  name: "Reception Agent",
  instructions:
    ` ${RECOMMENDED_PROMPT_PREFIX} You are the first point of contact. Understand the user's intent and handoff to the correct agent.`,
  handoffDescription: `
Available agents:
- Sales Agent: Handles new customer queries and plans
- Refund Agent: Handles refunds for existing customers
`,
  handoffs: [salesAgent, refundAgent],
});

/* -------------------- Runner -------------------- */

async function main(query) {
  const result = await run(receptionAgent, query);
  console.log("Result:", result.finalOutput);
  console.log("History:", result.history);
}

main(
  "Hi there , I am customer have id cust_234 and I want to have a refund as I am facing slow speed internet issues"
);
