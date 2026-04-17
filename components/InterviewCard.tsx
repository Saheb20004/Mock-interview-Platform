
import dayjs from 'dayjs';
import Image from 'next/image';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import Link from 'next/link';
import DisplayTechIcon from './DisplayTechIcon';

const InterviewCard = ({id,userId,role,type,techstack,createdAt}:InterviewCardProps) => {
    const feedback=null as Feedback | null;
    const nomalizedType=/mix/gi.test(type) ? 'Mixed' : type;
    const formattedDate=dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
  return (
    <div className='card-border w-[360px] max-sm:w-full min-h-96'>
        <div className='card-interview'>
            <div>

                <div className='absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600'>
                    <p className='badge-text'>{nomalizedType}</p>
                </div>

                <Image src={getRandomInterviewCover()} alt='cover image' width={90} height={90} className='object-fit rounded-full size-[90px]' />

                <h3 className='nt-5 capitalize'>
                    {role} Interview
                </h3>

                <div className='flex flex-row gap-5 mt-3'>
                    <div className='flex flex-row gap-2'>
                        <Image src='/calendar.svg' alt='calendar' width={22} height={22} />
                        <p>{formattedDate}</p>
                    </div>

                    <div className='flex flex-row gap-2 items-center'>
                        <Image src='/star.svg' alt='star' width={22} height={22} />
                        <p>{feedback ?. totalScore || '---'}/100</p>
                    </div>
                </div>

                <p className='line-clamp-2 mt-5'>
                    {feedback ?. finalAssessment || 'No feedback available yet. Please complete the interview to receive feedback.'}
                </p>
            </div>
            
            <div className='flex flex-row justify-between'>
                {/* <p>Tech Icons</p> */}
                <DisplayTechIcon techStack={techstack} />
                <Button className='btn-primary'>
                    <Link href={feedback?`/interview/${id}/feedback`
                    :`/interview/${id}`
                    }>
                        {feedback ? 'Check Feedback' : 'View'}
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  )
}

export default InterviewCard