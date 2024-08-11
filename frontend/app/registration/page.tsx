"use client";

import { useRouter } from "next/navigation";
import {
  QuestionType,
  RegistrationFormDocument,
  RegistrationFormQuery,
  RegistrationFormQueryVariables,
} from "@/lib/gql/generated/graphql";
import { client } from "@/lib/graphClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  searchParams: {
    e: string;
  };
};

const FormSchema = z.object({
  multipleChoice: z
    .array(z.number())
    .refine((value) => value.some((item) => item), {
      message: "Du musst mindestens eins auswählen.",
    }),

  singleChoice: z.number().refine((value) => value !== undefined, {
    message: "Du musst eine Auswahl treffen.",
  }),

  scale: z.number(),
});

const Home = ({ searchParams }: Props) => {
  const [regForm, setForm] = useState<RegistrationFormQuery["forms"][0] | null>(
    null
  );
  const [progressValue, setProgressValue] = useState(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const eventID = searchParams.e;

      const vars: RegistrationFormQueryVariables = {
        eventID: parseInt(eventID),
      };

      await new Promise((resolve) => setTimeout(resolve, 250));

      const data = await client.request<RegistrationFormQuery>(
        RegistrationFormDocument,
        vars
      );

      if (!data.forms.length) {
        router.push("/");
        return;
      }

      setForm(data.forms[0]);
      setLoading(false);
    };

    fetchData();
  }, [searchParams.e, router]);

  useEffect(() => {
    if (regForm) {
      setProgressValue((100 / regForm.questions.length) * (index + 1));
    }
  }, [index, regForm]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      multipleChoice: [],
      singleChoice: undefined,
      scale: 0,
    },
  });

  function handleNextQuestion() {
    setIndex((prevIndex) => prevIndex + 1);
  }

  function handleQuit() {
    router.push("/")
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    alert(JSON.stringify(data, null, 2))
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid h-screen place-items-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div>
            <FormLabel className="text-base">{regForm?.title}</FormLabel>
            <FormDescription>{regForm?.description}</FormDescription>
          </div>
          <Progress value={progressValue} />
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>{regForm?.questions[index].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-8 mb-8">
                {regForm?.questions[index].type ===
                  QuestionType.MultipleChoice && (
                  <FormField
                    control={form.control}
                    name="multipleChoice"
                    render={() => (
                      <FormItem>
                        {regForm?.questions[index].answers.map((answer) => (
                          <FormField
                            key={answer.ID}
                            control={form.control}
                            name="multipleChoice"
                            render={({ field }) => (
                              <FormItem>
                                <div
                                  key={answer.ID}
                                  className="flex items-center space-x-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(answer.ID)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              answer.ID,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== answer.ID
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <Label>{answer.title}</Label>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {regForm?.questions[index].type ===
                  QuestionType.SingleChoice && (
                  <FormField
                    control={form.control}
                    name="singleChoice"
                    render={({ field }) => (
                      <FormItem>
                        <RadioGroup
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(parseInt(value, 10))
                          }
                        >
                          {regForm.questions[index].answers.map((answer) => (
                            <div
                              key={answer.ID}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem value={answer.ID.toString()} />
                              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {answer.title}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {regForm?.questions[index].type === QuestionType.Scale && (
                  <FormField 
                    control={form.control}
                    name="scale"
                    render={({ field }) => (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        {regForm.questions[index].answers[1].title}
                      </span>
                      <span className="text-sm font-medium">
                        {regForm.questions[index].answers[0].title}
                      </span>
                    </div>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={regForm.questions[index].answers[1].points}
                      max={regForm.questions[index].answers[0].points}
                      step={1}
                    />
                  </div>
                    )}
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handleQuit} variant="outline" className="w-auto">
                Abbrechen
              </Button>
              {regForm?.questions.length !== index + 1 ? (
                <Button onClick={handleNextQuestion} className="w-auto">
                  Nächste Frage
                </Button>
              ) : (
                <Button type="submit" className="w-auto">
                  Anmelden
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default Home;
