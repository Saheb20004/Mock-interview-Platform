import { getRandomInterviewCover } from "@/lib/utils";
import { createGroq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { db } from "@/firebase/admin";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(){
    return Response.json({ success: true, data: 'PrepWise Vapi Generate API is ready' }, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Resolve parameters from either Vapi toolCalls, functionCall, or direct JSON body
        let toolCallId: string | undefined;
        let params: Record<string, unknown> = {};

        if (body.message?.toolCalls?.[0]) {
            const toolCall = body.message.toolCalls[0];
            toolCallId = toolCall.id;
            let args = toolCall.function?.arguments;
            if (typeof args === 'string') {
                try {
                    args = JSON.parse(args);
                } catch {
                    args = {};
                }
            }
            params = { ...(args as Record<string, unknown> || {}) };
        } else if (body.message?.functionCall?.parameters) {
            params = { ...(body.message.functionCall.parameters as Record<string, unknown>) };
        } else {
            params = { ...(body as Record<string, unknown>) };
        }

        // 2. Extract fields with casing / naming fallbacks
        const role = String(params.role || body.role || '');
        const level = String(params.level || body.level || '');
        const type = String(params.type || body.type || 'Mixed');
        const techstack =
            params.techstack ||
            params.techStack ||
            body.techstack ||
            body.techStack;

        const amountRaw = params.amount || body.amount || 5;
        const amount = typeof amountRaw === 'number' ? amountRaw : parseInt(String(amountRaw), 10) || 5;

        const userid = String(
            params.userid ||
            params.userId ||
            body.userid ||
            body.userId ||
            body.message?.call?.variableValues?.userid ||
            body.message?.call?.variableValues?.userId ||
            ''
        );

        if (!role || !level || !techstack || !userid) {
            console.error('Missing required fields for interview generation:', { role, level, techstack, userid });
            return Response.json(
                { success: false, error: 'Missing required fields: role, level, techstack, or userid' },
                { status: 400 }
            );
        }

        const normalizedTechStack: string[] = Array.isArray(techstack)
            ? techstack.map((t: string) => String(t).trim()).filter(Boolean)
            : typeof techstack === 'string'
            ? techstack.split(',').map((t: string) => t.trim()).filter(Boolean)
            : [];

        // 3. Generate questions using structured schema with Groq LLM
        const { object } = await generateObject({
            model: groq('llama-3.3-70b-versatile'),
            schema: z.object({
                questions: z.array(z.string()),
            }),
            prompt: `Prepare ${amount} questions for a job interview.
The job role is ${role}.
The job experience level is ${level}.
The tech stack used in the job is: ${normalizedTechStack.join(', ')}.
The focus between behavioural and technical questions should lean towards: ${type}.
The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.`,
        });

        const interview = {
            role,
            type,
            level,
            techstack: normalizedTechStack,
            questions: object.questions,
            userId: userid,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('interviews').add(interview);

        // If called by Vapi as a tool call, return Vapi-compliant tool result
        if (toolCallId) {
            return Response.json({
                results: [
                    {
                        toolCallId,
                        result: `Interview successfully generated with ${object.questions.length} questions. Tell the candidate their interview is ready on their dashboard!`,
                    },
                ],
            }, { status: 200 });
        }

        return Response.json({ success: true, id: docRef.id }, { status: 200 });
    } catch (error) {
        console.error('Error in /api/vapi/generate:', error);
        return Response.json({ success: false, error: String(error) }, { status: 500 });
    }
}
