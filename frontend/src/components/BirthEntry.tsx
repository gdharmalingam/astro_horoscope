"use client";

import type { BirthData, Profile } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { ClockTimePicker } from "./ClockTimePicker";
import { DateField } from "./DateField";
import { LocationField, type LocationValue } from "./LocationField";
import { ProfileQuickButton } from "./ProfileQuickButton";

export interface BirthValue {
  name: string;
  sex?: "male" | "female";
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  location: LocationValue;
}

export function toBirthData(v: BirthValue): BirthData {
  return {
    name: v.name || undefined,
    sex: v.sex,
    birth_datetime_local: `${v.date}T${v.time}:00`,
    timezone: v.location.timezone,
    latitude: Number(v.location.latitude),
    longitude: Number(v.location.longitude),
  };
}

export function profileToBirthValue(p: Profile): BirthValue {
  const [d, tm] = (p.birth_datetime_local || "").split("T");
  return {
    name: p.name || "",
    sex: p.sex === "male" || p.sex === "female" ? p.sex : undefined,
    date: d || "",
    time: tm ? tm.slice(0, 5) : "",
    location: {
      latitude: p.latitude,
      longitude: p.longitude,
      timezone: p.timezone,
      place_name: p.place_name || "",
    },
  };
}

interface Props {
  value: BirthValue;
  onChange: (v: BirthValue) => void;
  showSex?: boolean;
  showProfileButton?: boolean;
}

export function BirthEntry({
  value,
  onChange,
  showSex = true,
  showProfileButton = false,
}: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="block text-sm">
        {t("name")}
        <div className="mt-1 flex gap-2">
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder={t("namePlaceholder")}
            className="flex-1 px-3 py-2 rounded bg-black/30 border border-white/10"
          />
          {showProfileButton && (
            <ProfileQuickButton
              current={value}
              onLoad={(p) => onChange(profileToBirthValue(p))}
            />
          )}
        </div>
      </div>

      {showSex && (
        <div className="flex items-center gap-3 text-sm">
          <span>{t("sex")}</span>
          <div className="inline-flex rounded-lg overflow-hidden border border-white/15">
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...value, sex: s })}
                className={`px-4 py-2 text-sm ${
                  value.sex === s
                    ? "bg-accent text-cosmic font-semibold"
                    : "bg-black/30 hover:bg-white/10"
                }`}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm">
        {t("birthDate")} <span className="opacity-50 text-xs">(dd/mm/yyyy)</span>
        <div className="mt-1">
          <DateField
            value={value.date}
            onChange={(date) => onChange({ ...value, date })}
          />
        </div>
      </div>

      <div className="text-sm">
        {t("birthTime")}
        <div className="mt-1">
          <ClockTimePicker
            value={value.time}
            onChange={(time) => onChange({ ...value, time })}
          />
        </div>
      </div>

      <LocationField
        value={value.location}
        onChange={(location) => onChange({ ...value, location })}
      />
    </div>
  );
}
