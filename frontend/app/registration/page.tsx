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
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type Props = {
  searchParams: {
    e: string;
  };
};

const SingleChoiceFormSchema = z.object({
  singleChoice: z.number({
    required_error: "Bitte wähle eine Option",
  }),
});

const MultipleChoiceFormSchema = z.object({
  multipleChoice: z
    .array(z.number())
    .refine((value) => value.some((item) => item), {
      message: "Bitte triff eine Auswahl",
    }),
});

const Home = ({ searchParams }: Props) => {
  const [regForm, setForm] = useState<RegistrationFormQuery["forms"][0] | null>(
    null
  );
  const [progressValue, setProgressValue] = useState(0);
  const [sliderValue, setSliderValue] = useState<number>(0);
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
      setProgressValue((100 / (regForm.questions.length - 1)) * index);
    }
  }, [index, regForm]);

  const mcForm = useForm<z.infer<typeof MultipleChoiceFormSchema>>({
    resolver: zodResolver(MultipleChoiceFormSchema),
    defaultValues: {
      multipleChoice: [],
    },
  });

  const scForm = useForm<z.infer<typeof SingleChoiceFormSchema>>({
    resolver: zodResolver(SingleChoiceFormSchema),
    defaultValues: {
      singleChoice: undefined,
    },
  });

  function handleQuit() {
    router.push("/");
  }

  const FooterButtons = () => (
    <div className="flex justify-between w-full">
      <Button onClick={handleQuit} variant="outline" className="w-auto">
        Abbrechen
      </Button>
      <Button type="submit" className="w-auto">
        {regForm?.questions.length !== index + 1 ? "Nächste Frage" : "Anmelden"}
      </Button>
    </div>
  );

  function onSubmit() {
    if (regForm?.questions.length !== index + 1) {
      setIndex((prevIndex) => prevIndex + 1);
    }
  }

  function onScaleSubmit() {
    onSubmit();
    setSliderValue(0);
  }

  function onMCSubmit(data: z.infer<typeof MultipleChoiceFormSchema>) {
    onSubmit();
  }

  function onSCSubmit(data: z.infer<typeof SingleChoiceFormSchema>) {
    onSubmit();
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid h-screen place-items-center">
      <div className="space-y-5">
        <div>
          <h1>{regForm?.title}</h1>
          <p className="text-sm text-muted-foreground">
            {regForm?.description}
          </p>
        </div>
        <Progress value={progressValue} />
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>{regForm?.questions[index].title}</CardTitle>
          </CardHeader>
          {regForm?.questions[index].type === QuestionType.MultipleChoice && (
            <Form {...mcForm}>
              <form onSubmit={mcForm.handleSubmit(onMCSubmit)}>
                <CardContent>
                  <div className="mt-8 mb-8">
                    <FormField
                      control={mcForm.control}
                      name="multipleChoice"
                      render={() => (
                        <FormItem>
                          {regForm?.questions[index].answers.map((answer) => (
                            <FormField
                              key={answer.ID}
                              control={mcForm.control}
                              name="multipleChoice"
                              render={({ field }) => (
                                <FormItem>
                                  <div
                                    key={answer.ID}
                                    className="flex items-center space-x-2"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(
                                          answer.ID
                                        )}
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
                  </div>
                </CardContent>
                <CardFooter>
                  <FooterButtons />
                </CardFooter>
              </form>
            </Form>
          )}

          {regForm?.questions[index].type === QuestionType.SingleChoice && (
            <Form {...scForm}>
              <form onSubmit={scForm.handleSubmit(onSCSubmit)}>
                <CardContent>
                  <div className="mt-8 mb-8">
                    <FormField
                      control={scForm.control}
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
                  </div>
                </CardContent>
                <CardFooter>
                  <FooterButtons />
                </CardFooter>
              </form>
            </Form>
          )}

          {regForm?.questions[index].type === QuestionType.Scale && (
            <form onSubmit={onScaleSubmit}>
              <CardContent>
                <div className="mt-8 mb-8 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      {regForm.questions[index].answers[1].title}
                    </span>
                    <span className="text-sm font-medium">
                      {regForm.questions[index].answers[0].title}
                    </span>
                  </div>
                  <Slider
                    value={[sliderValue]}
                    onValueChange={(value) => setSliderValue(value[0])}
                    min={regForm.questions[index].answers[1].points}
                    max={regForm.questions[index].answers[0].points}
                    step={1}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <FooterButtons />
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Home;