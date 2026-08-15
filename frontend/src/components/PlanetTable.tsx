"use client";

import { useNames } from "@/lib/names";

interface Planet {
  name: string;
  sign: string;
  degree_in_sign: number;
  nakshatra: string;
  pada: number;
  house: number;
  retrograde: boolean;
}

export function PlanetTable({
  planets,
  ascendant,
}: {
  planets: Planet[];
  ascendant: any;
}) {
  const { planet, sign, nak } = useNames();
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-accent text-left border-b border-white/20">
          <th className="py-2">Body</th>
          <th>Sign</th>
          <th>Deg</th>
          <th>Nakshatra</th>
          <th>Pada</th>
          <th>House</th>
          <th>R</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-white/10 font-semibold">
          <td className="py-2">{planet("Ascendant")}</td>
          <td>{sign(ascendant.sign)}</td>
          <td>{ascendant.degree_in_sign.toFixed(2)}</td>
          <td>{nak(ascendant.nakshatra)}</td>
          <td>{ascendant.pada}</td>
          <td>1</td>
          <td></td>
        </tr>
        {planets.map((p) => (
          <tr key={p.name} className="border-b border-white/10">
            <td className="py-2">{planet(p.name)}</td>
            <td>{sign(p.sign)}</td>
            <td>{p.degree_in_sign.toFixed(2)}</td>
            <td>{nak(p.nakshatra)}</td>
            <td>{p.pada}</td>
            <td>{p.house}</td>
            <td>{p.retrograde ? "℞" : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
