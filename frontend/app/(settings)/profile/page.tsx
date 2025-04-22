"use client";

import { Separator } from "@/components/ui/separator";

export default function SettingsProfilePage() {

  const [personInfo, Spi] =useState("test@email.de");
  const [dialogTy ,setdialogTy] =useState(false);
  const [EmailDl, setEmaiDl] = useState(false);
  const [umbrella, setUmbrella] = useState<Event | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: umbrella?.title ?? "",
    },
  });

  function sendVerifikationEmail(data: z.infer<typeof FormSchema>) {
    Spi(data.title);
    setEmaiDl(false);
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Einstellungen</h3>
        <p className="text-sm text-muted-foreground">
          Passe deine persönlichen Informationen an.
        </p>
      </div>

      <Separator />
      <h3> Email:  {personInfo}</h3>
         
      <Dialog open={EmailDl} onOpenChange={setEmaiDl}>
        <DialogTrigger asChild>
          <Button //variant="ghost" 
          > change E-Mail
          </Button>
        </DialogTrigger>
        <DialogContent >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(sendVerifikationEmail)}
              className="w-2/3 space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                      <FormControl>
                        <Input
                          placeholder={"Name"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Helper text
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                Sende verifikation E-Mail
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      
      {"\n"}
      <Dialog open={false} onOpenChange={false}>
      <DialogTrigger asChild>
          <Button //variant="ghost" 
          > Change Passwort
          </Button>
        </DialogTrigger>
      </Dialog>

      {"\n"}
      <Dialog open={false} onOpenChange={false}>
      <DialogTrigger asChild>
          <Button //variant="ghost" 
          > delete Account
          </Button>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}
