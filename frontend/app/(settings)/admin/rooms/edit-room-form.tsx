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


interface RoomFormProps {
  room: Room;
}

export default function EditRoomForm({room}: RoomFormProps) {
  const { sid } = useUser();

  const roomFormSchema = z.object({
    name: z.string().optional(),
    number: z.string().min(1, {
      message: "Bitte gib die Raum-Nummer an",
    }),
    capacity: z.number().optional(),
    floor: z.number().optional(),
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
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))} className="space-y-6 w-full">
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
          <Button
            className="w-full"
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
          >
            Bestätigen
          </Button>
        </form>
      </Form>
  );
}
