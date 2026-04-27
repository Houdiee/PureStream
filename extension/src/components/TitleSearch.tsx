import { useState, useEffect, useRef } from "react";
import { TMDBService, TMDBMedia, TMDB_IMG, getDisplayTitle, getDisplayYear } from "../api/services/tmdb";

interface Props {
  onSelect: (media: TMDBMedia) => void;
  onDismiss: () => void;
}

export const TitleSearch = ({ onSelect, onDismiss }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search logic with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
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
  }, [query]);

  return (
    <div
      // Changed: items-start + pt-[15vh] keeps the modal from jumping when results appear
      className="fixed inset-0 z-[2147483647] flex justify-center items-start pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div className="flex w-[28rem] flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900 p-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Search for title</span>
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/80 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Fixes: Stops host site shortcuts (like YouTube's 'c' or 'f') and handles ESC
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") onDismiss();
          }}
          placeholder="Search movies & shows..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-white/25"
        />

        {/* Results / Feedback Area */}
        <div className="relative">
          {loading && (
            <p className="text-center text-xs text-white/40 py-4">Searching…</p>
          )}

          {error && !loading && (
            <p className="text-center text-xs text-white/40 py-4">{error}</p>
          )}

          {!loading && results.length > 0 && (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto pr-1">
              {results.map((media) => {
                const title = getDisplayTitle(media);
                const year = getDisplayYear(media);
                return (
                  <li key={`${media.media_type}-${media.id}`}>
                    <button
                      onClick={() => onSelect(media)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
                    >
                      {media.poster_path ? (
                        <img
                          src={TMDB_IMG(media.poster_path)}
                          alt={title}
                          className="h-14 w-10 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="h-14 w-10 shrink-0 rounded bg-white/10" />
                      )}
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-sm font-medium text-white">
                          {title}
                        </span>
                        <div className="flex items-center gap-2">
                          {year && (
                            <span className="text-xs text-white/40">{year}</span>
                          )}
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/50">
                            {media.media_type === "tv" ? "Show" : "Movie"}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
