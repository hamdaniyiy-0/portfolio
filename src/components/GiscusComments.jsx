import Giscus from '@giscus/react'

/**
 * Komentar berbasis GitHub Discussions (Giscus).
 * Tema disamakan dengan website yang gelap, bahasa Indonesia.
 */
export default function GiscusComments() {
  return (
    <Giscus
      id="comments"
      repo="hamdaniyiy-0/portfolio"
      repoId="R_kgDOVtKUBw"
      category="Announcements"
      categoryId="DIC_kwDOVtKUB84DLHsg"
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="dark"
      lang="id"
      loading="lazy"
    />
  )
}
