interface SkipLinkProps {
  /** ID du contenu principal, ex: "main-content" */
  targetId?: string;
}

function SkipLink({ targetId = 'main-content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="fixed top-0 left-0 z-[70] -translate-y-full focus:translate-y-0 focus:from-graphite-900 focus:to-graphite-800 bg-graphite-900 text-white px-4 py-2 text-sm font-medium transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-200 rounded-br-md"
    >
      Aller au contenu principal
    </a>
  );
}

export default SkipLink;
