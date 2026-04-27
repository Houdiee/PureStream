import { useState, useEffect, useRef } from "react";
import { TMDBService, TMDBMedia, TMDB_IMG, getDisplayTitle, getDisplayYear } from "../api/services/tmdb";

interface Props {
  onSelect: (media: TMDBMedia) => void;
  onDismiss: () => void;
}

// Sub-component to handle image skeletonization per item
const PosterImage = ({ path, title }: { path: string | null; title: string }) => {
  const [loaded, setLoaded] = useState(false);

  if (!path) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white/5 text-white/10">
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!loaded && <div className="absolute inset-0 animate-pulse bg-white/10" />}
      <img
        src={TMDB_IMG(path)}
        alt={title}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export const TitleSearch = ({ onSelect, onDismiss }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Focus and Key-Capture logic
  useEffect(() => {
    inputRef.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Allow Escape to close even at the global level
      if (e.key === "Escape") {
        onDismiss();
        return;
      }

      // Stop ALL other keypresses from bubbling or capturing to the host player
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Use 'true' for capture phase to beat the video player's listeners
    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [onDismiss]);

  // Search logic with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      const result = await TMDBService.searchMedia(query);
      result.match(
        (data) => {
          setResults(data);
          setLoading(false);
        },
        () => {
          setError("No results found.");
          setResults([]);
          setLoading(false);
        }
      );
    }, 350);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  return (
    <div
      className="fixed inset-0 z-[2147483647] flex justify-center items-start pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div className="flex w-[28rem] flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900 p-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Search for title</span>
          <button onClick={onDismiss} className="text-white/40 hover:text-white/80 transition-colors text-lg">✕</button>
        </div>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & shows..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/25"
        />

        <div className="relative min-h-[100px]">
          {loading ? (
            <div className="flex flex-col gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-2 animate-pulse">
                  <div className="h-14 w-10 shrink-0 rounded bg-white/10" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-3 w-2/3 rounded bg-white/10" />
                    <div className="h-2 w-1/4 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-xs text-white/40 py-8 italic">{error}</p>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {results.map((media) => (
                <li key={`${media.media_type}-${media.id}`}>
                  <button
                    onClick={() => onSelect(media)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5 group"
                  >
                    <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-white/5">
                      <PosterImage path={media.poster_path} title={getDisplayTitle(media)} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-medium text-white group-hover:text-blue-400">
                        {getDisplayTitle(media)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/40">{getDisplayYear(media)}</span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
                          {media.media_type === "tv" ? "Show" : "Movie"}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
