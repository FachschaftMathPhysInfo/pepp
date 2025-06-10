export default function RegistrationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-3xl font-bold">Veranstaltungsverwaltung</h3>
        <p className="text-sm text-muted-foreground">
          Bearbeite deine Anmeldungen zu Veranstaltungen.
        </p>
      </div>
      {children}
    </div>
  );
}
