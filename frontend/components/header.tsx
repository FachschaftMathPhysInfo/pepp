"use client";

import { LogIn, Moon, SquareCheckBig, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
import { useUmbrella, useUser } from "./providers";
import { client } from "@/lib/graphql";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [events, setEvents] = useState<FutureEventsQuery["events"] | null>(
    null
  );

  const { setCloseupID } = useUmbrella();
  const { setTheme } = useTheme();
  const { user, setUser, registrations } = useUser();

  useEffect(() => {
    const fetchData = async () => {
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
    <header className="backdrop-blur-md z-20 fixed w-full h-20 flex flex-row items-center px-5 space-x-2">
      <Image
        src="/logo.png"
        alt="Logo der Fachschaft"
        width="150"
        height="15"
      />
      <div className="w-full" />
      <Button
        variant="secondary"
        onClick={() => setSearchOpen(true)}
        className="space-x-4 w-fit"
      >
        <p>Suche nach Veranstaltungen...</p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
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
                            setCloseupID(e.ID);
                          }}
                        >
                          {e.title}
                          {user &&
                          registrations.find((r) => r.event.ID === e.ID)
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
          <Button variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
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
            <DropdownMenuItem>Einstellungen</DropdownMenuItem>
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
    </header>
  );
}
