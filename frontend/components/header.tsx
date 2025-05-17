
"use client";

import { LogIn, Moon, SquareCheckBig, Sun, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Dialog } from "./ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { SignInDialog } from "./sign-in-dialog";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  FutureEventsDocument,
  FutureEventsQuery,
} from "@/lib/gql/generated/graphql";
import { useUser } from "./providers";
import { getClient } from "@/lib/graphql";
import { useRouter } from "next/navigation";

export const profileNavItems = [
  {
    title: "Einstellungen",
    href: "/profile"
  },
  {
    title: "Tutorien",
    href: "/profile/tutorials",
  },
  {
    title: "Anmeldungen",
    href: "/profile/registrations",
  },
];

export default function Header() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [events, setEvents] = useState<FutureEventsQuery["events"] | null>(
    null
  );

  const { setTheme } = useTheme();
  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      const client = getClient()

      const eventData = await client.request<FutureEventsQuery>(
        FutureEventsDocument
      );
      if (eventData.events.length) {
        setEvents(eventData.events);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groupEventsByUmbrellaId = () => {
    return events?.reduce((acc, event) => {
      const umbrellaId = event.umbrella?.ID;
      if (!acc[umbrellaId ?? 0]) {
        acc[umbrellaId ?? 0] = [];
      }
      acc[umbrellaId ?? 0].push(event);
      return acc;
    }, {} as { [key: string]: FutureEventsQuery["events"] });
  };

  const groupedEvents = groupEventsByUmbrellaId();

  return (
    <header className="justify-between z-20 fixed w-full h-fit flex flex-row items-center p-5 dark:bg-black/30 light:bg-white/30 backdrop-blur-md border-b-[1px]">
      <div
        className="cursor-pointer flex flex-row divide-x divide-solid divide-gray-400"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="Pepp Logo"
          width="0"
          height="0"
          sizes="100vw"
          className="h-10 w-auto pr-2"
        />
        <div className="pl-3">
          <Image
            src="/fs-logo-light.png"
            alt="Fachschaft MathPhysInfo Logo"
            width="0"
            height="0"
            sizes="100vw"
            className="h-10 w-auto block dark:hidden"
          />
          <Image
            src="/fs-logo-dark.png"
            alt="Fachschaft MathPhysInfo Logo"
            width="0"
            height="0"
            sizes="100vw"
            className="h-10 w-auto hidden dark:block"
          />
        </div>
      </div>
      <div className="flex flex-row">
        <Button
          variant="secondary"
          onClick={() => setSearchOpen(true)}
          className="w-fit"
        >
           <Search className="h-[1.2rem] w-[1.2rem] md:hidden" />
           <div
            className="hidden md:flex text-sm font-medium leading-none text-muted-foreground space-x-4">

          <p>Suche nach Veranstaltungen...</p>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
      </div>
        </Button>
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder="Suche nach Veranstaltungen..." />
          <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
            {groupedEvents
              ? Object.keys(groupedEvents).map((uID) => (
                  <CommandGroup
                    key={uID}
                    heading={
                      groupedEvents ? groupedEvents[uID][0].umbrella?.title : ""
                    }
                  >
                    {groupedEvents
                      ? groupedEvents[uID].map((e) => (
                          <CommandItem
                            className="justify-between"
                            key={e.ID}
                            onSelect={() => {
                              setSearchOpen(false);
                            }}
                          >
                            {e.title}
                            {user &&
                            user?.registrations?.find(
                              (r) => r.event.ID === e.ID
                            )
                              ? true
                              : false && (
                                  <SquareCheckBig className="w-2 h-2 text-green-700" />
                                )}
                          </CommandItem>
                        ))
                      : ""}
                  </CommandGroup>
                ))
              : ""}
          </CommandList>
        </CommandDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Thema wechseln</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-[1rem] w-auto mr-2" />
              Hell
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-[1rem] w-auto mr-2" />
              Dunkel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer ml-1">
                <AvatarFallback>
                  {user.fn[0]}
                  {user.sn[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="m-2">
                <p className="font-bold text-sm">
                  {user.fn} {user.sn}
                </p>
                <p className="text-muted-foreground text-xs">{user.mail}</p>
              </div>
              <Separator />
              {profileNavItems.map(i => (
                <DropdownMenuItem key={i.title} onClick={() => router.push(i.href)}>
                  {i.title}
                </DropdownMenuItem>
              ))}
              <Separator />
              <DropdownMenuItem onClick={() => setUser(null)}>
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <LogIn className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DialogTrigger>
            <SignInDialog />
          </Dialog>
        )}
      </div>
    </header>
  );
}
