import { permanentRedirect } from "next/navigation";

// Die Übersicht lag kurzzeitig unter /angebote. Sie steht jetzt unter /shop,
// weil dort auch der Menüpunkt hinführt. Diese Weiterleitung bleibt, damit
// ein Link, der schon irgendwo steht, nicht ins Leere führt.
export default function AngeboteWeiterleitung() {
  permanentRedirect("/shop");
}
