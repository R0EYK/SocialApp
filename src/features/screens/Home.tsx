import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
            Help someone today!
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            Find people in need around you and make a difference in your
            community. Whether it's running errands, providing support, or just
            lending a listening ear, your help matters.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/auth/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
