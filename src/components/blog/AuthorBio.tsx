import Image from 'next/image';
import { Linkedin } from 'lucide-react';
import { AUTHOR } from '@/lib/blog/author';

export function AuthorBio() {
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-5">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={AUTHOR.avatar}
          alt={`${AUTHOR.name} avatar`}
          fill
          className="rounded-full object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{AUTHOR.name}</p>
        <p className="text-sm text-muted-foreground mb-1">{AUTHOR.role}</p>
        <p className="text-sm text-muted-foreground">{AUTHOR.bio}</p>
        <a
          href={AUTHOR.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          aria-label={`${AUTHOR.name} on LinkedIn`}
        >
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          LinkedIn
        </a>
      </div>
    </div>
  );
}
