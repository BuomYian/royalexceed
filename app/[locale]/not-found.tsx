import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-brand flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold tracking-widest text-muted-foreground">404</p>
      <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Try browsing our
        model range instead.
      </p>
      <div className="mt-6 flex gap-3">
        <Button render={<Link href="/">Back to homepage</Link>} />
        <Button variant="outline" render={<Link href="/models">Explore models</Link>} />
      </div>
    </div>
  );
}
