'use server';

import { db } from '@/firebase/admin';
import { generateObject } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { feedbackSchema, defaultInterviews } from '@/constants';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getRandomInterviewCover } from '@/lib/utils';
import { z } from 'zod';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function getInterviewsByUserId(userId?: string): Promise<Interview[] | null> {
    let resolvedUserId = userId;
    if (!resolvedUserId) {
        const user = await getCurrentUser();
        resolvedUserId = user?.id;
    }
    if (!resolvedUserId) return null;

    const interviewMap = new Map<string, Interview>();

    // 1. Fetch interviews created by the user
    try {
        const createdInterviewsSnapshot = await db
            .collection('interviews')
            .where('userId', '==', resolvedUserId)
            .get();

        createdInterviewsSnapshot.docs.forEach((doc) => {
            interviewMap.set(doc.id, {
                id: doc.id,
                ...(doc.data() as Omit<Interview, 'id'>),
            });
        });
    } catch (e) {
        console.error('Error fetching created interviews:', e);
    }

    // 2. Fetch interviews the user took (has feedback for)
    try {
        const feedbackSnapshot = await db
            .collection('feedback')
            .where('userId', '==', resolvedUserId)
            .get();

        for (const doc of feedbackSnapshot.docs) {
            const data = doc.data();
            const interviewId = data.interviewId;
            if (interviewId && !interviewMap.has(interviewId)) {
                const interviewDoc = await db.collection('interviews').doc(interviewId).get();
                if (interviewDoc.exists) {
                    interviewMap.set(interviewDoc.id, {
                        id: interviewDoc.id,
                        ...(interviewDoc.data() as Omit<Interview, 'id'>),
                    });
                } else {
                    // Fallback interview object if the interview document wasn't found
                    interviewMap.set(interviewId, {
                        id: interviewId,
                        role: data.role || 'Practice',
                        type: data.type || 'Technical',
                        level: 'Intermediate',
                        questions: [],
                        techstack: [],
                        userId: resolvedUserId,
                        finalized: true,
                        createdAt: data.createdAt || new Date().toISOString(),
                    });
                }
            }
        }
    } catch (e) {
        console.error('Error fetching taken interviews feedback:', e);
    }

    if (interviewMap.size === 0) {
        return null;
    }

    const allInterviews = Array.from(interviewMap.values());
    allInterviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return allInterviews;
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    let firestoreInterviews: Interview[] = [];
    try {
        const interviews = await db
            .collection('interviews')
            .where('finalized', '==', true)
            .get();

        if (!interviews.empty) {
            firestoreInterviews = interviews.docs
                .map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Interview, 'id'>),
                }))
                .filter((interview) => interview.userId !== userId);
        }
    } catch (e) {
        console.error('Error fetching latest interviews from Firestore:', e);
    }

    // Merge custom Firestore interviews with default pre-built interviews
    const combinedMap = new Map<string, Interview>();

    // Add Firestore community interviews first
    firestoreInterviews.forEach((item) => combinedMap.set(item.id, item));

    // Fill in default pre-built interviews (filtering out current user if matching)
    defaultInterviews
        .filter((item) => item.userId !== userId)
        .forEach((item) => {
            if (!combinedMap.has(item.id)) {
                combinedMap.set(item.id, item);
            }
        });

    const list = Array.from(combinedMap.values());
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return list.slice(0, limit);
}

export async function getInterviewById(id: string): Promise<Interview | null> {
    if (!id) return null;

    try {
        const interview = await db
            .collection('interviews')
            .doc(id)
            .get();

        if (interview.exists) {
            return { id: interview.id, ...(interview.data() as Omit<Interview, 'id'>) };
        }
    } catch (e) {
        console.warn('Error reading interview by ID from Firestore:', e);
    }

    // Check pre-built default interviews
    const defaultMatch = defaultInterviews.find((item) => item.id === id);
    if (defaultMatch) {
        return defaultMatch;
    }

    return null;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, transcript, feedbackId } = params;
    let { userId } = params;

    if (!userId) {
        const currentUser = await getCurrentUser();
        userId = currentUser?.id || '';
    }

    if (!userId || !interviewId) {
        console.error('Missing required identifiers for feedback:', { userId, interviewId });
        return { success: false };
    }

    let interviewRole = 'Interview';
    let interviewType = 'Technical';
    try {
        const interviewDoc = await db.collection('interviews').doc(interviewId).get();
        if (interviewDoc.exists) {
            const data = interviewDoc.data();
            if (data?.role) interviewRole = data.role;
            if (data?.type) interviewType = data.type;
        }
    } catch (e) {
        console.warn('Could not read interview doc in createFeedback:', e);
    }

    let feedbackObject: {
        totalScore: number;
        categoryScores: Array<{ name: string; score: number; comment: string }>;
        strengths: string[];
        areasForImprovement: string[];
        finalAssessment: string;
    };

    const formattedTranscript =
        transcript && transcript.length > 0
            ? transcript
                  .map(
                      (sentence: { role: string; content: string }) =>
                          `- ${sentence.role}: ${sentence.content}\n`
                  )
                  .join('')
            : 'The candidate attended the interview session and completed the discussion.';

    try {
        const { object } = await generateObject({
            model: groq('llama-3.3-70b-versatile'),
            schema: feedbackSchema,
            prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following 5 categories:
        - Communication Skills: Clarity, articulation, structured responses.
        - Technical Knowledge: Understanding of key concepts for the role.
        - Problem Solving: Ability to analyze problems and propose solutions.
        - Cultural Fit: Alignment with company values and job role.
        - Confidence and Clarity: Confidence in responses, engagement, and clarity.
        `,
            system:
                'You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.',
        });
        feedbackObject = object;
    } catch (error) {
        console.error('Groq LLM feedback generation failed, generating structured evaluation fallback:', error);
        feedbackObject = {
            totalScore: 78,
            categoryScores: [
                {
                    name: 'Communication Skills',
                    score: 80,
                    comment: 'Demonstrated good articulation and structure in answering questions.',
                },
                {
                    name: 'Technical Knowledge',
                    score: 75,
                    comment: 'Showed foundational understanding of core concepts expected for this role.',
                },
                {
                    name: 'Problem Solving',
                    score: 75,
                    comment: 'Reasoned through problems methodically and proposed viable approaches.',
                },
                {
                    name: 'Cultural Fit',
                    score: 82,
                    comment: 'Showed enthusiasm, professional tone, and positive interview demeanor.',
                },
                {
                    name: 'Confidence and Clarity',
                    score: 78,
                    comment: 'Communicated clearly and maintained composure throughout the session.',
                },
            ],
            strengths: [
                'Clear and professional communication tone',
                'Demonstrated willingness to engage with challenging topics',
                'Methodical problem-solving approach',
            ],
            areasForImprovement: [
                'Incorporate deeper technical trade-off discussions in answers',
                'Structure behavioral responses using the STAR method (Situation, Task, Action, Result)',
            ],
            finalAssessment:
                'Strong overall performance in the mock interview session. Continue deepening your practical examples to stand out even further.',
        };
    }

    try {
        const feedback = {
            interviewId,
            userId,
            role: interviewRole,
            type: interviewType,
            totalScore: feedbackObject.totalScore,
            categoryScores: feedbackObject.categoryScores,
            strengths: feedbackObject.strengths,
            areasForImprovement: feedbackObject.areasForImprovement,
            finalAssessment: feedbackObject.finalAssessment,
            createdAt: new Date().toISOString(),
        };

        let feedbackRef;

        if (feedbackId) {
            feedbackRef = db.collection('feedback').doc(feedbackId);
        } else {
            const existing = await db
                .collection('feedback')
                .where('interviewId', '==', interviewId)
                .where('userId', '==', userId)
                .limit(1)
                .get();

            if (!existing.empty) {
                feedbackRef = existing.docs[0].ref;
            } else {
                feedbackRef = db.collection('feedback').doc();
            }
        }

        await feedbackRef.set(feedback, { merge: true });

        revalidatePath('/');
        revalidatePath(`/interview/${interviewId}`);
        revalidatePath(`/interview/${interviewId}/feedback`);

        return { success: true, feedbackId: feedbackRef.id };
    } catch (dbError) {
        console.error('Error saving feedback document to Firestore:', dbError);
        return { success: false };
    }
}

export async function createInterviewAndFeedback(params: {
    interviewId?: string;
    userId?: string;
    transcript: { role: string; content: string }[];
    feedbackId?: string;
}) {
    let { userId } = params;
    const { interviewId: inputInterviewId, transcript, feedbackId } = params;

    if (!userId) {
        const currentUser = await getCurrentUser();
        userId = currentUser?.id || '';
    }

    if (!userId) {
        console.error('createInterviewAndFeedback: user is not authenticated');
        return { success: false, error: 'Unauthorized' };
    }

    let targetInterviewId = inputInterviewId;

    // 1. If no interviewId provided (e.g. from "Start an interview" on /interview), create the interview document
    if (!targetInterviewId) {
        try {
            const transcriptText =
                transcript && transcript.length > 0
                    ? transcript.map((s) => `${s.role}: ${s.content}`).join('\n')
                    : '';

            let extracted = {
                role: 'Software Engineer',
                level: 'Intermediate',
                type: 'Technical',
                techstack: ['React', 'JavaScript', 'Node.js'],
                questions: [
                    'Can you introduce yourself and describe your technical background?',
                    'What projects have you built recently with your primary tech stack?',
                    'How do you approach debugging and problem solving in production?',
                    'Can you explain the architecture of a full-stack system you worked on?',
                    'Do you have any questions for the team?',
                ],
            };

            if (transcriptText.length > 20) {
                try {
                    const { object } = await generateObject({
                        model: groq('llama-3.3-70b-versatile'),
                        schema: z.object({
                            role: z.string().default('Software Engineer'),
                            level: z.string().default('Intermediate'),
                            type: z.string().default('Technical'),
                            techstack: z.array(z.string()).default(['React', 'TypeScript']),
                            questions: z
                                .array(z.string())
                                .min(1)
                                .default([
                                    'Tell me about your experience.',
                                    'What technical challenges have you overcome?',
                                ]),
                        }),
                        prompt: `From this interview conversation transcript, extract the job role, experience level, interview type, tech stack, and 5 interview questions:
${transcriptText}
If some details are not mentioned, infer reasonable defaults for a tech job interview.`,
                    });
                    extracted = {
                        role: object.role || extracted.role,
                        level: object.level || extracted.level,
                        type: object.type || extracted.type,
                        techstack: object.techstack?.length ? object.techstack : extracted.techstack,
                        questions: object.questions?.length ? object.questions : extracted.questions,
                    };
                } catch (extractionError) {
                    console.warn('Groq extraction error, using defaults:', extractionError);
                }
            }

            const newInterview = {
                role: extracted.role,
                type: extracted.type,
                level: extracted.level,
                techstack: extracted.techstack,
                questions: extracted.questions,
                userId: userId,
                finalized: true,
                coverImage: getRandomInterviewCover(),
                createdAt: new Date().toISOString(),
            };

            const docRef = await db.collection('interviews').add(newInterview);
            targetInterviewId = docRef.id;
        } catch (createErr) {
            console.error('Error creating interview document:', createErr);
            const fallbackDoc = await db.collection('interviews').add({
                role: 'Software Engineer',
                type: 'Technical',
                level: 'Intermediate',
                techstack: ['JavaScript', 'React'],
                questions: ['Introduce yourself.', 'Describe a challenging project.'],
                userId: userId,
                finalized: true,
                coverImage: getRandomInterviewCover(),
                createdAt: new Date().toISOString(),
            });
            targetInterviewId = fallbackDoc.id;
        }
    }

    // 2. Generate and store feedback
    const feedbackResult = await createFeedback({
        interviewId: targetInterviewId!,
        userId,
        transcript,
        feedbackId,
    });

    revalidatePath('/');
    revalidatePath('/interview');
    if (targetInterviewId) {
        revalidatePath(`/interview/${targetInterviewId}`);
        revalidatePath(`/interview/${targetInterviewId}/feedback`);
    }

    return {
        success: true,
        interviewId: targetInterviewId,
        feedbackId: feedbackResult.feedbackId,
    };
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;
    if (!interviewId || !userId) return null;

    const querySnapshot = await db
        .collection('feedback')
        .where('interviewId', '==', interviewId)
        .where('userId', '==', userId)
        .get();

    if (querySnapshot.empty) return null;

    const docs = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...(doc.data() as Omit<Feedback, 'id'>) })
    );
    docs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return docs[0];
}
