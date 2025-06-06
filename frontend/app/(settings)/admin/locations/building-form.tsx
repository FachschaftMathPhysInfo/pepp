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
  AddBuildingDocument,
  AddBuildingMutation,
  Building,
  UpdateBuildingDocument,
  UpdateBuildingMutation
} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";


interface RoomFormProps {
  currentBuilding: Building;
  closeDialog: () => void;
  refreshTable: () => Promise<void>;
  createMode: boolean;
}

export default function BuildingForm({currentBuilding, closeDialog, refreshTable, createMode = false}: RoomFormProps) {
  const {sid} = useUser()
  const buildingFormSchema = z.object({
    name: z.string().nonempty("Bitte gib einen Namen an"),
    street: z.string().nonempty("Bitte gib die Straße an"),
    number: z.string().nonempty("Bitte gib die Hausnummer an"),
    city: z.string().nonempty("Bitte gib die Stadt an"),
    zip: z.string().nonempty("Bitte gib die Postleitzahl an"),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    zoomLevel: z.coerce.number({
      required_error: "Please enter a zoom level"
    })
  });
  const form = useForm<z.infer<typeof buildingFormSchema>>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: {
      name: createMode ? "" : currentBuilding.name,
      street: createMode ? "": currentBuilding.street,
      number: createMode ? "" : currentBuilding.number,
      city: createMode ? "" : currentBuilding.city,
      zip: createMode ? "" : currentBuilding.zip,
      latitude: createMode ? undefined : currentBuilding.latitude,
      longitude: createMode ? undefined : currentBuilding.longitude,
      zoomLevel: createMode ? 1 : currentBuilding.zoomLevel
    },

  });

  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  async function onValidSubmit(buildingData: z.infer<typeof buildingFormSchema>) {
    const client = getClient(String(sid));

    if(createMode) {
      await client.request<AddBuildingMutation>(AddBuildingDocument, {building: buildingData})
    } else {
      await client.request<UpdateBuildingMutation>(UpdateBuildingDocument, {buildingID: currentBuilding.ID, building: buildingData})
    }

    void refreshTable();
    closeDialog();
    toast.info(createMode ? 'Gebäude wurde erfolgreich hinzugefügt' : "Gebäude wurde erfolgreich bearbeitet")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onValidSubmit, () => setHasTriedToSubmit(true))}
            className="space-y-4 w-full">

        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field}/>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <div className={'flex justify-between w-full flex-wrap gap-x-4'}>
          <FormField
            control={form.control}
            name="city"
            render={({field}) => (
              <FormItem
                className={'grow'}
              >
                <FormLabel>Stadt</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip"
            render={({field}) => (
              <FormItem
                className={'w-28'}
              >
                <FormLabel>Postleitzahl</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>
        <div className={'flex justify-between w-full flex-wrap gap-x-4'}>
          <FormField
            control={form.control}
            name="street"
            render={({field}) => (
              <FormItem
                className={'grow'}
              >
                <FormLabel>Straße</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({field}) => (
              <FormItem
                className={'w-24'}
              >
                <FormLabel>Hausnummer</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          />
        </div>

        <div className={'border border-input rounded-lg p-4 pt-2 !mt-6'}>
          <h2 className={'w-full text-center mb-4'}>Open Street Map</h2>

          <div className={'flex justify-between w-full flex-wrap gap-x-4 mb-4'}>
            <FormField
              control={form.control}
              name="latitude"
              render={({field}) => (
                <FormItem
                  className={'grow'}
                >
                  <FormLabel>Breitengrad</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({field}) => (
                <FormItem
                  className={'grow'}
                >
                  <FormLabel>Längengrad</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

          </div>

          <FormField
            control={form.control}
            name="zoomLevel"
            render={({field}) => (
              <FormItem>
                <FormLabel>Zoom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage/>
              </FormItem>
            )}
          /></div>


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
