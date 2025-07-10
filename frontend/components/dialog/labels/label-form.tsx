import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import React, {useEffect, useState} from "react";
import {useUser} from "@/components/providers";
import {getClient} from "@/lib/graphql";
import {
  AddLabelDocument,
  AddLabelMutation,
  Label as Labeltype,
  LabelKind,
  UpdateLabelDocument,
  UpdateLabelMutation,
} from "@/lib/gql/generated/graphql";
import {Save} from "lucide-react";
import {toast} from "sonner";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";

interface LabelFormProps {
  label?: Labeltype;
  closeDialog: () => void;
  mode: "add" | "edit" | null;
  triggerRefetch: () => Promise<void>;
}

export default function LabelForm(props: LabelFormProps) {
  const {sid} = useUser();

  const createMode = props.mode === "add"
  const [color, setColor] = useState<string>(props.label?.color === undefined || props.label?.color === "" ?
    "#AEAEAE" : props.label.color)
  const [labelKind, setLabelKind] = useState<LabelKind>(props.label?.kind ?? LabelKind.Topic)
  const labelFormSchema = z.object({
    name: z.string().nonempty({
      message: "Bitte gib dem Label einen Namen",
    }),
    color: z.string().regex(
      new RegExp("^#([A-Fa-f0-9]{6})$"), "Bitte gültigen HEX-Code angeben"
    )
  });
  const form = useForm<z.infer<typeof labelFormSchema>>({
    resolver: zodResolver(labelFormSchema),
    defaultValues: {
      name: createMode ? "" : props.label?.name ?? "",
      color: color
    },
  });
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);

  useEffect(() => {
    setColor(form.getValues("color"))
  }, [form])

  async function onValidSubmit(
    labelData: z.infer<typeof labelFormSchema>
  ) {
    const client = getClient(String(sid));
    const newLabel = {
      name: labelData.name,
      color: color,
      kind: labelKind,
    };

    if (createMode) {
      try {
        await client.request<AddLabelMutation>(AddLabelDocument, {
          label: newLabel,
        });
      } catch (e) {
        toast.error('Label konnte nicht erstellt werden');
        console.error("Failed creating label: ", e);
      }
    } else {
      try {
        await client.request<UpdateLabelMutation>(UpdateLabelDocument, {
          id: props.label?.ID,
          label: newLabel,
        });

        toast.success(
          createMode
            ? "Label wurde erfolgreich erstellt"
            : "Label wurde erfolgreich bearbeitet"
        );
      } catch (e) {
        toast.error('Label konnte nicht geupdated werden');
        console.error("Failed updating label: ", e);
      }
    }

    void props.triggerRefetch();
    props.closeDialog();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onValidSubmit, () =>
          setHasTriedToSubmit(true)
        )}
        className="space-y-4 w-full"
      >

        {createMode && (
          <FormItem className={"flex-grow"}>
            <FormLabel>Typ</FormLabel>
            <FormControl>
              <RadioGroup
                defaultValue={labelKind}
                className={'flex space-x-12'}
                onValueChange={(value) => setLabelKind(value as LabelKind)}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={LabelKind.Topic} id="r1"/>
                  <Label htmlFor="r1">Thema</Label>
                </div>
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={LabelKind.EventType} id="r2"/>
                  <Label htmlFor="r2">Event-Art</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage/>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem className={"flex-grow"}>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder={props.label?.name ?? 'Label Name'} {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({field}) => (
            <FormItem className={"flex-grow"}>
              <FormLabel>Farbe</FormLabel>
              <FormControl>
                <div className={'flex space-x-8 items-center'}>
                  <div className={'h-full min-h-9 aspect-square flex-shrink-0'}>
                    <input
                      type={"color"}
                      value={color}
                      onChange={e => {
                        const newColor = e.target.value.toUpperCase();
                        setColor(newColor);
                        form.setValue("color", newColor);
                      }}
                      className={'w-full h-full rounded-lg m-0'}
                    />
                  </div>
                  <Input
                    type="text"
                    {...field}
                    value={field.value.toUpperCase()}
                    onChange={(e) => {
                      field.onChange(e);
                      setColor(e.target.value.toUpperCase());
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <div className={"flex justify-between items-center gap-x-12 mt-8"}>
          <Button
            onClick={props.closeDialog}
            variant={"outline"}
            /* else this is treated as submit button */
            type={"button"}
            className={"flex-grow-[0.5]"}
          >
            Abbrechen
          </Button>

          <Button
            disabled={!form.formState.isValid && hasTriedToSubmit}
            type="submit"
            className={"flex-grow"}
          >
            <Save/>
            Speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
