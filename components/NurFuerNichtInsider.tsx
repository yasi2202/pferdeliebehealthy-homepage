"use client";

import { useEffect, useState } from "react";
import { istInsider } from "@/lib/insider-merker";

// ---------------------------------------------------------------------------
// Blendet die Anmelde-Aufforderung für Leute aus, die schon Insider sind.
//
// Wichtig ist die Reihenfolge: Der Inhalt wird zuerst ganz normal
// ausgeliefert und erst nach dem Laden im Browser wieder entfernt. Andersherum
// — erst nichts zeigen, dann bei Bedarf einblenden — bekämen Google und die
// Vorschau beim Teilen eine Seite ohne Anmeldung zu sehen, und das ist der
// wichtigste Teil der Seite.
//
// Für Insider blitzt der Kasten dadurch einen Moment auf. Das ist der
// richtige Kompromiss: ein kurzes Aufblitzen für die, die schon dabei sind,
// statt einer unsichtbaren Anmeldung für alle anderen.
// ---------------------------------------------------------------------------

export default function NurFuerNichtInsider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dabei, setDabei] = useState(false);

  useEffect(() => {
    setDabei(istInsider());
  }, []);

  if (dabei) return null;
  return <>{children}</>;
}
