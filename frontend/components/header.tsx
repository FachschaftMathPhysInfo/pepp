"use client";

import {LogIn, LogOut, Moon, Search, SquareCheckBig, Sun} from "lucide-react";
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
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import {
  Event,
  FutureEventsDocument,
  FutureEventsQuery,
  Role,
} from "@/lib/gql/generated/graphql";
import { useUser } from "./providers";
import { getClient } from "@/lib/graphql";
import { useRouter } from "next/navigation";
import EventDialog from "@/components/dialog/events/event-dialog";
import { adminItems, userItems } from "@/app/(settings)/sidebar";
import { defaultEvent } from "@/types/defaults";
import { toast } from "sonner";
import { groupEventsByUmbrellaId } from "@/lib/utils";
import {AuthenticationDialog} from "./dialog/authentication/authentication-dialog";

export default function Header() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [dialogState, setDialogState] = useState<"event" | "authentication" | null>(null);
  const [closeupID, setCloseupID] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);

  const {setTheme} = useTheme();
  const {user, logout} = useUser();

  useEffect(() => {
    const fetchData = async () => {
      const client = getClient();

      try {
        const eventData = await client.request<FutureEventsQuery>(
          FutureEventsDocument
        );
        setEvents(
          eventData.events.map((e) => ({
            ...defaultEvent,
            ...e,
            umbrella: {...defaultEvent, ...e.umbrella},
          }))
        );
      } catch {
        toast.error(
          "Beim Laden der Veranstaltungen ist ein Fehler aufgetreten."
        );
      }
    };

    void fetchData();
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

  const groupedEvents = groupEventsByUmbrellaId(events);

  const closeDialog = () => setDialogState(null)

  return (
    <header className="justify-between z-20 fixed w-screen h-fit flex items-center p-5 dark:bg-black/30 light:bg-white/30 backdrop-blur-md border-b-[1px]">

      <div
        className="cursor-pointer flex flex-row divide-x divide-solid divide-gray-400 gap-2 items-center"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="Pepp Logo"
          width="0"
          height="0"
          sizes="100vw"
          className="h-10 w-auto flex-shrink-0"
        />
        <div className="flex gap-2 items-center min-w-0 pl-2">
          <Image
            src="/fs-logo-light.png"
            alt="Fachschaft MathPhysInfo Logo"
            width="0"
            height="0"
            sizes="100vw"
            className="max-h-10 w-auto block flex-shrink dark:hidden"
          />
          <Image
            src="/fs-logo-dark.png"
            alt="Fachschaft MathPhysInfo Logo"
            width="0"
            height="0"
            sizes="100vw"
            className="max-h-10 w-auto hidden flex-shrink dark:block"
          />
        </div>
      </div>
      <div className="flex flex-row ml-8">
        <Button
          variant="secondary"
          onClick={() => setSearchOpen(true)}
          className=""
        >
          <Search className="h-[1.2rem] w-[1.2rem] md:hidden"/>
          <div className="hidden md:flex items-center text-sm font-medium leading-none text-muted-foreground space-x-4">
            <p>Suche nach Veranstaltungen...</p>
            <kbd
              className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </Button>
        <Dialog
          open={dialogState === "event"}
          onOpenChange={(open) => {
            if (open) setDialogState("event");
            else setDialogState(null);
          }}>
          <EventDialog id={closeupID} open={dialogState === "event"}/>
        </Dialog>
        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <CommandInput placeholder="Suche nach Veranstaltungen..."/>
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
                          setDialogState("event")
                        }}
                      >
                        {e.title}
                        {user?.registrations?.some(
                          (r) => r.event.ID === e.ID
                        ) && (
                          <SquareCheckBig className="w-2 h-2 text-green-700"/>
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
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
              <Moon
                className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
              <span className="sr-only">Thema wechseln</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-[1rem] w-auto mr-2"/>
              Hell
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-[1rem] w-auto mr-2"/>
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
              <Separator/>
              {userItems.map((i) => (
                <DropdownMenuItem
                  key={i.title}
                  onClick={() => router.push(i.url)}
                >
                  <i.icon/>
                  {i.title}
                </DropdownMenuItem>
              ))}
              {user.role === Role.Admin && (
                <>
                  <Separator/>
                  {adminItems.map((i) => (
                    <DropdownMenuItem
                      key={i.title}
                      onClick={() => router.push(i.url)}
                    >
                      <i.icon/>
                      {i.title}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <Separator/>
              <DropdownMenuItem onClick={logout}>
                <LogOut/>
                Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDialogState("authentication")}
          >
            <LogIn className="h-[1.2rem] w-[1.2rem]"/>
          </Button>
        )}
      </div>

      <AuthenticationDialog
        open={dialogState === "authentication"}
        closeDialog={closeDialog}
      />

    </header>
  );
}
