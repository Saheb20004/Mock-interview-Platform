import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getInterviewCover = (id?: string, role?: string, coverImage?: string) => {
  if (coverImage) return coverImage;

  const key = `${id || ''} ${role || ''}`.toLowerCase();
  if (key.includes('frontend') || key.includes('react')) return '/covers/facebook.png';
  if (key.includes('backend') || key.includes('node')) return '/covers/amazon.png';
  if (key.includes('fullstack') || key.includes('full stack') || key.includes('mern')) return '/covers/hostinger.png';
  if (key.includes('devops') || key.includes('cloud')) return '/covers/adobe.png';
  if (key.includes('ai') || key.includes('machine') || key.includes('ml')) return '/covers/pinterest.png';
  if (key.includes('architect') || key.includes('system')) return '/covers/quora.png';
  if (key.includes('mobile') || key.includes('android') || key.includes('ios')) return '/covers/telegram.png';
  if (key.includes('manager') || key.includes('leader')) return '/covers/spotify.png';
  if (key.includes('cyber') || key.includes('security')) return '/covers/reddit.png';
  if (key.includes('data')) return '/covers/yahoo.png';
  if (key.includes('qa') || key.includes('test') || key.includes('sdet')) return '/covers/skype.png';

  // Deterministic fallback based on key hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % interviewCovers.length;
  return `/covers${interviewCovers[index]}`;
};

export const getRandomInterviewCover = (id?: string, role?: string, coverImage?: string) => {
  return getInterviewCover(id, role, coverImage);
};
