import Link from "next/link";
import { Heart } from "@phosphor-icons/react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8 md:py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">HireLens</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              AI-powered resume analyzer to help you land your dream job.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/#features"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/faq"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>

        <div className="border-t mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HireLens. All rights reserved.
          </p>

          <div className="flex items-center mt-4 md:mt-0">
            <p className="text-sm text-muted-foreground flex items-center">
              Developed with{" "}
              <Heart
                size={14}
                weight="fill"
                className="mx-1 text-color-danger"
              />{" "}
              by
              <span className="font-medium text-primary ml-1">
                Ashwini M, Sneh Kushwaha, Venkata Srinath
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
