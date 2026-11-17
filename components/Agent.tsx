'use client'

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { vapi } from '@/lib/vapi.sdk';
import { interviewer } from '@/constants';
import { createInterviewAndFeedback } from '@/lib/actions/general.action';
import { toast } from 'sonner';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const Agent = ({ userName, userId, type, interviewId, questions, feedbackId }: AgentProps) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
    const feedbackTriggeredRef = useRef(false);
    const messagesRef = useRef<SavedMessage[]>([]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role as 'user' | 'assistant' | 'system', content: message.transcript };
                setMessages((prev) => [...prev, newMessage]);
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.error('Vapi Error:', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    const handleGenerateFeedback = async (currentMessages: SavedMessage[]) => {
        if (feedbackTriggeredRef.current) return;
        feedbackTriggeredRef.current = true;
        setIsGeneratingFeedback(true);

        try {
            const result = await createInterviewAndFeedback({
                interviewId,
                userId,
                transcript: currentMessages,
                feedbackId,
            });

            if (result.success && result.interviewId) {
                window.location.href = `/interview/${result.interviewId}/feedback`;
            } else {
                toast.error('Failed to generate feedback. Please try again.');
                setIsGeneratingFeedback(false);
                feedbackTriggeredRef.current = false;
            }
        } catch (error) {
            console.error('Error saving feedback:', error);
            toast.error('An error occurred while saving feedback.');
            setIsGeneratingFeedback(false);
            feedbackTriggeredRef.current = false;
        }
    };

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
            handleGenerateFeedback(messagesRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callStatus]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        try {
            if (type === 'generate') {
                await vapi.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, {
                    variableValues: {
                        username: userName,
                        userid: userId,
                    },
                });
            } else {
                let formattedQuestions = '';
                if (questions) {
                    formattedQuestions = questions
                        .map((question) => `- ${question}`)
                        .join('\n');
                }
                await vapi.start(interviewer, {
                    variableValues: {
                        questions: formattedQuestions,
                    },
                });
            }
        } catch (error) {
            console.error('Error starting Vapi call:', error);
            toast.error('Could not start the voice call. Please check your mic and network.');
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleDisconnect = async () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <>
            <div className='call-view'>
                <div className='card-interviewer'>
                    <div className='avatar'>
                        <Image src='/ai-avatar.png' alt='vapi' width={65} height={54} className='object-cover' />
                        {isSpeaking && <span className='animate-speak' />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className='card-border'>
                    <div className='card-content'>
                        <Image src='/user-avatar.png' alt='user avatar' width={540} height={540} className='rounded-full object-cover size-[120px]' />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className='transcript-border'>
                    <div className='transript'>
                        <p key={latestMessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestMessage}
                        </p>
                    </div>
                </div>
            )}

            {isGeneratingFeedback && (
                <div className='flex flex-col items-center justify-center gap-2 mt-4 text-center'>
                    <p className='text-primary-200 font-semibold animate-pulse text-lg'>
                        Analyzing your interview responses & generating detailed AI feedback... Please wait...
                    </p>
                </div>
            )}

            <div className='w-full flex justify-center mt-4'>
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className='relative btn-call'
                        onClick={handleCall}
                        disabled={isGeneratingFeedback}
                    >
                        <span className={cn('absolute animate-ping rounded-full opacity-75', callStatus !== CallStatus.CONNECTING ? 'hidden' : '')} />
                        <span>
                            {isGeneratingFeedback ? 'Analyzing...' : isCallInactiveOrFinished ? 'Call' : '...'}
                        </span>
                    </button>
                ) : (
                    <button className='btn-disconnect' onClick={handleDisconnect} disabled={isGeneratingFeedback}>
                        End
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;
