"use client";

// Preserve the existing public components while routing through Next.js.
import NextLink from "next/link";
import {
  useParams as nextParams,
  usePathname,
  useRouter,
  useSearchParams as nextSearch,
} from "next/navigation";
import { useEffect, type ComponentProps } from "react";

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & { to: string };
export function Link({ to, ...props }: LinkProps) {
  return <NextLink href={to} {...props} />;
}
export function NavLink({
  to,
  end,
  className = "",
  ...props
}: LinkProps & { end?: boolean }) {
  const path = usePathname();
  const active = end ? path === to : path === to || path.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`${className}${active ? " active" : ""}`}
      {...props}
    />
  );
}
export function useLocation() {
  return { pathname: usePathname() };
}
export function useParams<T extends Record<string, string>>() {
  return nextParams<T>();
}
export function useSearchParams() {
  return [nextSearch()] as const;
}
export function useNavigate() {
  const router = useRouter();
  return (path: string, options?: { replace?: boolean }) =>
    options?.replace ? router.replace(path) : router.push(path);
}
export function Navigate({
  to,
  replace = false,
}: {
  to: string;
  replace?: boolean;
}) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return (
    <p className="team-loading" role="status">
      جارٍ الانتقال…
    </p>
  );
}
