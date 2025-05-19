import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {Room, UpdateRoomDocument, UpdateRoomMutation} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";


interface RoomFormProps {
  room: Room;
  closeDialog:  () => void;
}

export default function EditRoomForm({room, closeDialog}: RoomFormProps) {
  const { sid } = useUser();

  const roomFormSchema = z.object({
    name: z.string().optional(),
    number: z.string().min(1, {
      message: "Bitte gib die Raum-Nummer an",
    }),
    capacity: z.coerce.number().optional(),
    floor: z.coerce.number().optional(),
  });
  const form = useForm<z.infer<typeof roomFormSchema>>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: room.name ? room.name : undefined,
      number: room.number,
      capacity: room.capacity ? room.capacity : undefined,
      floor: room.floor ? room.floor : undefined,
    },
  });

  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  async function onValidSubmit(roomData: z.infer<typeof roomFormSchema>) {
    const client = getClient(String(sid));
    await client.request<UpdateRoomMutation>(UpdateRoomDocument, roomData)
    closeDialog();
    toast.info('Raum wurde erfolgreich bearbeitet')
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))} className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel >Name</FormLabel>
                <FormControl>
                  <Input placeholder="Seminarraum" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raumnummer</FormLabel>
                <FormControl>
                  <Input placeholder="3.120" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stockwerk</FormLabel>
                <FormControl>
                  <Input placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kapazität</FormLabel>
                <FormControl>
                  <Input placeholder="20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* FIXME: add gap */}
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
