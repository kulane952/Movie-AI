type Movie = {
  imdbId?: string;
  imdbID?: string;
  title?: string;
  Title?: string;
  year?: string;
  Year?: string;
  genre?: string;
  Genre?: string;
  poster?: string;
  Poster?: string;
  imdbRating?: string;
};

type MovieCardProps = {
  movie: Movie;
  onClick?: () => void;
};

export default function MovieCard({
  movie,
  onClick,
}: MovieCardProps) {
  const title = movie.title || movie.Title || "Unknown Movie";
  const year = movie.year || movie.Year || "";
  const poster = movie.poster || movie.Poster;
  const rating = movie.imdbRating;
  const genre = movie.genre || movie.Genre;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-[180px] shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100">
        {poster && poster !== "N/A" ? (
          <img
            src={poster}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No poster
          </div>
        )}

        {/* Rating */}
        {rating && rating !== "N/A" && (
          <div className="absolute right-2 top-2 rounded-lg bg-black/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur">
            ⭐ {rating}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="p-3 text-xs font-medium text-white">
            View details →
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-gray-950">
          {title}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          {year && <span>{year}</span>}

          {genre && (
            <>
              <span>•</span>
              <span className="truncate">
                {genre.split(",")[0]}
              </span>
            </>
          )}
        </div>

        <div className="mt-3 text-xs font-medium text-gray-400 transition-colors group-hover:text-gray-900">
          View details →
        </div>
      </div>
    </button>
  );
}