import { Github } from 'lucide-react'
import { GITHUB_REPO_URL } from '@/lib/config'

export function GithubButton() {
  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-full hover:bg-muted transition-colors"
      aria-label="View on GitHub"
    >
      <Github className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
    </a>
  )
}
