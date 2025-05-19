import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {
  AddRoomDocument,
  AddRoomMutation,
  Building,
  Room,
  UpdateRoomDocument,
  UpdateRoomMutation
} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";


interface RoomFormProps {
  room: Room;
  currentBuilding: Building;
  buildings: Building[];
  closeDialog: () => void;
  refreshTable: () => Promise<void>;
  createMode: boolean;
}

export default function EditRoomForm({room, currentBuilding, closeDialog, refreshTable, createMode = false}: RoomFormProps) {
  const {sid} = useUser()
  const roomFormSchema = z.object({
    buildingID: z.coerce.number(),
    number: z.string().min(1, {
      message: "Bitte gib die Raumnummer an",
    }),
    name: z.string().optional(),
    floor: z.coerce.number().optional(),
    capacity: z.coerce.number().optional(),
  });
  const form = useForm<z.infer<typeof roomFormSchema>>({
    resolver: zodResolver(roomFormSchema),
    // TODO: undefined is probably not usable here
    defaultValues: {
      buildingID: currentBuilding.ID,
      number: createMode ? "" : room.number,
      name: createMode ? "" : room.name ?? "",
      capacity: createMode ? 0 : room.capacity ?? undefined,
      floor: createMode ? 0 :room.floor ?? undefined,
    },

  });

  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  async function onValidSubmit(roomData: z.infer<typeof roomFormSchema>) {
    const client = getClient(String(sid));
    console.log(roomData)

    if(createMode) {
      await client.request<AddRoomMutation>(AddRoomDocument, {room: roomData})
    } else {
      await client.request<UpdateRoomMutation>(UpdateRoomDocument, {room: roomData})
    }

    void refreshTable();
    closeDialog();
    toast.info(createMode ? 'Raum wurde erfolgreich hinzugefügt' : "Raum wurde erfolgreich bearbeitet")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <div className={'flex justify-between w-full flex-wrap gap-x-4'}>
          <FormItem className={'flex-grow'}>
            <FormLabel>Gebäude</FormLabel>
            <Input placeholder={currentBuilding.name} disabled/>
          </FormItem>

          <FormField
            control={form.control}
            name="number"
            render={({field}) => (
              <FormItem className={'flex-grow-[0.75]'}>
                <FormLabel>Raumnummer</FormLabel>
                <FormControl>
                  <Input placeholder={room.number} {...field} disabled={!createMode}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Seminarraum" {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="floor"
          render={({field}) => (
            <FormItem>
              <FormLabel>Stockwerk</FormLabel>
              <FormControl>
                <Input placeholder="1" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacity"
          render={({field}) => (
            <FormItem>
              <FormLabel>Kapazität</FormLabel>
              <FormControl>
                <Input placeholder="20" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <div className={'flex justify-between items-center gap-x-12 mt-8'}>
          <Button
            onClick={closeDialog}
            variant={"outline"}
            /* else this is treated as submit button */
            type={"button"}
            className={'flex-grow-[0.5]'}
          >
            Abbrechen
          </Button>

          <Button
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
            className={'flex-grow'}
          >
            <Save/>
            Speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
