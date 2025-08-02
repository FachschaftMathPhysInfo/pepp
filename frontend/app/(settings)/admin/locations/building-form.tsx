import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useState, useEffect, use} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {
  AddBuildingDocument,
  AddBuildingMutation,
  Building,
  UpdateBuildingDocument,
  UpdateBuildingMutation
} from "@/lib/gql/generated/graphql";
import {Save, ExternalLink} from "lucide-react";
import {toast} from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import exp from "constants";


interface RoomFormProps {
  currentBuilding: Building;
  closeDialog: () => void;
  refreshTable: () => Promise<void>;
  createMode: boolean;
}
  

 const baseFormSchema = z.object({
    name: z.string().optional(),
    street: z.string().nonempty("Bitte gib die Straße an"),
    number: z.string().nonempty("Bitte gib die Hausnummer an"),
    city: z.string().nonempty("Bitte gib die Stadt an"),
    zip: z.string().nonempty("Bitte gib die Postleitzahl an"),
  });

  const ossLinkFormSchema = baseFormSchema.extend({
    ossLink: z.string()
      .url("Bitte gib einen gültigen OpenStreetMap-Link an")
      .regex(/^https:\/\/www\.openstreetmap\.org\/\S+$/, "Bitte gib einen gültigen OpenStreetMap-Link an")
      .or(z.literal("")) 
      .optional(),
  });

  const coordinatesFormSchema = baseFormSchema.extend({
    latitude: z.coerce
      .number()
      .min(-90,  "Latitude must be ≥ -90")
      .max( 90,  "Latitude must be ≤ +90")
      .or(z.literal("")) 
      .optional(),
    longitude: z.coerce
      .number()
      .min(-180, "Longitude must be ≥ -180")
      .max( 180, "Longitude must be ≤ +180")
      .or(z.literal("")) 
      .optional(),
    zoomLevel: z.coerce.number().optional(),
  });

  export default function BuildingForm({currentBuilding, closeDialog, refreshTable, createMode = false}: RoomFormProps) {
  const {sid} = useUser();
  const [locationType, setLocationType] = useState("ossLink");
  const useOssLink = locationType === "ossLink";
  
  const generateOSSLink = (latitude: number, longitude: number, zoomLevel: number) => {
    if (latitude === undefined || longitude === undefined || zoomLevel === undefined) { 
      return "";
    } 
    return `https://www.openstreetmap.org/#map=${zoomLevel}/${latitude}/${longitude}`;
  };
  const buildingFormSchema = useOssLink ? ossLinkFormSchema : coordinatesFormSchema;
  const form = useForm<z.infer<typeof buildingFormSchema>>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: getFormDefaults(),
  });
   function getFormDefaults() {
    const baseDefaults = {
      name: createMode ? "" : currentBuilding.name,
      street: createMode ? "" : currentBuilding.street,
      number: createMode ? "" : currentBuilding.number,
      city: createMode ? "" : currentBuilding.city,
      zip: createMode ? "" : currentBuilding.zip,
    };
    if (useOssLink) {
      const ossLink = (!createMode && currentBuilding.latitude && currentBuilding.longitude)
        ? generateOSSLink(currentBuilding.latitude, currentBuilding.longitude, currentBuilding.zoomLevel)
        : "";
      return {...baseDefaults, ossLink};
    } else {
      return {
        ...baseDefaults,
        latitude: createMode ? undefined : currentBuilding.latitude,
        longitude: createMode ? undefined : currentBuilding.longitude,
        zoomLevel: createMode ? undefined : currentBuilding.zoomLevel,
      };
    }
  }
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

useEffect(() => {
    form.reset(getFormDefaults());
    setHasTriedToSubmit(false);
  }, [locationType, createMode, currentBuilding]);

  function getCoordinatesFromOssLink(link: string): { latitude?: number; longitude?: number; zoomLevel?: number } {
    if (!link) return {};

    const match = link.match(/#map=(\d+\.?\d*)\/(\d+\.?\d*)\/(\d+\.?\d*)/);
    if (match) {
      return {
        zoomLevel: parseFloat(match[1]),
        latitude: parseFloat(match[2]),
        longitude: parseFloat(match[3]),
      };
    }
    return {};
  }

async function onValidSubmit(formData: z.infer<typeof buildingFormSchema>) {
    const client = getClient(String(sid));
    
    let buildingData: any = {
      name: formData.name,
      street: formData.street,
      number: formData.number,
      city: formData.city,
      zip: formData.zip,
    };

    if (useOssLink && 'ossLink' in formData) {
      const coords = getCoordinatesFromOssLink(formData.ossLink ?? "");
      buildingData.latitude = coords.latitude;
      buildingData.longitude = coords.longitude;
      buildingData.zoomLevel = coords.zoomLevel;
    } else if (!useOssLink && 'latitude' in formData && 'longitude' in formData) {
      buildingData.latitude = formData.latitude;
      buildingData.longitude = formData.longitude;
      buildingData.zoomLevel = formData.zoomLevel;
    }

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
           <Tabs 
            defaultValue="ossLink" 
            value={locationType} 
            onValueChange={setLocationType}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="ossLink">OSS Link</TabsTrigger>
              <TabsTrigger value="coordinates">Koordinaten</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ossLink">
              <FormField
                control={form.control}
                name="ossLink"
                render={({field}) => (
                  <FormItem className={'grow'}>
                    <FormLabel>OpenStreetMap Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.openstreetmap.org/..." {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="coordinates">
              <div className={'flex justify-between w-full flex-wrap gap-x-4 mb-4'}>
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({field}) => (
                    <FormItem className={'grow'}>
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
                    <FormItem className={'grow'}>
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
              />
            </TabsContent>
          </Tabs>
        </div>


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
