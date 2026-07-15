type AvatarProps = {
  name?: string;
  initials?: string;
  className?: string;
};

export function Avatar({ name, initials, className = "" }: AvatarProps) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white ${className}`.trim()}
      title={name}
    >
      {initials ?? name?.slice(0, 2).toUpperCase()}
    </div>
  );
}
