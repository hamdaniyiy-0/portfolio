/**
 * Logo teknologi sebagai SVG inline — tanpa asset eksternal & tanpa
 * jaringan. Dipakai oleh TechStack (bento grid). Warna aslinya tampil
 * saat hover (efek grayscale -> warna diatur di TechStack.jsx).
 *
 * Path three.js & tailwind diambil dari simple-icons (lisensi CC0),
 * figma memakai bentuk resmi 5 warna, React memakai atom resminya.
 */

/** React — atom klasik (3 elips mengorbit inti). */
function ReactLogo({ className }) {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} fill="none" aria-hidden="true">
      <circle r="2.05" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="1">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  )
}

/** Three.js — segitiga berbilah khas logo resmi (simple-icons). */
function ThreeLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#FFFFFF"
        d="M.38 0a.268.268 0 0 0-.256.332l2.894 11.716a.268.268 0 0 0 .01.04l2.89 11.708a.268.268 0 0 0 .447.128L23.802 7.15a.268.268 0 0 0-.112-.45l-5.784-1.667a.268.268 0 0 0-.123-.035L6.38 1.715a.268.268 0 0 0-.144-.04L.456.01A.268.268 0 0 0 .38 0zm.374.654L5.71 2.08 1.99 5.664zM6.61 2.34l4.864 1.4-3.65 3.515zm-.522.12l1.217 4.926-4.877-1.4zm6.28 1.538l4.878 1.404-3.662 3.53zm-.52.13l1.208 4.9-4.853-1.392zm6.3 1.534l4.947 1.424-3.715 3.574zm-.524.12l1.215 4.926-4.876-1.398zm-15.432.696l4.964 1.424-3.726 3.586zM8.047 8.15l4.877 1.4-3.66 3.527zm-.518.137l1.236 5.017-4.963-1.432zm6.274 1.535l4.965 1.425-3.73 3.586zm-.52.127l1.235 5.012-4.958-1.43zm-9.63 2.438l4.873 1.406-3.656 3.523zm5.854 1.687l4.863 1.403-3.648 3.51zm-.54.04l1.214 4.927-4.875-1.4zm-3.896 4.02l5.037 1.442-3.782 3.638z"
      />
    </svg>
  )
}

/** Tailwind CSS — dua gelombang khas (simple-icons). */
function TailwindLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#38BDF8"
        d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"
      />
    </svg>
  )
}

/** JavaScript — petak kuning klasik dengan huruf JS. */
function JsLogo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="5" fill="#F7DF1E" />
      <text
        x="16"
        y="22.5"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="13.5"
        fill="#111827"
      >
        JS
      </text>
    </svg>
  )
}

/** Figma — 5 bentuk resmi dengan warnanya masing-masing. */
function FigmaLogo({ className }) {
  return (
    <svg viewBox="0 0 38 57" className={className} aria-hidden="true">
      <path d="M19 28.5a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0z" fill="#1ABCFE" />
      <path d="M0 47.5A9.5 9.5 0 019.5 38H19v9.5a9.5 9.5 0 11-19 0z" fill="#0ACF83" />
      <path d="M19 0v19h9.5a9.5 9.5 0 100-19H19z" fill="#FF7262" />
      <path d="M0 9.5A9.5 9.5 0 009.5 19H19V0H9.5A9.5 9.5 0 000 9.5z" fill="#F24E1E" />
      <path d="M0 28.5A9.5 9.5 0 009.5 38H19V19H9.5A9.5 9.5 0 000 28.5z" fill="#A259FF" />
    </svg>
  )
}

/** HTML5 — perisai resmi (simple-icons). */
function Html5Logo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#E34F26"
        d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"
      />
    </svg>
  )
}

/** CSS3 — perisai resmi (simple-icons). */
function Css3Logo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#1572B6"
        d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622 10.125.002-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.956-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"
      />
    </svg>
  )
}

/** Node.js — segienam resmi (simple-icons). */
function NodeLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#5FA04E"
        d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339c.082.045.197.045.272 0l8.795-5.076c.082-.047.134-.141.134-.244V6.921c0-.103-.053-.198-.137-.249l-8.791-5.072c-.081-.047-.189-.047-.271 0L3.075 6.672c-.085.051-.139.146-.139.249v10.15c0 .103.054.2.139.248l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.093c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551l-2.407-1.39c-.57-.329-.922-.945-.922-1.604V6.921c0-.659.353-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15c0 .659-.354 1.273-.924 1.604l-8.794 5.078c-.554.316-1.273.475-1.998.475zm3.1-7.007c-1.9 0-2.385-1.059-2.385-1.948 0-.172.143-.272.272-.272h1.09c.15 0 .256.1.283.24.156.854.508 1.075 1.442 1.075.888 0 1.317-.2 1.317-.673 0-.532-.421-.686-1.496-.934-1.346-.312-2.163-.76-2.163-1.71 0-.968.815-1.674 2.166-1.674 1.527 0 2.344.527 2.487 1.666.01.04-.01.099-.04.13-.03.04-.07.06-.12.06h-1.09c-.13 0-.24-.1-.26-.23-.13-.73-.46-.93-1.23-.93-.81 0-1.19.2-1.19.61 0 .48.4.63 1.43.86 1.32.3 2.15.72 2.15 1.73 0 1.04-.87 1.74-2.27 1.74z"
      />
    </svg>
  )
}

/** Git — simpul simpul khas (simple-icons). */
function GitLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#F05032"
        d="M23.546 10.93 13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.88 0 2.6-.719.721-1.889.721-2.606 0-.719-.719-.719-1.879 0-2.598.177-.176.385-.307.605-.391V8.835c-.22-.085-.424-.213-.6-.39-.511-.511-.642-1.256-.396-1.899L7.7 3.773.453 11.018c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.326"
      />
    </svg>
  )
}

/** GitHub — octocat (path sama dengan icons/GithubIcon). */
function GithubLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#f0f6fc" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

/** VS Code — pita khas (simple-icons). */
function VscodeLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#007ACC"
        d="M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a1 1 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a1 1 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352ZM18.01 4.744l3.555 1.714v11.064l-3.555 1.714-5.742-5.454-2.346 2.146-.549-1.942 4.355-4.098-4.355-4.098.55-1.942 2.345 2.146 5.742-5.454Zm-9.678 5.99-2.87 2.192L2.79 9.765l6.542-4.812v5.78Zm0 2.617v5.78L2.79 19.235l2.673-3.176 2.87 2.192v-5.81Zm8.136 2.077-3.945-3.743v7.486l3.945-3.743Z"
      />
    </svg>
  )
}

/** Vite — petir gradien ungu (merek resmi berupa segitiga + petir). */
function ViteLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="vite-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#646CFF" />
          <stop offset="100%" stopColor="#BD34FE" />
        </linearGradient>
      </defs>
      <path
        fill="url(#vite-grad)"
        d="M23.6 4.6 13.3.3a1.6 1.6 0 0 0-1.4 0L1.6 4.6a.6.6 0 0 0-.3.5v9.9c0 .2.1.4.3.5l10.3 4.4c.4.2 1 .2 1.4 0l10.3-4.4a.6.6 0 0 0 .3-.5V5.1a.6.6 0 0 0-.3-.5ZM12 16.3 6.6 6.9h2.2L12 12.7l3.2-5.8h2.2L12 16.3Z"
      />
      <path fill="#FFC83A" d="M13.3 17.1v2.4c0 .4-.5.7-.9.5l-1.9-.8a.6.6 0 0 1-.4-.5v-2.4c0-.4.5-.7.9-.5l1.9.8c.3.1.4.4.4.5Z" />
    </svg>
  )
}

/** Express — huruf ex pada latar gelap. */
function ExpressLogo({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#1a1a2e" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontWeight="700"
        fontSize="13"
        fill="#f5f5f5"
      >
        ex
      </text>
    </svg>
  )
}

/** REST API — kurung kurawal & titik (gaya endpoint). */
function ApiLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M8 4c-2.5 0-3 1.4-3 3.2V10c0 1.1-.7 1.8-1.8 1.8S1.4 11.1 1.4 10V7.4M16 4c2.5 0 3 1.4 3 3.2V10c0 1.1.7 1.8 1.8 1.8s1.8-.7 1.8-1.8V7.4"
        stroke="#38bdf8"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M8 20c-2.5 0-3-1.4-3-3.2V14c0-1.1-.7-1.8-1.8-1.8" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 20c2.5 0 3-1.4 3-3.2V14c0-1.1.7-1.8 1.8-1.8" stroke="#818cf8" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.4" fill="#38bdf8" />
      <path d="M12 7.4v2.2M12 14.4v2.2" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const LOGOS = {
  react: ReactLogo,
  three: ThreeLogo,
  tailwind: TailwindLogo,
  js: JsLogo,
  figma: FigmaLogo,
  html5: Html5Logo,
  css3: Css3Logo,
  node: NodeLogo,
  git: GitLogo,
  github: GithubLogo,
  vscode: VscodeLogo,
  vite: ViteLogo,
  express: ExpressLogo,
  api: ApiLogo,
}

/** Ambil logo berdasarkan kunci data (`techStack[].logo`). */
export default function Logo({ name, className = '' }) {
  const Mark = LOGOS[name]
  if (!Mark) return null
  return <Mark className={className} />
}
