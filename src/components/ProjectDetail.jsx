import { useEffect } from 'react'
import { ArrowLeft, ChevronRight, FolderGit2 } from 'lucide-react'
import { projects } from '../data/portfolio'
import { navigate } from '../hooks/useRoute'
import BorderGlowCard from './BorderGlowCard'
import Logo from './Logos'
import './ProjectDetail.css'

/** Pemetaan nama teknologi -> kunci logo di Logos.jsx (bila ada). */
const TECH_LOGOS = {
  React: 'react',
  Vite: 'vite',
  'Tailwind CSS': 'tailwind',
  Tailwind: 'tailwind',
  JavaScript: 'js',
  'Three.js': 'three',
  'React Three Fiber': 'three',
  'Node.js': 'node',
  'Express.js': 'express',
  'REST API': 'api',
  API: 'api',
  'FakeStore API': 'api',
  Git: 'git',
  GitHub: 'github',
  'VS Code': 'vscode',
  HTML: 'html5',
  CSS: 'css3',
}

/**
 * Halaman detail proyek — route `/project/<judul>`:
 * tanpa navbar & footer (seperti referensi), breadcrumbs
 * Back > Projects > judul, deskripsi, chip "Technologies Used"
 * dengan glow kursor, dan pratinjau sticky di kanan.
 */
export default function ProjectDetail({ slug }) {
  const project = projects.find((p) => p.title === slug)
  const ProjectIcon = project?.icon

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [slug])

  /* Glow kursor pada chip teknologi — variabel dipasang di :root
     (background-attachment: fixed, seperti referensi). */
  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty('--tech-glow-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--tech-glow-y', `${e.clientY}px`)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.style.removeProperty('--tech-glow-x')
      document.documentElement.style.removeProperty('--tech-glow-y')
    }
  }, [])

  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else navigate('/')
  }

  if (!project) {
    return (
      <main className="project-detail-page">
        <div className="project-detail-inner">
          <div className="project-detail-breadcrumbs">
            <button type="button" className="project-detail-back" onClick={goBack}>
              <ArrowLeft size={20} aria-hidden="true" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="project-detail-title">Proyek tidak ditemukan</h1>
        </div>
      </main>
    )
  }

  return (
    <main className="project-detail-page">
      <div className="project-detail-inner">
        <div className="project-detail-breadcrumbs">
          <button type="button" className="project-detail-back" onClick={goBack}>
            <ArrowLeft size={20} aria-hidden="true" />
            <span>Back</span>
          </button>
          <span className="project-detail-crumb-muted">Projects</span>
          <ChevronRight size={18} className="project-detail-crumb-chevron" aria-hidden="true" />
          <span className="project-detail-crumb-current">{project.title}</span>
        </div>

        <div className="project-detail-layout">
          <div className="project-detail-copy">
            <h1 className="project-detail-title">{project.title}</h1>
            <p className="project-detail-description">{project.description}</p>

            <div className="project-detail-tech">
              <h2>
                <FolderGit2 size={20} aria-hidden="true" />
                Technologies Used
              </h2>
              <div className="project-detail-tech-list">
                {project.tech.map((t) => {
                  const key = TECH_LOGOS[t]
                  return (
                    <span className="project-detail-tech-chip" key={t}>
                      {key && <Logo name={key} className="project-detail-tech-logo" />}
                      <span>{t}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          <BorderGlowCard className="project-detail-preview-glow">
            <div className="project-detail-preview">
              {project.preview ? (
                <img src={project.preview} alt={`Tampilan ${project.title}`} loading="lazy" />
              ) : (
                <div className="project-detail-preview-placeholder">
                  <div className="project-detail-preview-window" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                  <ProjectIcon size={54} aria-hidden="true" />
                  <span>{project.category}</span>
                </div>
              )}
            </div>
          </BorderGlowCard>
        </div>
      </div>
    </main>
  )
}
