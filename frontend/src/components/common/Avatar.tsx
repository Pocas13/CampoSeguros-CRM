type AvatarProps = {
  name?: string;
  initials?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ name, initials, src, size = "md", className = "" }: AvatarProps) {
  const fallback = initials ?? name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 font-bold text-white ${sizes[size]} ${className}`.trim()} title={name}>
      {src ? <img src={src} alt={name || "Utilizador"} className="h-full w-full object-cover" /> : fallback}
    </div>
  );
}

export default Avatar;
