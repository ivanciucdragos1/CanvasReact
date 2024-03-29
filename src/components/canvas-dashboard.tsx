import Link from "next/link";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import React from "react";

export function CanvasDashboard() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <Link
          className="flex items-center gap-2 text-lg font-semibold sm:text-base mr-4"
          href="#"
          passHref
        >
          <FrameIcon className="w-6 h-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <nav className="hidden font-medium sm:flex flex-row items-center gap-5 text-sm lg:gap-6">
          <Link className="font-bold" href="#" passHref>
            BETA
          </Link>
          <Link className="text-gray-500 dark:text-gray-400" href="#" passHref>
            Whitepaper
          </Link>
          <Link className="text-gray-500 dark:text-gray-400" href="#" passHref>
            Documentation
          </Link>
        </nav>
        <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <Button className="rounded-full ml-auto" size="icon" variant="ghost">
            <BellIcon className="w-4 h-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <Button className="rounded-full" size="icon" variant="ghost">
            <img
              alt="Avatar"
              className="rounded-full border"
              height="32"
              src="/placeholder.svg"
              style={{
                aspectRatio: "32/32",
                objectFit: "cover",
              }}
              width="32"
            />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex gap-4 p-4 md:gap-8 md:p-10">
        <section className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="font-semibold">Connected Wallet:</div>
              <div className="text-gray-500 dark:text-gray-400">
                Not connected
              </div>
              <Button size="sm">Connect Wallet</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid gap-1">
                <Label className="text-sm" htmlFor="tokens">
                  Tokens to burn
                </Label>
                <Input id="tokens" placeholder="Enter amount" />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid gap-1">
                <Label className="text-sm" htmlFor="pixels">
                  Owned pixels:
                </Label>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
              <div className="grid gap-1">
                <Label className="text-sm" htmlFor="tokens">
                  Choose a color
                </Label>
                <Input
                  className="w-[px] h-8 mt-4"
                  placeholder="Choose a color"
                  type="color"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="flex-1 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          Canvas
        </section>
      </main>
    </div>
  );
}

function FrameIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" x2="2" y1="6" y2="6" />
      <line x1="22" x2="2" y1="18" y2="18" />
      <line x1="6" x2="6" y1="2" y2="22" />
      <line x1="18" x2="18" y1="2" y2="22" />
    </svg>
  );
}

function BellIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
