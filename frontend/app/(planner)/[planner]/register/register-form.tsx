"use client";

import {usePathname, useRouter} from "next/navigation";
import {
  AddStudentApplicationForEventDocument,
  AddStudentApplicationForEventMutation,
  AddStudentApplicationForEventMutationVariables,
  CheckExistingApplicationDocument,
  CheckExistingApplicationQuery,
  NewQuestionResponsePair,
  NewUserToEventApplication,
  QuestionType,
  RegistrationFormDocument,
  RegistrationFormQuery,
  RegistrationFormQueryVariables,
} from "@/lib/gql/generated/graphql";
import {getClient} from "@/lib/graphql";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Slider} from "@/components/ui/slider";
import {Label} from "@/components/ui/label";
import {Checkbox} from "@/components/ui/checkbox";
import {Progress} from "@/components/ui/progress";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage,} from "@/components/ui/form";
import {toast} from "sonner";
import {extractId} from "@/lib/utils";
import {AuthenticationDialog} from "@/components/dialog/authentication/authentication-dialog";
import {DialogClose, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {LogIn} from "lucide-react";
import {CardSkeleton} from "@/components/card-skeleton";
import {useUser} from "@/components/provider/user-provider";

const SingleChoiceFormSchema = (required: boolean) =>
  z.object({
    singleChoice: required
      ? z.number({
        required_error: "Bitte wähle eine Option",
      })
      : z.number().optional(),
  });

const MultipleChoiceFormSchema = (required: boolean) =>
  z.object({
    multipleChoice: required
      ? z.array(z.number()).refine((value) => value.some((item) => item), {
        message: "Bitte triff eine Auswahl",
      })
      : z.array(z.number()).optional(),
  });

interface RegisterFormProps {
  modal?: boolean;
}

export default function RegisterForm({modal}: RegisterFormProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {user, sid} = useUser();

  const [regForm, setForm] = useState<RegistrationFormQuery["forms"][0] | null>(
    null
  );
  const [progressValue, setProgressValue] = useState(0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<NewQuestionResponsePair[]>([]);
  const [authenticationDialogOpen, setAuthenticationDialogOpen] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasCheckedSubmission, setHasCheckedSubmission] = useState(false);

  useEffect(() => {
    if (responses.length > 0) {
      void onSubmit();
    }
  }, [responses]);

  const eventID = extractId(pathname);
  useEffect(() => {
    const fetchData = async () => {
      const client = getClient();

      const vars: RegistrationFormQueryVariables = {
        eventID: eventID!,
      };

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

    void fetchData();
  }, [router]);

  useEffect(() => {
    if (regForm) {
      setProgressValue((100 / (regForm.questions.length - 1)) * index);
    }
  }, [index, regForm]);

  useEffect(() => {
    const checkSubmission = async () => {
      if (!user) return;

      try {
        const client = getClient();

        const data = await client.request<CheckExistingApplicationQuery>(CheckExistingApplicationDocument, {id: user.ID});
        const submitted = data.users[0]?.applications?.some((app: {
          event: { ID: number }
        }) => app.event.ID === eventID);

        if (submitted) setHasSubmitted(true);
      } catch (err) {
        console.error("Error checking submissions", err);
      } finally {
        setHasCheckedSubmission(true);
      }
    }
    void checkSubmission();
  }, [user, eventID]);

  const mcForm = useForm<z.infer<ReturnType<typeof MultipleChoiceFormSchema>>>({
    resolver: zodResolver(
      MultipleChoiceFormSchema(regForm?.questions[index].required ?? false)
    ),
    defaultValues: {
      multipleChoice: [],
    },
  });

  const scForm = useForm<z.infer<ReturnType<typeof SingleChoiceFormSchema>>>({
    resolver: zodResolver(
      SingleChoiceFormSchema(regForm?.questions[index].required ?? false)
    ),
    defaultValues: {
      singleChoice: undefined,
    },
  });

  function handleQuit() {
    router.push(pathname.replace(/\/register$/, ""))
  }

  const onSubmit = async () => {
    if (!user) {
      toast.error('Ein Fehler beim Speichern des Formulars ist aufgetreten. Bitte melde dich erneut an.')
      return;
    }

    if (regForm?.questions.length !== index + 1) {
      setIndex((prevIndex) => prevIndex + 1);
      return;
    }

    const application: NewUserToEventApplication = {
      userID: user.ID,
      eventID: +eventID!,
      answers: responses,
    };

    const vars: AddStudentApplicationForEventMutationVariables = {
      application: application,
    };

    try {
      const client = getClient(sid!);
      await client.request<AddStudentApplicationForEventMutation>(
        AddStudentApplicationForEventDocument,
        vars
      );
      toast.success("Anmeldung abgeschickt!");
    } catch {
      toast.error("Ein Fehler ist aufgetreten");
    } finally {
      handleQuit();
    }
  };

  function onScaleSubmit() {
    const res: NewQuestionResponsePair = {
      questionID: regForm?.questions[index].ID || 0,
      value: String(sliderValue),
    };
    setResponses((prevResponses) => [...prevResponses, res]);

    setSliderValue(0);
  }

  function onMCSubmit(
    data: z.infer<ReturnType<typeof MultipleChoiceFormSchema>>
  ) {
    const newResponses = data.multipleChoice!.map((id) => ({
      questionID: regForm?.questions[index].ID || 0,
      answerID: id,
    }));
    setResponses((prevResponses) => [...prevResponses, ...newResponses]);
  }

  function onSCSubmit(
    data: z.infer<ReturnType<typeof SingleChoiceFormSchema>>
  ) {
    const res: NewQuestionResponsePair = {
      questionID: regForm?.questions[index].ID || 0,
      answerID: data.singleChoice!,
    };
    setResponses((prevResponses) => [...prevResponses, res]);
  }

  const FooterButtons = () => (
    <div className="flex justify-between w-full">
      <DialogClose asChild>
        <Button type="button" variant="outline" className="w-auto">
          Abbrechen
        </Button>
      </DialogClose>
      {regForm?.questions.length !== index + 1 ? (
        <Button type="submit" className="w-auto">
          Nächste Frage
        </Button>
      ) : (
        <DialogClose asChild>
          <Button type="submit" className="w-auto">
            Anmelden
          </Button>
        </DialogClose>
      )}
    </div>
  );

  return (
    <>
      <AuthenticationDialog
        open={authenticationDialogOpen}
        onOpenChange={(open) => {
          if (!open) setAuthenticationDialogOpen(false)
        }}
      />

      {!user && !authenticationDialogOpen ? (
        <div className={'flex flex-col justify-center items-center'}>
          <p className={'text-center my-8'}>Das Quiz kann nur ausgefüllt werden, wenn Du angemeldet bist</p>
          <div className={'w-full flex items-center justify-evenly'}>
            <DialogClose asChild>
              <Button variant={'secondary'}>
                Abbrechen
              </Button>
            </DialogClose>
            <Button
              onClick={() => setAuthenticationDialogOpen(true)}
              className={'flex items-center gap-2'}
            >
              <LogIn/>
              Anmelden
            </Button>
          </div>
        </div>
      ) : hasSubmitted && !authenticationDialogOpen ? (
        <div className="flex flex-col justify-center items-center">
          <div className="text-center my-8">
            Deine Registrierung zu diesem Event ist bereits eingegangen.
          </div>
        </div>
      ) : loading || (!user && !authenticationDialogOpen) || !hasCheckedSubmission ? (
        <CardSkeleton/>
      ) : (
        <>
          {modal && (
            <>
              <DialogTitle>{regForm?.title}</DialogTitle>
              <DialogDescription>{regForm?.description}</DialogDescription>
            </>
          )}
          <div className="space-y-4">
            {!modal && (
              <div>
                <h1>{regForm?.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {regForm?.description}
                </p>
              </div>
            )}
            <Progress value={progressValue}/>
            <Card className={modal ? "w-full" : "w-[500px]"}>
              <CardHeader>
                <CardTitle>{regForm?.questions[index].title}</CardTitle>
              </CardHeader>
              {regForm?.questions[index].type ===
                QuestionType.MultipleChoice && (
                  <Form {...mcForm}>
                    <form onSubmit={mcForm.handleSubmit(onMCSubmit)}>
                      <CardContent>
                        <div className="mt-8 mb-8">
                          <FormField
                            control={mcForm.control}
                            name="multipleChoice"
                            render={() => (
                              <FormItem>
                                {regForm?.questions[index].answers.map(
                                  (answer) => (
                                    <FormField
                                      key={answer.ID}
                                      control={mcForm.control}
                                      name="multipleChoice"
                                      render={({field}) => (
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
                                                      ...(field.value || []),
                                                      answer.ID,
                                                    ])
                                                    : field.onChange(
                                                      field.value?.filter(
                                                        (value) =>
                                                          value !== answer.ID
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
                                  )
                                )}
                                <FormMessage/>
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <FooterButtons/>
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
                          render={({field}) => (
                            <FormItem>
                              <RadioGroup
                                value={field.value?.toString()}
                                onValueChange={(value) =>
                                  field.onChange(parseInt(value, 10))
                                }
                              >
                                {regForm.questions[index].answers.map(
                                  (answer) => (
                                    <div
                                      key={answer.ID}
                                      className="flex items-center space-x-2"
                                    >
                                      <RadioGroupItem
                                        value={answer.ID.toString()}
                                      />
                                      <label
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {answer.title}
                                      </label>
                                    </div>
                                  )
                                )}
                              </RadioGroup>
                              <FormMessage/>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <FooterButtons/>
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
                    <FooterButtons/>
                  </CardFooter>
                </form>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
