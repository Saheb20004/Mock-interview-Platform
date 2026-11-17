
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import InterviewCard from '@/components/InterviewCard';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewsByUserId, getLatestInterviews } from '@/lib/actions/general.action';
// import { get } from 'http';

const page = async () => {

  const user = await getCurrentUser();

  const [userInterviews, latestInterviews] = user
    ? await Promise.all([
        getInterviewsByUserId(user.id),
        getLatestInterviews({ userId: user.id }),
      ])
    : [null, null];

  const hasPastinterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (latestInterviews?.length ?? 0) > 0;


  return (
    <>
      <section className='card-cta' >
        <div className='flex flex-col gap-6 max-w-lg' >
          <h2>Get Interview-Ready with AI-powered Practice & Feedback</h2>
          <p className='text-lg'>Practice on real interview question & get instant feedback</p>
          <Button asChild className='btn-primary max-sm:w-full'>
            <Link href='/interview'>Start an interview</Link>
          </Button>
        </div>
        <Image src='/robot.png' alt='robo-dude' width={400} height={400} className='max-sm:hidden' />
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Your Interviews</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full'>
          {hasPastinterviews ? (
            userInterviews?.map((interview)=>(
              <InterviewCard {...interview} key={interview.id} />
            ))
          ):(
             <p className='col-span-full'>You haven&apos;t taken any interviews</p>
          )}
        </div>
      </section>

      <section className='flex flex-col gap-6 mt-8'>
        <h2>Take an interview</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full'>
          {hasUpcomingInterviews ? (
            latestInterviews?.map((interview)=>(
              <InterviewCard {...interview} key={interview.id} />
            ))
          ):(
             <p className='col-span-full'>There are no interviews available</p>             
          )}
        </div>
      </section>
    </>
  )
}

export default page