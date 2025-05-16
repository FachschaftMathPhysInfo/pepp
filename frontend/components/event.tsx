"use client";

import { defaultRoom, defaultTutorial, defaultUser } from "@/types/defaults";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AddStudentApplicationForEventMutation,
  AddStudentRegistrationForTutorialDocument,
  AddStudentRegistrationForTutorialMutationVariables,
  DeleteStudentRegistrationForTutorialDocument,
  DeleteStudentRegistrationForTutorialMutation,
  DeleteStudentRegistrationForTutorialMutationVariables,
  Tutorial,
  TutorialAvailabilitysDocument,
  TutorialAvailabilitysQuery,
  TutorialAvailabilitysQueryVariables,
  User,
} from "@/lib/gql/generated/graphql";
import { MoreVertical, Plus } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { MailLinkWithLabel } from "@/components/email-link";
import { Table, TableBody, TableCell, TableRow } from "./ui/table";
import { useRouter } from "next/navigation";
import {
  ArrowDownToDot,
  Check,
  ChevronsUpDown,
  Loader2,
  Users,
} from "lucide-react";
import {
  AddEventDocument,
  AddEventMutation,
  AddEventMutationVariables,
  Event,
  LabelKind,
  NewEvent,
  Room,
  UmbrellaDurationDocument,
  UmbrellaDurationQuery,
  UmbrellaDurationQueryVariables,
  UpdateEventDocument,
  UpdateEventMutation,
  UpdateEventMutationVariables,
} from "@/lib/gql/generated/graphql";
import React, { useEffect, useState } from "react";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import {
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "./providers";
import { getClient } from "@/lib/graphql";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { cn, extractId, slugify } from "@/lib/utils";
import { defaultEvent } from "@/types/defaults";
import { Switch } from "./ui/switch";
import { BadgePicker } from "./badge-picker";
import { DatePicker } from "./date-picker";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { FullDateDescription } from "./full-date-description";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Checkbox } from "./ui/checkbox";
import { RoomHoverCard } from "./room-hover-card";

const EditEventFormSchema = z.object({
  title: z.string().nonempty({
    message: "Bitte wähle einen Veranstaltungstitel.",
  }),
  date: z.date({ required_error: "Bitte gib ein Datum an." }),
  from: z.string().nonempty({ message: "Bitte gib eine Startzeit an." }),
  to: z.string().nonempty({ message: "Bitte gib eine Endzeit an." }),
  topic: z.string().nonempty({ message: "Bitte wähle ein Thema." }),
  type: z.string().nonempty({ message: "Bitte wähle einen Veranstaltungstyp" }),
  description: z.string(),
  needsTutors: z.boolean(),
});

interface EditEventViewProps {
  event: Event | undefined;
}

export function EditEventView({ event }: EditEventViewProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { sid } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);
  const [umbrella, setUmbrella] = useState<Event>();

  function formatToHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const mergeDateAndTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const mergedDate = new Date(date);
    mergedDate.setHours(hours, minutes, 0, 0);

    return mergedDate;
  };

  function getNewEvent(data: z.infer<typeof EditEventFormSchema>): NewEvent {
    return {
      title: data.title,
      description: data.description,
      topicName: data.topic,
      typeName: data.type,
      needsTutors: data.needsTutors,
      umbrellaID: umbrella?.ID,
      from: mergeDateAndTime(data.date, data.from),
      to: mergeDateAndTime(data.date, data.to),
    };
  }

  const form = useForm<z.infer<typeof EditEventFormSchema>>({
    resolver: zodResolver(EditEventFormSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      date: event ? new Date(event?.from) : new Date(),
      from: event?.from ? formatToHHMM(new Date(event.from)) : "",
      to: event?.to ? formatToHHMM(new Date(event.to)) : "",
      needsTutors: event?.needsTutors ?? false,
      topic: event?.topic.name ?? "",
      type: event?.type.name ?? "",
    },
  });

  const updateEvent = async (data: z.infer<typeof EditEventFormSchema>) => {
    setSaveLoading(true);
    const vars: UpdateEventMutationVariables = {
      event: getNewEvent(data),
      id: event?.ID!,
    };

    const sendData = async () => {
      const client = getClient(sid!);
      try {
        await client.request<UpdateEventMutation>(UpdateEventDocument, vars);
        toast.info(`"${data.title}" erfolgreich gespeichert!`);
      } catch (err) {
        toast.error(
          "Beim Speichern der Veranstaltung ist ein Fehler aufgetreten."
        );
      }
    };
    sendData();
    setSaveLoading(false);
  };

  const newEvent = async (data: z.infer<typeof EditEventFormSchema>) => {
    setSaveLoading(true);

    const vars: AddEventMutationVariables = {
      event: getNewEvent(data),
    };

    const sendData = async () => {
      const client = getClient(sid!);
      try {
        const eventData = await client.request<AddEventMutation>(
          AddEventDocument,
          vars
        );
        toast.info(`"${data.title}" erfolgreich erstellt!`);
        router.push(`${slugify(data.title)}-${eventData.addEvent.ID}`);
      } catch (err) {
        toast.error(
          "Beim Erstellen der Veranstaltung ist ein Fehler aufgetreten."
        );
      }
    };

    sendData();
    setSaveLoading(false);
  };

  useEffect(() => {
    if (event) return;

    const client = getClient();

    const fetchUmbrellaDuration = async () => {
      const vars: UmbrellaDurationQueryVariables = {
        id: extractId(pathname)!,
      };

      try {
        const umbrellaData = await client.request<UmbrellaDurationQuery>(
          UmbrellaDurationDocument,
          vars
        );

        const umbrellaEvent = umbrellaData.umbrellas[0];
        form.reset({ date: new Date(umbrellaEvent.from) });

        setUmbrella({ ...defaultEvent, ...umbrellaEvent });
      } catch {
        toast.error("Fehler beim Laden des Zeitrahmens für die Veranstaltung.");
      }
    };

    fetchUmbrellaDuration();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(event ? updateEvent : newEvent)}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        className="disabled:border-none disabled:cursor-text border-dashed border-b-2 w-full bg-transparent focus:outline-none"
                        placeholder="Veranstaltungstitel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogTitle>
            <DialogDescription className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextareaAutosize
                        placeholder="Beschreibung der Veranstaltung"
                        className="disabled:cursor-text w-full bg-transparent resize-none focus:outline-none border-dashed border-b-2 disabled:border-none pb-1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-x-2 flex flex-row">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BadgePicker
                          kind={LabelKind.Topic}
                          labelKindDescription="Thema"
                          selected={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BadgePicker
                          kind={LabelKind.EventType}
                          labelKindDescription="Veranstaltungstyp"
                          selected={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-row justify-between space-x-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          disabled={(date) =>
                            date < new Date(umbrella?.from) ||
                            date > new Date(umbrella?.to)
                          }
                        />
                      </FormControl>
                      <FormDescription>Datum der Veranstaltung</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-row space-x-2">
                  <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input aria-label="Time" type="time" {...field} />
                        </FormControl>
                        <FormDescription>Von</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input aria-label="Time" type="time" {...field} />
                        </FormControl>
                        <FormDescription>Bis</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          {event && (
            <TutorialsTable
              event={event!}
              capacities={
                event?.tutorials?.map((t) => t.room.capacity ?? 1) || []
              }
              edit={true}
            />
          )}
          <FormField
            control={form.control}
            name="needsTutors"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex flex-row space-x-2 mt-10">
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Benötigt Tutoren
                    </p>
                  </div>
                </FormControl>
                <FormDescription>
                  Personen können sich für diese Veranstaltung als verfügbare/r
                  Tutor/in eintragen.
                </FormDescription>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" variant="secondary" disabled={saveLoading}>
              {event ? (
                <>
                  <Save className="h-4 w-4" />
                  Speichern
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Hinzufügen
                </>
              )}
            </Button>
            {event && (
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            )}
          </DialogFooter>
        </div>
      </form>
    </Form>
  );
}

interface EventDescriptionProps {
  event: Event | undefined;
}

export function EventDescription({ event }: EventDescriptionProps) {
  return (
    <div className="space-y-2">
      <p>{event?.description}</p>
      <div className="space-x-2 flex flex-row">
        <Badge variant="event" color={event?.topic.color || ""}>
          {event?.topic.name}
        </Badge>
        <Badge variant="event" color={event?.type.color || ""}>
          {event?.type.name}
        </Badge>
      </div>
      {event && (
        <FullDateDescription
          from={new Date(event.from)}
          to={new Date(event.to)}
        />
      )}
    </div>
  );
}

interface RoomSelectionProps {
  selectedRoom: Room | undefined;
  onSelectedRoomChangeAction: (room: Room | undefined) => void;
  groupedRooms: { [key: string]: Room[] };
}

export function RoomSelection({
  selectedRoom,
  onSelectedRoomChangeAction,
  groupedRooms,
}: RoomSelectionProps) {
  const [open, setOpen] = useState(false);

  const rooms = structuredClone(groupedRooms);
  if (selectedRoom) {
    const buildingID = selectedRoom.building.ID;
    if (!rooms[buildingID]) {
      rooms[buildingID] = [];
    }
    rooms[buildingID].push(selectedRoom);
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit h-fit space-x-2"
        >
          {selectedRoom ? (
            <div className="flex flex-col items-start">
              <p className="text-xs text-muted-foreground">
                {selectedRoom?.building.name}
              </p>
              <p>
                {selectedRoom?.name ? selectedRoom.name : selectedRoom?.number}
              </p>
            </div>
          ) : (
            <p>Raum wählen...</p>
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Raum oder Gebäude..." />
          <CommandList>
            <CommandEmpty>Keinen Raum gefunden.</CommandEmpty>
            {Object.keys(rooms).map((bID) => {
              const building = rooms[bID][0].building;
              return (
                <CommandGroup key={bID} heading={building.name}>
                  {rooms[bID].map((room) => (
                    <CommandItem
                      key={room.number + room.building.ID}
                      value={
                        room.number +
                        room.name +
                        room.building.name +
                        room.building.city +
                        room.building.street +
                        room.building.zip +
                        room.building.number
                      }
                      onSelect={() => {
                        onSelectedRoomChangeAction(room);
                        setOpen(false);
                      }}
                    >
                      {room.name ? room.name : room.number}
                      <div className="text-xs text-muted-foreground flex flex-row space-x-2 ml-2">
                        {room.name && (
                          <div className="flex flex-row">
                            <ArrowDownToDot className="h-4 w-4" />
                            {room.number}
                          </div>
                        )}
                        {room.capacity && (
                          <div className="flex flex-row">
                            <Users className="h-4 w-4 mr-1" />
                            {room.capacity}
                          </div>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          room === selectedRoom ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface TutorialsTableProps {
  capacities: number[];
  edit: boolean;
  event: Event;
}

export function TutorialsTable({
  event,
  capacities,
  edit,
}: TutorialsTableProps) {
  const router = useRouter();

  const { user, setUser, sid } = useUser();
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState<Tutorial | undefined>();
  const [usersTutorials, setUsersTutorials] = useState<Tutorial[]>();
  const [cap, setCap] = useState<number[]>(capacities);
  const [availableTutors, setAvailableTutors] = useState<User[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<(Room | undefined)[]>([]);
  const [tuts, setTuts] = useState<Tutorial[]>(event.tutorials ?? []);
  const [newTutorialTutors, setNewTutorialTutors] = useState<User[]>([]);
  const [newTutorialRoom, setNewTutorialRoom] = useState<Room>();

  useEffect(() => {
    if (!user) return;
    setRegistration(user.registrations?.find((r) => r.event.ID === event.ID));
    setUsersTutorials(user.tutorials?.filter((t) => t.event.ID === event.ID));
  }, [user]);

  const groupRoomsByBuildingID = () => {
    return availableRooms.reduce((acc, room) => {
      const buildingID = room.building.ID;
      if (!acc[buildingID]) {
        acc[buildingID] = [];
      }
      acc[buildingID].push(room);
      return acc;
    }, {} as { [key: string]: Room[] });
  };

  useEffect(() => {
    if (!edit) return;

    const fetchData = async () => {
      const client = getClient(sid!);

      const vars: TutorialAvailabilitysQueryVariables = {
        id: event.ID,
      };

      const eventData = await client.request<TutorialAvailabilitysQuery>(
        TutorialAvailabilitysDocument,
        vars
      );

      setAvailableTutors(
        eventData.events[0].tutorsAvailable?.map((t) => ({
          ...defaultUser,
          ...t,
        })) ?? []
      );

      if (event.tutorials) {
        setSelectedRooms(event.tutorials.map((t) => t.room));
      }

      setAvailableRooms(
        eventData.events[0].roomsAvailable?.map((r) => ({
          ...defaultRoom,
          ...r,
        })) ?? []
      );
    };

    fetchData();
  }, [edit]);

  const registerForEvent = async (tutorial: Tutorial) => {
    const client = getClient(sid!);

    const vars: AddStudentRegistrationForTutorialMutationVariables = {
      registration: {
        tutorialID: tutorial.ID,
        userMail: user!.mail,
      },
    };

    try {
      await client.request<AddStudentApplicationForEventMutation>(
        AddStudentRegistrationForTutorialDocument,
        vars
      );
    } catch {
      toast.error(
        `Beim Eintragen in eine Veranstaltung aus "${event.title}" ist ein Fehler aufgetreten.`
      );
    }
  };

  const unregisterFromEvent = async (tutorial: Tutorial) => {
    const client = getClient(sid!);

    const vars: DeleteStudentRegistrationForTutorialMutationVariables = {
      registration: {
        tutorialID: tutorial.ID,
        userMail: user!.mail,
      },
    };

    try {
      await client.request<DeleteStudentRegistrationForTutorialMutation>(
        DeleteStudentRegistrationForTutorialDocument,
        vars
      );
    } catch (err) {
      toast.error(
        `Beim Austragen aus einer Veranstaltung in "${event.title}" ist ein Fehler aufgetreten.`
      );
      console.log(err);
    }
  };

  const isSameTutorial = (first: Tutorial, second: Tutorial) => {
    return (
      first.room.number === second.room.number &&
      first.room.building.ID === second.room.building.ID
    );
  };

  const handleRegistrationChange = async (tutorial: Tutorial) => {
    setLoading(true);

    if (registration) {
      if (isSameTutorial(tutorial, registration)) {
        await unregisterFromEvent(registration);

        setUser({
          ...user!,
          registrations: user?.registrations?.filter(
            (r) => r.event.ID !== tutorial.event.ID
          ),
        });

        setTuts(
          tuts.map((t) => {
            if (isSameTutorial(t, tutorial)) {
              t.registrationCount -= 1;
            }
            return t;
          })
        );
      } else {
        await unregisterFromEvent(registration);
        await registerForEvent(tutorial);

        setUser({
          ...user!,
          registrations: user!.registrations?.map((t) => {
            if (t.event.ID === tutorial.event.ID) {
              t = tutorial;
            }
            return t;
          }),
        });

        setTuts(
          tuts.map((t) => {
            if (isSameTutorial(t, tutorial)) {
              t.registrationCount += 1;
            } else if (isSameTutorial(t, registration)) {
              t.registrationCount -= 1;
            }
            return t;
          })
        );
      }
    } else {
      await registerForEvent(tutorial);

      setUser({
        ...user!,
        registrations: (user!.registrations || []).concat(tutorial),
      });

      setTuts(
        tuts.map((t) => {
          if (isSameTutorial(t, tutorial)) {
            t.registrationCount += 1;
          }
          return t;
        })
      );
    }

    setLoading(false);
  };

  const handleAvailableRoomsChange = (
    newRoom: Room | undefined,
    oldRoom: Room | undefined
  ) => {
    if (newRoom !== oldRoom) {
      setAvailableRooms((prev) => {
        const newRooms = prev.filter(
          (r) =>
            !(
              r.number === newRoom?.number &&
              r.building.ID === newRoom?.building.ID
            )
        );
        if (oldRoom) {
          newRooms.push(oldRoom);
        }
        return newRooms;
      });
    } else if (oldRoom) {
      setAvailableRooms((prev) => [...prev, oldRoom]);
    }
  };

  const groupedRooms = groupRoomsByBuildingID();

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableBody>
          {tuts.length ? (
            <>
              {tuts.map((e, i) => {
                const capacity = cap[i];
                const utilization = (e.registrationCount / capacity) * 100;
                const isRegisteredEvent =
                  e.room.number === registration?.room.number &&
                  e.room.building.ID === registration?.room.building.ID;
                const isTutor = usersTutorials?.find(
                  (t) =>
                    t.room.number === e.room.number &&
                    t.room.building.ID === e.room.building.ID
                )
                  ? true
                  : false;

                return (
                  <TableRow key={e.room?.number} className="relative">
                    <div
                      className="light:hidden absolute inset-0 z-0"
                      style={{
                        width: `${utilization}%`,
                        backgroundColor: `${
                          utilization < 100 ? "#024b30" : "#8b0000"
                        }`,
                      }}
                    />
                    <div
                      className="dark:hidden absolute inset-0 z-0"
                      style={{
                        width: `${utilization}%`,
                        backgroundColor: `${
                          utilization < 100 ? "#BBF7D0" : "#FECACA"
                        }`,
                      }}
                    />
                    <TableCell className="relative z-1">
                      {edit ? (
                        <TutorSelection
                          selectedTutors={e.tutors!}
                          availableTutors={availableTutors}
                          onSelectedTutorsChangeAction={() => {}}
                        />
                      ) : (
                        <>
                          {e.tutors?.map((t) => (
                            <HoverCard key={t.mail}>
                              <HoverCardTrigger asChild>
                                <p className="hover:underline">
                                  {t.fn + " " + t.sn[0] + "."}
                                </p>
                              </HoverCardTrigger>
                              <HoverCardContent>
                                <MailLinkWithLabel
                                  mail={t.mail}
                                  label={t.fn + " " + t.sn}
                                />
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </>
                      )}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {edit ? (
                        <RoomSelection
                          groupedRooms={groupedRooms}
                          selectedRoom={selectedRooms[i]}
                          onSelectedRoomChangeAction={(room) => {
                            const oldRoom = selectedRooms[i];
                            handleAvailableRoomsChange(room, oldRoom);

                            if (room !== oldRoom) {
                              setCap((prev) => {
                                prev[i] = room?.capacity ?? 1;
                                return prev;
                              });
                              setSelectedRooms((prev) => {
                                prev[i] = room;
                                return prev;
                              });
                            } else {
                              setCap((prev) => {
                                prev[i] = 0;
                                return prev;
                              });
                              setSelectedRooms((prev) => {
                                prev[i] = undefined;
                                return prev;
                              });
                            }
                          }}
                        />
                      ) : (
                        <RoomHoverCard room={e.room} />
                      )}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {e.registrationCount}/{capacity !== 0 ? capacity : "?"}
                    </TableCell>
                    <TableCell className="relative z-1">
                      {edit ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Menü öffnen</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Optionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash2 className="h-4 w-4 mr-2" /> Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button
                          className="w-full"
                          disabled={
                            (usersTutorials && !isTutor) ||
                            (!isRegisteredEvent && utilization == 100) ||
                            !user ||
                            loading
                          }
                          variant={
                            isRegisteredEvent && user
                              ? "destructive"
                              : "outline"
                          }
                          onClick={() => {
                            if (isTutor) {
                              router.push(
                                `/profile/tutorials/${slugify(event.title)}-${
                                  event.ID
                                }`
                              );
                            } else {
                              handleRegistrationChange(e);
                            }
                          }}
                        >
                          {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {isTutor
                            ? "Verwalten"
                            : registration && user
                            ? isRegisteredEvent
                              ? "Austragen"
                              : "Wechseln"
                            : "Eintragen"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Für diese Veranstaltung existieren noch keine Anmeldungen.
              </TableCell>
            </TableRow>
          )}
          {edit && (
            <TableRow className="light:bg-gray-100 dark:bg-gray-900">
              <div />
              <TableCell>
                <TutorSelection
                  availableTutors={availableTutors}
                  selectedTutors={newTutorialTutors}
                  onSelectedTutorsChangeAction={(tutor) => {
                    const isSelected = newTutorialTutors.find(
                      (t) => t.mail === tutor.mail
                    )
                      ? true
                      : false;

                    if (isSelected) {
                      setNewTutorialTutors((prev) =>
                        prev.filter((t) => t.mail !== tutor.mail)
                      );
                    } else {
                      setNewTutorialTutors((prev) => [...prev, tutor]);
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <RoomSelection
                  groupedRooms={groupedRooms}
                  selectedRoom={newTutorialRoom}
                  onSelectedRoomChangeAction={(room) => {
                    const oldRoom = newTutorialRoom;

                    handleAvailableRoomsChange(room, oldRoom);

                    if (room !== oldRoom) {
                      if (oldRoom) {
                        setAvailableRooms((prev) => [...prev, oldRoom]);
                      }
                      setNewTutorialRoom(room);
                    } else {
                      setNewTutorialRoom(undefined);
                    }
                  }}
                />
              </TableCell>
              <TableCell colSpan={2}>
                <Button
                  disabled={!newTutorialRoom || !newTutorialTutors.length}
                  onClick={() => {
                    if (newTutorialRoom) {
                      setTuts((prev) => [
                        ...prev,
                        {
                          ...defaultTutorial,
                          tutors: newTutorialTutors,
                          room: newTutorialRoom,
                        },
                      ]);
                    }
                    setCap((prev) => [...prev, newTutorialRoom?.capacity ?? 1]);
                    setSelectedRooms((prev) => [...prev, newTutorialRoom]);
                    setNewTutorialRoom(undefined);
                    setNewTutorialTutors([]);
                  }}
                >
                  <Plus />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface TutorSelectionProps {
  selectedTutors?: User[];
  onSelectedTutorsChangeAction: (tutor: User) => void;
  availableTutors: User[];
}

export function TutorSelection({
  selectedTutors,
  onSelectedTutorsChangeAction,
  availableTutors,
}: TutorSelectionProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(selectedTutors ?? []);

  useEffect(() => {
    setSelected(selectedTutors ?? []);
  }, [selectedTutors]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit h-fit space-x-2"
        >
          {selected.length > 0 ? (
            <div className="flex flex-col items-start">
              {selected.map((t) => (
                <p key={t.mail}>
                  {t.fn} {t.sn}
                </p>
              ))}
            </div>
          ) : (
            <p>Tutor/in wählen...</p>
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Name oder E-Mail..." />
          <CommandList>
            <CommandEmpty>Niemanden gefunden.</CommandEmpty>
            <CommandGroup>
              {availableTutors.map((tutor) => {
                const isSelected = selected.find((t) => t.mail === tutor.mail)
                  ? true
                  : false;
                return (
                  <CommandItem
                    key={tutor.mail}
                    value={tutor.fn + " " + tutor.sn + tutor.mail}
                    onSelect={() => {
                      onSelectedTutorsChangeAction(tutor);

                      if (isSelected) {
                        setSelected((prev) =>
                          prev.filter((t) => t.mail !== tutor.mail)
                        );
                      } else {
                        setSelected((prev) => [...prev, tutor]);
                      }
                    }}
                  >
                    <Checkbox className="mr-2" checked={isSelected} />
                    <div className="flex flex-col">
                      {tutor.fn + " " + tutor.sn}
                      <p className="text-xs text-muted-foreground">
                        {tutor.mail}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
